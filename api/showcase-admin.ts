/**
 * Vercel Serverless：用 Service Role 绕过 RLS，供管理页 list / update / delete。
 *
 * 鉴权流程（防止前端 bundle 泄露 PIN 即被攻破）：
 *   1. PIN 仅在服务端存在（环境变量 ADMIN_PIN；为兼容旧部署也读 VITE_ADMIN_PIN，强烈不推荐继续使用）。
 *   2. 前端先调 op:"login" 用 PIN 换取一枚短期 HMAC 会话 token；token 才是后续写操作的真实凭证。
 *   3. list / update / delete 仅校验 token，不再接受 pin。
 *   4. 登录路径基于客户端 IP 做 best-effort 速率限制（防扫描暴破）。
 *
 * 必需环境变量：
 *   - VITE_SUPABASE_URL          Supabase 项目 URL
 *   - SUPABASE_SERVICE_ROLE_KEY  service_role 密钥
 *   - ADMIN_PIN                  管理员 PIN（仅服务端，**不要**加 VITE_ 前缀）
 *   - ADMIN_SESSION_SECRET       会话 token HMAC 密钥（建议 32+ 字符随机串）
 */
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

import {
  parseCompositionCode,
  type CompositionCode
} from "../src/lib/composition";
import type { ShowcaseSubmission } from "../src/types/submission";

/** Vercel Node 运行时请求/响应的最小形状（避免依赖 @vercel/node） */
type ApiRequest = {
  method?: string;
  body?: string | Record<string, unknown>;
  headers?: Record<string, string | string[] | undefined>;
};
type ApiResponse = {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: Record<string, unknown>) => void;
};

/* ────────────────────────────────────────
   会话 token：HMAC-SHA256 签发的短期凭证
──────────────────────────────────────── */
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 小时

function getServerPin(): string {
  return (process.env.ADMIN_PIN ?? process.env.VITE_ADMIN_PIN ?? "").trim();
}

function getSessionSecret(): string {
  // 建议显式配置 ADMIN_SESSION_SECRET；未配置时降级派生（不推荐用于生产）
  const explicit = process.env.ADMIN_SESSION_SECRET?.trim();
  if (explicit) return explicit;
  return `pin-fallback:${getServerPin()}`;
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function timingEqualString(a: string, b: string): boolean {
  // 等长才用 timingSafeEqual；不等长则用同尺寸假比较保持常量时间，最终返回 false
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) {
    const filler = Buffer.alloc(Math.max(ab.length, bb.length, 1));
    crypto.timingSafeEqual(filler, filler);
    return false;
  }
  return crypto.timingSafeEqual(ab, bb);
}

function signToken(secret: string, exp: number): string {
  const payload = `admin|${exp}`;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest();
  return `${b64url(Buffer.from(payload, "utf8"))}.${b64url(sig)}`;
}

function verifyToken(secret: string, token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  let payload: string;
  let actual: Buffer;
  try {
    payload = b64urlDecode(parts[0]).toString("utf8");
    actual = b64urlDecode(parts[1]);
  } catch {
    return false;
  }
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest();
  if (expected.length !== actual.length) return false;
  if (!crypto.timingSafeEqual(expected, actual)) return false;
  const m = /^admin\|(\d+)$/.exec(payload);
  if (!m) return false;
  const exp = Number(m[1]);
  return Number.isFinite(exp) && Date.now() < exp;
}

/* ────────────────────────────────────────
   登录速率限制：按客户端 IP，单实例内存（best-effort）
   - 5 分钟窗口内 ≥5 次失败即锁定 15 分钟
   - Vercel 冷启动会重置；用于挡脚本扫描已足够
──────────────────────────────────────── */
const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX = 5;
const RATE_LOCK_MS = 15 * 60 * 1000;

type RateEntry = { count: number; resetAt: number; lockedUntil: number };
const RATE_LIMIT = new Map<string, RateEntry>();

function getClientKey(req: ApiRequest): string {
  const headers = req.headers ?? {};
  const xff = headers["x-forwarded-for"];
  const first = Array.isArray(xff) ? xff[0] : xff;
  const ip = (first ?? "").toString().split(",")[0]?.trim();
  return ip || "unknown";
}

type RateCheck = { allowed: boolean; retryAfterMs: number };

function checkRate(key: string): RateCheck {
  const now = Date.now();
  const e = RATE_LIMIT.get(key);
  if (e && e.lockedUntil > now) {
    return { allowed: false, retryAfterMs: e.lockedUntil - now };
  }
  if (!e || now > e.resetAt) {
    RATE_LIMIT.set(key, {
      count: 1,
      resetAt: now + RATE_WINDOW_MS,
      lockedUntil: 0
    });
    return { allowed: true, retryAfterMs: 0 };
  }
  e.count += 1;
  if (e.count > RATE_MAX) {
    e.lockedUntil = now + RATE_LOCK_MS;
    return { allowed: false, retryAfterMs: RATE_LOCK_MS };
  }
  return { allowed: true, retryAfterMs: 0 };
}

function resetRate(key: string) {
  RATE_LIMIT.delete(key);
}

type DbRow = {
  id: string;
  game_name: string;
  creator_nickname: string | null;
  gameplay: string;
  card_summary: string | null;
  gameplay_source: string | null;
  tech_stack: unknown;
  evolution: string;
  deploy_url: string;
  thumbnail_url: string;
  created_at: string;
  is_visible: boolean | null;
  source: string | null;
};

function rowToSubmission(row: DbRow): ShowcaseSubmission {
  const stack = Array.isArray(row.tech_stack)
    ? (row.tech_stack as string[])
    : [];
  const gs = row.gameplay_source;
  const gameplaySource =
    gs === "ai" || gs === "local" || gs === "manual" ? gs : undefined;
  return {
    id: row.id,
    gameName: row.game_name,
    gameplay: row.gameplay,
    cardSummary: row.card_summary?.trim() || undefined,
    gameplaySource,
    techStack: stack,
    evolution: row.evolution,
    composition: parseCompositionCode(row.creator_nickname),
    deployUrl: row.deploy_url,
    thumbnailUrl: row.thumbnail_url,
    createdAt: row.created_at,
    is_visible: row.is_visible !== false,
    source: row.source === "mock" ? "mock" : "user"
  };
}

function patchToSnake(
  patch: Partial<Omit<ShowcaseSubmission, "id" | "source" | "createdAt">>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.gameName !== undefined) out.game_name = patch.gameName;
  if (patch.gameplay !== undefined) out.gameplay = patch.gameplay;
  if (patch.cardSummary !== undefined) out.card_summary = patch.cardSummary ?? null;
  if (patch.gameplaySource !== undefined)
    out.gameplay_source = patch.gameplaySource ?? null;
  if (patch.techStack !== undefined) out.tech_stack = patch.techStack;
  if (patch.evolution !== undefined) out.evolution = patch.evolution;
  if (patch.composition !== undefined) {
    const code: CompositionCode | undefined = patch.composition;
    out.creator_nickname = code ?? null;
  }
  if (patch.deployUrl !== undefined) out.deploy_url = patch.deployUrl;
  if (patch.thumbnailUrl !== undefined) out.thumbnail_url = patch.thumbnailUrl;
  if (patch.is_visible !== undefined) out.is_visible = patch.is_visible;
  return out;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const url = process.env.VITE_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const expectedPin = getServerPin();
  const sessionSecret = getSessionSecret();

  if (!url || !serviceKey) {
    res.status(500).json({
      ok: false,
      error: "缺少 VITE_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY"
    });
    return;
  }
  if (!expectedPin) {
    res
      .status(500)
      .json({ ok: false, error: "服务端未配置 ADMIN_PIN" });
    return;
  }

  let body: {
    op?: string;
    pin?: string;
    token?: string;
    id?: string;
    patch?: Partial<Omit<ShowcaseSubmission, "id" | "source" | "createdAt">>;
  };
  try {
    const raw = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    body = raw ?? {};
  } catch {
    res.status(400).json({ ok: false, error: "Invalid JSON" });
    return;
  }

  /* ── op:login —— 用 PIN 换取短期 token ── */
  if (body.op === "login") {
    const key = getClientKey(req);
    const limit = checkRate(key);
    if (!limit.allowed) {
      res.setHeader(
        "Retry-After",
        String(Math.ceil(limit.retryAfterMs / 1000))
      );
      res.status(429).json({
        ok: false,
        error: "尝试过于频繁，请稍后再试",
        retryAfterMs: limit.retryAfterMs
      });
      return;
    }
    const ok =
      typeof body.pin === "string" && timingEqualString(body.pin, expectedPin);
    if (!ok) {
      // 错误响应不透露任何细节（避免暴破时探测信息）
      res.status(401).json({ ok: false, error: "未授权" });
      return;
    }
    resetRate(key);
    const exp = Date.now() + TOKEN_TTL_MS;
    res
      .status(200)
      .json({ ok: true, token: signToken(sessionSecret, exp), exp });
    return;
  }

  /* ── 其它 op：必须携带有效 token ── */
  if (!body.token || !verifyToken(sessionSecret, body.token)) {
    res.status(401).json({ ok: false, error: "未授权" });
    return;
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  try {
    if (body.op === "list") {
      const { data, error } = await admin
        .from("showcase_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const items = (data ?? []).map((r) => rowToSubmission(r as DbRow));
      res.status(200).json({ ok: true, items });
      return;
    }

    if (body.op === "delete") {
      if (!body.id) {
        res.status(400).json({ ok: false, error: "缺少 id" });
        return;
      }
      const { data, error } = await admin
        .from("showcase_submissions")
        .delete()
        .eq("id", body.id)
        .select("id");
      if (error) throw error;
      // 与 update 相同的诊断：DELETE 返回 0 行时，探测 id 是否真的存在
      if (!data || data.length === 0) {
        const { data: probe } = await admin
          .from("showcase_submissions")
          .select("id")
          .eq("id", body.id)
          .maybeSingle();
        if (probe) {
          res.status(500).json({
            ok: false,
            error:
              "DELETE 被 RLS 拦截：请确认 Vercel 环境变量 SUPABASE_SERVICE_ROLE_KEY " +
              "是 Supabase → Settings → API → service_role（jwt.io 解码 role 应为 \"service_role\"），而不是 anon key。"
          });
          return;
        }
        res.status(404).json({ ok: false, error: "记录不存在，无法删除" });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    }

    if (body.op === "update") {
      if (!body.id || !body.patch) {
        res.status(400).json({ ok: false, error: "缺少 id 或 patch" });
        return;
      }
      const snake = patchToSnake(body.patch);
      if (Object.keys(snake).length === 0) {
        res.status(400).json({ ok: false, error: "patch 为空" });
        return;
      }
      const { data, error } = await admin
        .from("showcase_submissions")
        .update(snake as never)
        .eq("id", body.id)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        // 区分两种 "UPDATE 返回 0 行" 场景：
        // 1) id 真的不在表里 → 前端列表与 DB 不一致（极少见）
        // 2) id 在表里，但此次 UPDATE 被 RLS 拦截 → 通常意味着 SUPABASE_SERVICE_ROLE_KEY
        //    实际是 anon key（service_role 会绕过 RLS，不会出现这种情况）
        const { data: probe } = await admin
          .from("showcase_submissions")
          .select("id")
          .eq("id", body.id)
          .maybeSingle();
        if (probe) {
          res.status(500).json({
            ok: false,
            error:
              "UPDATE 被 RLS 拦截：请确认 Vercel 环境变量 SUPABASE_SERVICE_ROLE_KEY " +
              "是 Supabase → Settings → API → service_role（jwt.io 解码 role 应为 \"service_role\"），而不是 anon key。"
          });
          return;
        }
        res.status(404).json({
          ok: false,
          error: `记录不存在（id=${String(body.id).slice(0, 8)}…）。若 /admin 列表里有这行，可能访问的是另一个 Supabase 项目，请核对 VITE_SUPABASE_URL。`
        });
        return;
      }
      res.status(200).json({ ok: true, item: rowToSubmission(data as DbRow) });
      return;
    }

    res.status(400).json({ ok: false, error: "未知 op" });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: e instanceof Error ? e.message : "服务器错误"
    });
  }
}

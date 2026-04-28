/**
 * Vercel Serverless：用 Service Role 绕过 RLS，供管理页 list / update / delete。
 *
 * 环境变量（必填）：
 *   - VITE_SUPABASE_URL          Supabase 项目 URL（前端共用，沿用 VITE_ 前缀）
 *   - SUPABASE_SERVICE_ROLE_KEY  service_role 密钥，绕过 RLS
 *   - ADMIN_PIN                  管理员 PIN（仅服务端，**不带** VITE_ 前缀）
 *
 * 鉴权：前端在 /admin 登录时已用 VITE_ADMIN_PIN 比对，再把 PIN 透传到这里；
 *      此处用 ADMIN_PIN（服务端独立变量）做最终拦截。两个值务必保持一致。
 */
import { createClient } from "@supabase/supabase-js";

/* ────────────────────────────────────────
   类型与工具：本文件保持自包含
   ——历史上从 ../src/lib/composition 与 ../src/types/submission 引入会让
   Vercel @vercel/nft 在跨目录追踪 + tsconfig moduleResolution:"bundler" 组合下
   漏打包源文件，导致 cold start 时 Cannot find module → FUNCTION_INVOCATION_FAILED。
──────────────────────────────────────── */

/** Vercel Node 运行时请求/响应的最小形状（避免依赖 @vercel/node） */
type ApiRequest = { method?: string; body?: string | Record<string, unknown> };
type ApiResponse = {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: Record<string, unknown>) => void;
};

/** 与 src/lib/composition.ts 保持一致：前端的"个人 / N 人团队" */
type CompositionCode =
  | "solo"
  | "team-2"
  | "team-3"
  | "team-4"
  | "team-5"
  | "team-6"
  | "team-7"
  | "team-8";

const VALID_COMPOSITION_CODES: ReadonlySet<string> = new Set([
  "solo",
  "team-2",
  "team-3",
  "team-4",
  "team-5",
  "team-6",
  "team-7",
  "team-8"
]);

function parseCompositionCode(
  input: string | null | undefined
): CompositionCode | undefined {
  if (!input) return undefined;
  const v = input.trim();
  return VALID_COMPOSITION_CODES.has(v) ? (v as CompositionCode) : undefined;
}

/** 与 src/types/submission.ts 字段一致；本文件只用一部分字段 */
type ShowcaseSubmission = {
  id: string;
  gameName: string;
  gameplay: string;
  cardSummary?: string;
  gameplaySource?: "manual" | "ai" | "local";
  techStack: string[];
  evolution: string;
  composition?: CompositionCode;
  deployUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  source: "mock" | "user";
  is_visible?: boolean;
};

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
  const expectedPin = process.env.ADMIN_PIN?.trim();

  if (!url || !serviceKey) {
    res.status(500).json({
      ok: false,
      error: "缺少 VITE_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY"
    });
    return;
  }
  if (!expectedPin) {
    res.status(500).json({
      ok: false,
      error:
        "服务端未配置 ADMIN_PIN（请在 Vercel → Settings → Environment Variables 添加 ADMIN_PIN，不带 VITE_ 前缀）"
    });
    return;
  }

  let body: {
    op?: string;
    pin?: string;
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

  if (!body?.pin || body.pin !== expectedPin) {
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

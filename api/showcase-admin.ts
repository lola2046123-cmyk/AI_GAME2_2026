/**
 * Vercel Serverless：用 Service Role 绕过 RLS，供管理页 list / update / delete。
 * 环境变量：VITE_SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY、VITE_ADMIN_PIN
 */
import { createClient } from "@supabase/supabase-js";

import type { ShowcaseSubmission } from "../src/types/submission";

/** Vercel Node 运行时请求/响应的最小形状（避免依赖 @vercel/node） */
type ApiRequest = { method?: string; body?: string | Record<string, unknown> };
type ApiResponse = {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: Record<string, unknown>) => void;
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
    creatorNickname: row.creator_nickname?.trim() || undefined,
    gameplay: row.gameplay,
    cardSummary: row.card_summary?.trim() || undefined,
    gameplaySource,
    techStack: stack,
    evolution: row.evolution,
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
  if (patch.creatorNickname !== undefined)
    out.creator_nickname = patch.creatorNickname || null;
  if (patch.gameplay !== undefined) out.gameplay = patch.gameplay;
  if (patch.cardSummary !== undefined) out.card_summary = patch.cardSummary ?? null;
  if (patch.gameplaySource !== undefined)
    out.gameplay_source = patch.gameplaySource ?? null;
  if (patch.techStack !== undefined) out.tech_stack = patch.techStack;
  if (patch.evolution !== undefined) out.evolution = patch.evolution;
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
  const expectedPin = process.env.VITE_ADMIN_PIN ?? "2026";

  if (!url || !serviceKey) {
    res.status(500).json({
      ok: false,
      error: "缺少 VITE_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY"
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
      const { error } = await admin.from("showcase_submissions").delete().eq("id", body.id);
      if (error) throw error;
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
        res.status(404).json({ ok: false, error: "记录不存在" });
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

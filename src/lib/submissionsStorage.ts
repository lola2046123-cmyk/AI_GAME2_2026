import type { ShowcaseSubmission } from "../types/submission";
import { getAdminPin } from "./adminSession";
import { rowToShowcaseSubmission, submissionToInsertRow } from "./showcaseSubmissionMap";
import { getSupabaseAnon, isRemoteSubmissionMode } from "./supabaseClient";

const STORAGE_KEY = "ai_game_2026_showcase_submissions";

/** 将单条记录规范为完整形状（含 is_visible 默认） */
export function normalizeUserSubmission(
  raw: ShowcaseSubmission
): ShowcaseSubmission {
  return {
    ...raw,
    is_visible: raw.is_visible !== false
  };
}

function loadLocal(): ShowcaseSubmission[] {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return [];
    const parsed = JSON.parse(item) as ShowcaseSubmission[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeUserSubmission);
  } catch {
    return [];
  }
}

function saveLocalAll(list: ShowcaseSubmission[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** 兼容旧代码：无 Supabase 时同步读本地；有 Supabase 时请用 loadUserSubmissionsAsync */
export function loadUserSubmissions(): ShowcaseSubmission[] {
  if (isRemoteSubmissionMode()) return [];
  return loadLocal();
}

/** 全量列表（管理页）：本地为 localStorage；远端走 /api/showcase-admin */
export async function loadUserSubmissionsAsync(): Promise<ShowcaseSubmission[]> {
  if (!isRemoteSubmissionMode()) return loadLocal();
  const res = await fetch("/api/showcase-admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "list", pin: getAdminRequestPin() })
  });
  const json = (await res.json()) as { ok?: boolean; items?: ShowcaseSubmission[]; error?: string };
  if (!res.ok || !json.ok) {
    throw new Error(json.error ?? "无法加载投稿列表");
  }
  return (json.items ?? []).map(normalizeUserSubmission);
}

/** 展示页：仅「可见」用户稿（远端 RLS 已过滤，此处再保险） */
export async function loadVisibleSubmissionsForShowcaseAsync(): Promise<
  ShowcaseSubmission[]
> {
  const sb = getSupabaseAnon();
  if (!sb) return loadLocal().filter((r) => r.is_visible !== false);

  const { data, error } = await sb
    .from("showcase_submissions")
    .select("*")
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) =>
    normalizeUserSubmission(rowToShowcaseSubmission(row as never))
  );
}

function getAdminRequestPin(): string {
  return getAdminPin();
}

export async function appendSubmission(entry: ShowcaseSubmission): Promise<void> {
  const row = normalizeUserSubmission({
    ...entry,
    is_visible: entry.is_visible !== false
  });
  const sb = getSupabaseAnon();
  if (!sb) {
    const prev = loadLocal();
    saveLocalAll([row, ...prev]);
    return;
  }
  const { error } = await sb.from("showcase_submissions").insert(
    submissionToInsertRow(row) as Record<string, unknown>
  );
  if (error) {
    const parts = [error.message, error.code, error.hint, error.details]
      .filter((s): s is string => Boolean(s && s.trim()))
      .join(" · ");
    throw new Error(parts || "Supabase insert 失败");
  }
}

export async function updateSubmission(
  id: string,
  patch: Partial<Omit<ShowcaseSubmission, "id" | "source" | "createdAt">>
): Promise<ShowcaseSubmission | null> {
  if (!isRemoteSubmissionMode()) {
    const list = loadLocal();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const merged = normalizeUserSubmission({
      ...list[idx],
      ...patch,
      id: list[idx].id,
      source: "user",
      createdAt: list[idx].createdAt
    });
    const next = [...list];
    next[idx] = merged;
    saveLocalAll(next);
    return merged;
  }

  const res = await fetch("/api/showcase-admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      op: "update",
      pin: getAdminRequestPin(),
      id,
      patch
    })
  });
  const json = (await res.json()) as {
    ok?: boolean;
    item?: ShowcaseSubmission;
    error?: string;
  };
  if (!res.ok || !json.ok) {
    throw new Error(json.error ?? "更新失败");
  }
  return json.item ? normalizeUserSubmission(json.item) : null;
}

export async function deleteSubmission(id: string): Promise<void> {
  if (!isRemoteSubmissionMode()) {
    saveLocalAll(loadLocal().filter((r) => r.id !== id));
    return;
  }
  const res = await fetch("/api/showcase-admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op: "delete", pin: getAdminRequestPin(), id })
  });
  const json = (await res.json()) as { ok?: boolean; error?: string };
  if (!res.ok || !json.ok) {
    throw new Error(json.error ?? "删除失败");
  }
}

export async function setSubmissionVisibility(
  id: string,
  visible: boolean
): Promise<void> {
  await updateSubmission(id, { is_visible: visible });
}

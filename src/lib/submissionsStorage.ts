import type { ShowcaseSubmission } from "../types/submission";

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

export function loadUserSubmissions(): ShowcaseSubmission[] {
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

function saveAll(list: ShowcaseSubmission[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function appendSubmission(entry: ShowcaseSubmission) {
  const row = normalizeUserSubmission({
    ...entry,
    is_visible: entry.is_visible !== false
  });
  const prev = loadUserSubmissions();
  saveAll([row, ...prev]);
}

export function updateSubmission(
  id: string,
  patch: Partial<Omit<ShowcaseSubmission, "id" | "source" | "createdAt">>
): ShowcaseSubmission | null {
  const list = loadUserSubmissions();
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
  saveAll(next);
  return merged;
}

export function deleteSubmission(id: string) {
  const list = loadUserSubmissions().filter((r) => r.id !== id);
  saveAll(list);
}

export function setSubmissionVisibility(id: string, visible: boolean) {
  updateSubmission(id, { is_visible: visible });
}

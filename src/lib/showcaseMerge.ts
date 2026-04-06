import { MOCK_SHOWCASE } from "../data/mockShowcase";
import type { ShowcaseSubmission } from "../types/submission";
import { loadUserSubmissions } from "./submissionsStorage";

/** 仅参与前台展示的用户投稿（is_visible !== false） */
export function getVisibleUserSubmissions(): ShowcaseSubmission[] {
  return loadUserSubmissions().filter((r) => r.is_visible !== false);
}

/**
 * 列表展示：无可见用户数据时仅 6 条 mock；
 * 有可见用户数据时用户优先，补足至至少 6 条（用 mock 填充）。
 */
export function getShowcaseList(): ShowcaseSubmission[] {
  const user = getVisibleUserSubmissions();
  if (user.length === 0) return MOCK_SHOWCASE;

  const usedTitles = new Set(user.map((u) => u.gameName));
  const filler = MOCK_SHOWCASE.filter((m) => !usedTitles.has(m.gameName));
  const need = Math.max(0, 6 - user.length);
  return [...user, ...filler.slice(0, need)];
}

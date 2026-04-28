import { MOCK_SHOWCASE } from "../data/mockShowcase";
import type { ShowcaseSubmission } from "../types/submission";
import { sortShowcaseDesc } from "./showcaseSort";
import { loadUserSubmissions, loadVisibleSubmissionsForShowcaseAsync } from "./submissionsStorage";
import { isRemoteSubmissionMode } from "./supabaseClient";

/** 仅参与前台展示的用户投稿（is_visible !== false）— 仅本地模式 */
export function getVisibleUserSubmissions(): ShowcaseSubmission[] {
  return loadUserSubmissions().filter((r) => r.is_visible !== false);
}

/**
 * 列表展示：
 * - 无可见用户数据时以 6 条 mock 作为兜底示例；
 * - 一旦存在可见用户数据，即进入「正式参赛」展示，完全由用户稿占位，不再混入 mock，
 *   避免首位被「挤掉一条 mock」造成修改错觉。
 */
export async function getShowcaseListAsync(): Promise<ShowcaseSubmission[]> {
  const user = isRemoteSubmissionMode()
    ? await loadVisibleSubmissionsForShowcaseAsync()
    : getVisibleUserSubmissions();

  if (user.length === 0) return sortShowcaseDesc(MOCK_SHOWCASE);
  return sortShowcaseDesc(user);
}

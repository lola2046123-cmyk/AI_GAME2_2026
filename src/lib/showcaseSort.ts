import type { ShowcaseSubmission } from "../types/submission";

/**
 * 展示列表的稳定比较器：
 *   1) 主键：createdAt 倒序（最新在前）
 *   2) tiebreaker：id 字典序升序（保证同一毫秒提交的多条记录顺序一致）
 *
 * 为何不直接依赖后端 .order("created_at")：
 *   - 当多条记录 createdAt 完全相同时，PostgreSQL 不指定二级排序键，
 *     不同请求可能返回不同顺序，造成「不同访客看到的卡片排序不同」。
 *   - 这里在前端兜底做稳定排序，与是否调用 Supabase 无关。
 */
export function compareShowcaseDesc(
  a: ShowcaseSubmission,
  b: ShowcaseSubmission
): number {
  const ta = new Date(a.createdAt).getTime();
  const tb = new Date(b.createdAt).getTime();

  const taValid = Number.isFinite(ta);
  const tbValid = Number.isFinite(tb);
  if (taValid && tbValid && tb !== ta) return tb - ta;
  if (taValid && !tbValid) return -1;
  if (!taValid && tbValid) return 1;

  return a.id.localeCompare(b.id);
}

/** 返回一份按上述比较器稳定排序的新数组（不修改入参） */
export function sortShowcaseDesc<T extends ShowcaseSubmission>(items: T[]): T[] {
  return [...items].sort(compareShowcaseDesc);
}

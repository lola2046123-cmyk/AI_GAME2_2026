/**
 * 作品标签体系：玩法（9）+ 风格（6）= 15 个。
 * 用户提交时最多选择 3 个，作为筛选与展示的依据。
 */

export type ShowcaseTagCategory = "gameplay" | "style";

export type ShowcaseTagDef = {
  /** 标签值（中文，存入数据库与 URL） */
  value: string;
  /** 类别 */
  category: ShowcaseTagCategory;
};

export const SHOWCASE_TAGS: readonly ShowcaseTagDef[] = [
  { value: "解谜",      category: "gameplay" },
  { value: "策略",      category: "gameplay" },
  { value: "卡牌",      category: "gameplay" },
  { value: "叙事",      category: "gameplay" },
  { value: "动作",      category: "gameplay" },
  { value: "模拟",      category: "gameplay" },
  { value: "Roguelike", category: "gameplay" },
  { value: "休闲",      category: "gameplay" },
  { value: "博弈",      category: "gameplay" },

  { value: "像素",      category: "style" },
  { value: "3D",        category: "style" },
  { value: "极简",      category: "style" },
  { value: "复古",      category: "style" },
  { value: "手绘",      category: "style" },
  { value: "赛博",      category: "style" },
] as const;

export const TAG_CATEGORY_LABEL: Record<ShowcaseTagCategory, string> = {
  gameplay: "玩法",
  style: "风格",
};

/** 单作品最多标签数 */
export const MAX_TAGS_PER_SUBMISSION = 3;

/** 一组合法标签集合（用于校验） */
export const VALID_TAG_VALUES: ReadonlySet<string> = new Set(
  SHOWCASE_TAGS.map((t) => t.value)
);

/** 过滤掉非法 / 重复标签，并截断至上限 */
export function sanitizeTags(input: readonly string[] | undefined | null): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const v = raw.trim();
    if (!v || !VALID_TAG_VALUES.has(v) || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
    if (out.length >= MAX_TAGS_PER_SUBMISSION) break;
  }
  return out;
}

/** 按类别分组（用于 UI 渲染） */
export function groupTags(tags: readonly ShowcaseTagDef[] = SHOWCASE_TAGS) {
  const map = new Map<ShowcaseTagCategory, ShowcaseTagDef[]>();
  for (const t of tags) {
    const arr = map.get(t.category) ?? [];
    arr.push(t);
    map.set(t.category, arr);
  }
  return map;
}

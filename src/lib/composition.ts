/**
 * 创作团队构成（个人 / 团队 N 人）
 *
 * 编码持久化方案：复用数据库 creator_nickname 列，避免改后端表结构。
 *   - "solo"      → 个人开发
 *   - "team-2"…"team-8" → 团队 2–8 人
 *
 * 任何不在白名单内的旧值都视为 undefined（不展示），保证前端兼容。
 */

export type CompositionCode =
  | "solo"
  | "team-2"
  | "team-3"
  | "team-4"
  | "team-5"
  | "team-6"
  | "team-7"
  | "team-8";

const TEAM_SIZES = [2, 3, 4, 5, 6, 7, 8] as const;

/** 报名表单使用的选项列表，按短促胶囊横排 */
export const COMPOSITION_OPTIONS: { code: CompositionCode; label: string }[] = [
  { code: "solo", label: "个人" },
  ...TEAM_SIZES.map((n) => ({
    code: `team-${n}` as CompositionCode,
    label: `${n}人`
  }))
];

const VALID_CODES: ReadonlySet<string> = new Set(
  COMPOSITION_OPTIONS.map((o) => o.code)
);

/** 字符串 → CompositionCode（容错；非合法值返回 undefined） */
export function parseCompositionCode(
  input: string | null | undefined
): CompositionCode | undefined {
  if (!input) return undefined;
  const v = input.trim();
  return VALID_CODES.has(v) ? (v as CompositionCode) : undefined;
}

/** 详情页展示文案：「个人开发」/「N 人团队」 */
export function formatComposition(
  code: CompositionCode | undefined
): string | null {
  if (!code) return null;
  if (code === "solo") return "个人开发";
  const m = /^team-(\d+)$/.exec(code);
  if (!m) return null;
  return `${m[1]} 人团队`;
}

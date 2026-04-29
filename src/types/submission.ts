/**
 * 报名表单提交后的展示实体（本地持久化 + 可选缩略图）
 */

export type ShowcaseSubmission = {
  id: string;
  gameName: string;
  /** 核心玩法说明 */
  gameplay: string;
  /**
   * 首页卡片优先展示的短描述；由文档解析或手填后与玩法同步
   */
  cardSummary?: string;
  /**
   * 展示卡片摘要（纯文本/Markdown 均可）；优先于 cardSummary / gameplay
   */
  summary?: string;
  /**
   * manual：手填；
   * ai：历史数据（曾用 Gemini 总结）；
   * local：从文档本地启发式生成
   */
  gameplaySource?: "manual" | "ai" | "local";
  techStack: string[];
  /** AI 如何辅助突破边界 */
  evolution: string;
  /**
   * 创作团队构成（个人 / 团队 2-8 人），见 src/lib/composition.ts。
   * 持久化层复用 Supabase 的 creator_nickname 列，避免改后端表结构。
   *
   * 这里**故意**内联 string literal union，而不是 `import("../lib/composition").CompositionCode`，
   * 以避免 api/showcase-admin.ts 通过 type import 链路触发 esbuild 跨目录解析（在 Vercel 上
   * 曾导致函数初始化崩溃 → 返回 HTML 错误页）。前端 src/lib/composition.ts 中的
   * CompositionCode 与此 union 结构相同，可以互相赋值，无需同步重复声明的导出。
   */
  composition?:
    | "solo"
    | "team-2"
    | "team-3"
    | "team-4"
    | "team-5"
    | "team-6"
    | "team-7"
    | "team-8";
  deployUrl: string;
  /** 用户上传压缩图（data URL）、截图 API 返回的 URL，或站内 SVG 占位 */
  thumbnailUrl: string;
  createdAt: string;
  /** mock | user */
  source: "mock" | "user";
  /**
   * 是否在前端展示页显示；缺省为 true（兼容旧 localStorage）
   * mock 条目恒为 true
   */
  is_visible?: boolean;
};

/**
 * 报名表单提交后的展示实体（本地持久化 + 可选缩略图）
 */

export type ShowcaseSubmission = {
  id: string;
  gameName: string;
  /** 核心玩法说明 */
  gameplay: string;
  /**
   * 首页卡片优先展示的短描述；由 AI 解析回填后与玩法同步，用户可在表单内编辑玩法以更新
   */
  cardSummary?: string;
  /**
   * manual：手填；
   * ai：配置了 Gemini 并由其总结；
   * local：无 Key 时本地启发式从文档生成（不显示「AI Generated」徽章）
   */
  gameplaySource?: "manual" | "ai" | "local";
  techStack: string[];
  /** AI 如何辅助突破边界 */
  evolution: string;
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

/**
 * 报名表单提交后的展示实体（本地持久化 + 可选缩略图）
 */

export type ShowcaseSubmission = {
  id: string;
  gameName: string;
  /**
   * 创作者昵称（展示用）。支持组队提交：多位成员用 `, ` 逗号分隔，例如
   * `"小A, 小B, 小C"`；提交表单中会自动把中英文逗号/顿号归一化。上限 80 码位。
   */
  creatorNickname?: string;
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
  /**
   * 作品标签（玩法 / 风格），最多 3 个，用于展示页筛选。
   * 兼容旧数据：缺省视为空数组。
   */
  tags?: string[];
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

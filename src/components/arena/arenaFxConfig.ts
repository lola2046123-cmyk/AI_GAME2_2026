/**
 * AI 竞技场风全局微交互 — 可调参数（拖尾长度、边框转速等）
 * 颜色请优先用 CSS 变量：--color-primary-container、--color-on-background 等
 */

/** 自定义光标：跟随鼠标的缓动系数（越小拖尾感越强，越大越跟手） */
export const ARENA_CURSOR_LERP = 0.28;

/** Canvas 拖尾：最大轨迹点数（越大越长，略增开销） */
export const ARENA_TRAIL_MAX_POINTS = 56;

/** 每帧生命衰减（越大消失越快） */
export const ARENA_TRAIL_DECAY = 0.048;

/** 采样：与上一记录点的最小距离（px），防抖 + 控频 */
export const ARENA_TRAIL_MIN_DIST = 3.2;

/** 采样：最小时间间隔（ms） */
export const ARENA_TRAIL_MIN_MS = 10;

/** 线条最大宽度（px，随 life 衰减） */
export const ARENA_TRAIL_WIDTH_MAX = 2.85;

/** 线条末端最小宽度 */
export const ARENA_TRAIL_WIDTH_MIN = 0.35;

/** 主色 RGB（与 DESIGN.md Neon #00ffcc 一致，避免 Canvas 读 CSS 变量开销） */
export const ARENA_TRAIL_RGB = "0, 255, 204" as const;

/**
 * 卡片 conic 边框转速、按钮扫光周期：与 index.css 中
 * --arena-border-spin-duration / --arena-btn-shimmer-duration 保持数值一致。
 */
export const ARENA_BORDER_SPIN_S = 3.8;
export const ARENA_BTN_SHIMMER_S = 2.35;

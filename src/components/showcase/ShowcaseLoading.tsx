import { motion } from "motion/react";
import { Gamepad2 } from "lucide-react";

/**
 * 展示列表 / 首页的加载态：游戏主题微动画 + 骨架卡片网格。
 * 目的：在 `getShowcaseListAsync()` 返回前给出明确的"正在加载作品"反馈，
 *       而不是先闪一下"暂无参赛作品"的空态。
 */
type Props = {
  /** 骨架卡片数量，默认 6（与首页"最新参赛"栅格一致）；传 0 只渲染动画头 */
  count?: number;
  /** 是否渲染顶部的游戏手柄 + 像素方块动画 */
  showHeader?: boolean;
  /** 辅助说明文字，默认英文 Loading */
  label?: string;
  /** 控制栅格列数（默认 sm:2 / lg:3） */
  columnsClass?: string;
  /** role="status" 的 aria-label，默认"正在加载参赛作品" */
  ariaLabel?: string;
};

const PIXEL_DELAYS = [0, 0.12, 0.24, 0.36, 0.48];

export function ShowcaseLoading({
  count = 6,
  showHeader = true,
  label = "Loading showcase…",
  columnsClass = "grid-cols-1 gap-6 sm:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8",
  ariaLabel = "正在加载参赛作品"
}: Props) {
  return (
    <div
      className="w-full"
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      {showHeader && (
        <div className="mb-10 flex flex-col items-center justify-center gap-4 md:mb-12">
          <motion.div
            className="relative flex items-center justify-center"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <div
              className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,rgba(0,255,204,0.22),transparent_70%)] blur-xl"
              aria-hidden
            />
            <div className="rounded-2xl border border-[#00ffcc]/25 bg-[#00ffcc]/[0.08] p-3.5 shadow-[0_0_40px_-10px_rgba(0,255,204,0.5)]">
              <Gamepad2 className="h-6 w-6 text-primary" strokeWidth={1.8} />
            </div>
          </motion.div>

          <div className="flex items-end gap-1.5" aria-hidden>
            {PIXEL_DELAYS.map((delay, i) => (
              <motion.span
                key={i}
                className="block h-3 w-3 rounded-sm bg-[#00ffcc]/80 shadow-[0_0_12px_rgba(0,255,204,0.4)]"
                animate={{
                  opacity: [0.25, 1, 0.25],
                  scaleY: [0.55, 1, 0.55]
                }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay
                }}
              />
            ))}
          </div>

          <p className="font-label text-[10px] uppercase tracking-[0.28em] text-white/45">
            {label}
          </p>
        </div>
      )}

      {count > 0 && <div className={`grid ${columnsClass}`} aria-hidden>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.025]"
          >
            <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-white/[0.02]">
              <motion.div
                className="absolute inset-0 bg-white/[0.03]"
                animate={{ opacity: [0.4, 0.75, 0.4] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.08
                }}
              />
            </div>
            <div className="space-y-2.5 p-4 md:p-5">
              <motion.div
                className="h-4 w-3/4 rounded bg-white/[0.06]"
                animate={{ opacity: [0.45, 0.8, 0.45] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.1 + i * 0.08
                }}
              />
              <motion.div
                className="h-3 w-full rounded bg-white/[0.05]"
                animate={{ opacity: [0.45, 0.75, 0.45] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.18 + i * 0.08
                }}
              />
              <motion.div
                className="h-3 w-2/3 rounded bg-white/[0.04]"
                animate={{ opacity: [0.45, 0.7, 0.45] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.26 + i * 0.08
                }}
              />
            </div>
          </div>
        ))}
      </div>}

      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}

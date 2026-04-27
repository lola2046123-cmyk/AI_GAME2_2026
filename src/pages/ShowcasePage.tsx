import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { SectionTitleEnDecor } from "../components/SectionTitleEnDecor";
import { ShowcaseCard } from "../components/showcase/ShowcaseCard";
import { ShowcaseEmpty } from "../components/showcase/ShowcaseEmpty";
import { ShowcaseLoading } from "../components/showcase/ShowcaseLoading";
import { ShowcaseStatBar } from "../components/showcase/ShowcaseStatBar";
import { useFluidVfx } from "../components/showcase/useFluidVfx";
import { getShowcaseListAsync } from "../lib/showcaseMerge";
import showcaseHeroBg from "../../imge/game_bg8.jpg";
import type { ShowcaseSubmission } from "../types/submission";

/* ─────────────── 获奖状态（生产环境可从 DB 读取） ─────────────── */
const AWARD_STATUS: Record<string, "winner" | "finalist"> = {
  "mock-stellar": "winner",
  "mock-echoes": "finalist",
  "mock-bonsai": "finalist"
};

/* ─────────────── 页面主体 ─────────────── */
export function ShowcasePage() {
  const { key } = useLocation();
  const [items, setItems] = useState<ShowcaseSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  /** 在 hero 图上叠加稳定流体模拟（鼠标即可触发；不影响布局/点击/滚动） */
  const heroImgRef = useRef<HTMLImageElement | null>(null);
  useFluidVfx(heroImgRef);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void getShowcaseListAsync()
      .then((list) => {
        if (!cancelled) {
          setItems(list);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "加载失败");
          setItems([]);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [key]);

  /** 按最新时间排序 */
  const filtered = useMemo(
    () => [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [items]
  );

  return (
    <>
      {/* 注意：这里刻意不加 bg-background。
          AppChrome 的 root 已经有全站 bg-background 兜底；
          流体模拟的 canvas 走 z-index:5（介于 root bg 与 z-10 页面内容之间），
          只有去掉 main 的实色背景，canvas 才能透出来给 hero 用。 */}
      <main className="relative min-w-0 overflow-hidden pb-[max(5rem,calc(env(safe-area-inset-bottom,0px)+4.5rem))] md:pb-28">

        {/* 首屏 Hero ─ 背景图 + 遮罩 + 底部渐变 + 垂直居中内容
            高度策略：移动端固定 min-h，避免 82vh 在低分辨率手机上撑太高；
            背景图直接放在 header 内（不再嵌套额外 div），
            VFX canvas（position:fixed）测量 img 的 getBoundingClientRect 更准确。 */}
        <header className="relative isolate flex min-h-[22rem] w-full min-w-0 flex-col overflow-hidden sm:min-h-[27rem] md:min-h-[34rem] lg:min-h-[40rem]">

          {/* 背景图（流体模拟基底）：直接作为 header 子元素，absolute inset-0 只用一层 */}
          <img
            ref={heroImgRef}
            src={showcaseHeroBg}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_30%] sm:object-[center_35%] md:object-center"
            fetchPriority="high"
            decoding="async"
            crossOrigin="anonymous"
          />

          {/* 全局暗化遮罩 */}
          <div
            className="pointer-events-none absolute inset-0 bg-black/45 sm:bg-black/52 md:bg-black/60"
            aria-hidden
          />

          {/* 底部渐变与卡片区衔接 */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-background via-background/75 to-transparent sm:h-[44%] md:h-[52%]"
            aria-hidden
          />

          {/* 内容区：flex-1 撑满 header，justify-center 垂直居中 */}
          <div className="relative z-10 mx-auto flex w-full flex-1 flex-col items-center justify-center min-w-0 max-w-home px-6 pb-16 pt-12 sm:pb-20 sm:pt-14 md:px-12 md:pb-24 md:pt-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto flex w-full min-w-0 max-w-4xl flex-col items-center text-center antialiased [transform:translateZ(0)]"
            >
              <span className="font-label mb-2 block text-xs font-medium uppercase tracking-widest text-white/60">
                AI 游戏设计大赛 2026
                <span className="ml-2 text-white/45">· Showcase</span>
              </span>

              <SectionTitleEnDecor
                titleZh="参赛作品"
                titleEn="SHOWCASE"
                align="center"
                headingLevel={1}
                headlineClassName="text-white"
              />

              <p className="mt-3 max-w-xl font-body text-base leading-[1.9] text-white [text-shadow:0_3px_12px_rgba(0,0,0,0.3),0_10px_28px_rgba(0,0,0,0.27),0_0_36px_rgba(0,0,0,0.225)] sm:mt-4 md:text-lg md:leading-[1.9]">
                人类 × AI 的奇怪游戏合集
              </p>

              {loadError && (
                <p className="mx-auto mt-4 font-body text-sm text-red-400/90">{loadError}</p>
              )}

              <ShowcaseStatBar
                count={filtered.length}
                total={items.length}
                isLoading={loading}
              />
            </motion.div>
          </div>
        </header>

        <div className="relative z-[1] mx-auto w-full max-w-home px-6 -mt-[4.5rem] pt-6 sm:-mt-[5rem] sm:pt-8 md:-mt-[6rem] md:px-12 md:pt-10">

          {/* ── 卡片栅格（含加载态） ── */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ShowcaseLoading count={6} />
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ShowcaseEmpty />
              </motion.div>
            ) : (
              <motion.div
                key="items"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3"
              >
                {filtered.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.42,
                      delay: Math.min(idx * 0.055, 0.33),
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    className="min-h-0 min-w-0 h-full"
                  >
                    <ShowcaseCard
                      item={item}
                      status={AWARD_STATUS[item.id]}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="border-t border-white/[0.06] bg-background px-6 pt-10 pb-[max(3rem,calc(env(safe-area-inset-bottom,0px)+2.5rem))] font-label text-[10px] font-medium uppercase tracking-technical text-white/25 sm:pt-12 md:px-12 md:pt-16 md:pb-20">
        <div className="mx-auto w-full max-w-home text-center">
          © 2026 AI_GAME_CONTEST · SHOWCASE
        </div>
      </footer>
    </>
  );
}

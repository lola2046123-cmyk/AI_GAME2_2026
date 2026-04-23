import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { SectionTitleEnDecor } from "../components/SectionTitleEnDecor";
import { ShowcaseCard } from "../components/showcase/ShowcaseCard";
import { getShowcaseListAsync } from "../lib/showcaseMerge";
import type { ShowcaseSubmission } from "../types/submission";

/** 展示页：参考 MotionSites 类画廊 — 宽裕边距、ambient 光、卡片栅格呼吸感 */
export function ShowcasePage() {
  const { key } = useLocation();
  const [items, setItems] = useState<ShowcaseSubmission[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    void getShowcaseListAsync()
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "加载失败");
          setItems([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return (
    <>
      <main className="relative overflow-hidden bg-background px-6 pt-6 pb-[max(5rem,calc(env(safe-area-inset-bottom,0px)+4.5rem))] md:px-12 md:pt-10 md:pb-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          aria-hidden
        >
          <div className="showcase-ambient-breathe absolute top-[-8%] left-1/2 h-[min(82vh,680px)] w-[min(165%,1100px)] max-w-[min(200vw,1200px)] -translate-x-1/2 bg-[radial-gradient(ellipse_75%_58%_at_50%_0%,rgba(168,255,225,0.08)_0%,rgba(0,255,204,0.038)_42%,transparent_70%)]" />
          <div className="showcase-ambient-breathe showcase-ambient-breathe--delay absolute right-[-6%] bottom-[-10%] h-[min(42vh,400px)] w-[min(95vw,560px)] max-w-[min(200vw,640px)] bg-[radial-gradient(ellipse_70%_55%_at_100%_100%,rgba(168,255,225,0.05)_0%,rgba(0,255,204,0.026)_45%,transparent_72%)]" />
        </div>

        <div className="relative z-[1] mx-auto w-full max-w-home">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 text-center md:mb-14"
          >
            <SectionTitleEnDecor
              titleZh="参赛展示"
              titleEn="SHOWCASE"
              align="center"
              headingLevel={1}
            />
            <p className="font-body type-body-compact mx-auto mt-4 max-w-2xl text-base font-normal leading-[1.21] tracking-[0.02em] text-primary/50 md:mt-5 md:text-lg md:tracking-[0.025em]">
              聚合参赛作品链接，在新标签页打开访问。
            </p>
            {loadError ? (
              <p className="mx-auto mt-4 max-w-2xl text-center font-body text-sm text-red-400/95">
                {loadError}
              </p>
            ) : null}
          </motion.div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 xl:grid-cols-3 xl:gap-4">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -12% 0px" }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(idx * 0.07, 0.42),
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="min-w-0"
              >
                <ShowcaseCard item={item} />
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/[0.06] bg-background px-6 pt-10 pb-[max(3rem,calc(env(safe-area-inset-bottom,0px)+2.5rem))] font-label text-[10px] font-medium uppercase tracking-technical text-primary/40 sm:pt-12 md:px-12 md:pt-16 md:pb-20">
        <div className="mx-auto w-full max-w-home text-center">
          © 2026 AI_GAME_CONTEST · SHOWCASE
        </div>
      </footer>
    </>
  );
}

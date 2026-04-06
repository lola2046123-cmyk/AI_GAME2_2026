import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { SectionTitleEnDecor } from "../components/SectionTitleEnDecor";
import { ShowcaseCard } from "../components/showcase/ShowcaseCard";
import { getShowcaseList } from "../lib/showcaseMerge";
import type { ShowcaseSubmission } from "../types/submission";

/** 展示页：参考 MotionSites 类画廊 — 宽裕边距、ambient 光、卡片栅格呼吸感 */
export function ShowcasePage() {
  const { key } = useLocation();
  const [items, setItems] = useState<ShowcaseSubmission[]>(() => getShowcaseList());

  useEffect(() => {
    setItems(getShowcaseList());
  }, [key]);

  return (
    <>
      <main className="relative overflow-hidden bg-background px-6 pt-8 pb-[max(7rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] md:px-12 md:pt-12 md:pb-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          aria-hidden
        >
          <div className="showcase-ambient-breathe absolute top-0 left-1/2 h-[min(70vh,520px)] w-[min(140%,900px)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_0%,rgba(94,210,156,0.12)_0%,transparent_58%)]" />
          <div className="showcase-ambient-breathe showcase-ambient-breathe--delay absolute right-0 bottom-0 h-[320px] w-[420px] bg-[radial-gradient(ellipse_at_100%_100%,rgba(94,210,156,0.075)_0%,transparent_65%)]" />
        </div>

        <div className="relative z-[1] mx-auto w-full max-w-home">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16 text-center md:mb-24"
          >
            <SectionTitleEnDecor
              titleZh="参赛展示"
              titleEn="SHOWCASE"
              align="center"
              headingLevel={1}
            />
            <p className="font-body type-body-compact mx-auto mt-6 max-w-2xl text-base font-normal leading-[1.21] tracking-[0.02em] text-primary/50 md:mt-7 md:text-lg md:tracking-[0.025em]">
              灵感交汇，重塑原生。
              <br />
              由 AI 赋能的 H5 游戏全景漫游，触碰卡片，开启即时体验之旅。
            </p>
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

      <footer className="border-t border-white/[0.06] bg-background px-6 pt-16 pb-[max(4rem,calc(env(safe-area-inset-bottom,0px)+3rem))] font-label text-[10px] font-medium uppercase tracking-technical text-primary/40 sm:pt-20 md:px-12 md:pt-24 md:pb-28">
        <div className="mx-auto w-full max-w-home text-center">
          © 2026 AI_GAME_CONTEST · SHOWCASE
        </div>
      </footer>
    </>
  );
}

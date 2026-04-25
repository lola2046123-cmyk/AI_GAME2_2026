import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { SectionTitleEnDecor } from "../components/SectionTitleEnDecor";
import { RankingList } from "../components/showcase/RankingList";
import { ShowcaseCard } from "../components/showcase/ShowcaseCard";
import { ShowcaseEmpty } from "../components/showcase/ShowcaseEmpty";
import { ShowcaseLoading } from "../components/showcase/ShowcaseLoading";
import { ShowcaseStatBar } from "../components/showcase/ShowcaseStatBar";
import { getShowcaseListAsync } from "../lib/showcaseMerge";
import {
  buildRankings,
  getVoteStateForProjects,
  type ShowcaseVoteState,
  type ShowcaseVoteStateMap
} from "../lib/showcaseVotes";
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
  const [voteMap, setVoteMap] = useState<ShowcaseVoteStateMap>({});

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

  useEffect(() => {
    let cancelled = false;
    if (items.length === 0) {
      setVoteMap({});
      return;
    }

    void getVoteStateForProjects(items.map((item) => item.id))
      .then((map) => {
        if (!cancelled) setVoteMap(map);
      })
      .catch(() => {
        if (!cancelled) setVoteMap({});
      });

    return () => {
      cancelled = true;
    };
  }, [items]);

  /** 按最新时间排序 */
  const filtered = useMemo(
    () => [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [items]
  );

  const rankings = useMemo(() => buildRankings(items, voteMap), [items, voteMap]);

  /** 每个项目对应的排行标签（优先级：热门 > 视觉最佳 > 最有趣 > 最想氪金） */
  const rankLabelMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    rankings.fun.slice(0, 3).forEach((e) => { map[e.project.id] = "最想氪金"; });
    rankings.gameplay.slice(0, 3).forEach((e) => { map[e.project.id] = "最有趣"; });
    rankings.visual.slice(0, 3).forEach((e) => { map[e.project.id] = "视觉最佳"; });
    rankings.like.slice(0, 3).forEach((e) => { map[e.project.id] = "热门作品"; });
    return map;
  }, [rankings]);

  const hasItems = items.length > 0;

  return (
    <>
      <main className="relative min-w-0 overflow-hidden bg-background pb-[max(5rem,calc(env(safe-area-inset-bottom,0px)+4.5rem))] md:pb-28">

        {/* 首屏 Hero：背景图 + 黑色遮罩 + 底部渐变与 background 色衔接 */}
        <header className="relative isolate w-full min-w-0 overflow-hidden pb-20 sm:pb-24 md:pb-28">
          {/* 背景图 */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <img
              src="/game_BG2.jpg"
              alt=""
              className="h-full w-full object-cover object-[center_30%] sm:object-center"
              fetchPriority="high"
              decoding="async"
            />
          </div>

          {/* 全局暗化遮罩：移动端遮罩更浅，桌面端适当加深 */}
          <div
            className="pointer-events-none absolute inset-0 bg-black/40 sm:bg-black/55 md:bg-black/62"
            aria-hidden
          />

          {/* 底部渐变：移动端缩短覆盖比例，避免与实色遮罩叠加过暗 */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-background via-background/80 to-transparent sm:h-[40%] md:h-[48%] md:via-background/82"
            aria-hidden
          />

          <div className="relative z-10 mx-auto w-full min-w-0 max-w-home px-6 py-12 sm:py-14 md:px-12 md:py-16 lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto flex w-full min-w-0 max-w-4xl flex-col items-center text-center antialiased [transform:translateZ(0)]"
            >
              <span className="font-label mb-3 block text-xs font-medium uppercase tracking-widest text-white/60">
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
              <p className="mt-5 max-w-xl font-body text-base leading-[1.9] text-white/85 [text-shadow:0_3px_12px_rgba(0,0,0,1),0_10px_28px_rgba(0,0,0,0.9),0_0_36px_rgba(0,0,0,0.75)] md:mt-6 md:text-lg md:leading-[1.9]">
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

        <div className="relative z-[1] mx-auto w-full max-w-home px-6 -mt-20 pt-8 sm:-mt-24 md:-mt-28 md:px-12 md:pt-10">

          <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-4">
            <RankingList
              title="热门作品"
              iconKey="flame"
              topN={3}
              items={rankings.like}
              voteCount={(e) => e.votes}
              emptyText="还没有点赞记录"
            />
            <RankingList
              title="视觉最佳"
              iconKey="sparkles"
              topN={3}
              items={rankings.visual}
              voteCount={(e) => e.votes}
            />
            <RankingList
              title="最有趣"
              iconKey="gamepad"
              topN={3}
              items={rankings.gameplay}
              voteCount={(e) => e.votes}
            />
            <RankingList
              title="最想氪金"
              iconKey="coin"
              topN={3}
              items={rankings.fun}
              voteCount={(e) => e.votes}
              emptyText="还没有「最想氪金」投票"
            />
          </div>

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
                    className="min-w-0"
                  >
                    <ShowcaseCard
                      item={item}
                      status={AWARD_STATUS[item.id]}
                      rankLabel={rankLabelMap[item.id]}
                      showVote
                      voteState={voteMap[item.id]}
                      onVoteStateChange={(updater) =>
                        setVoteMap((prev) => {
                          const current: ShowcaseVoteState =
                            prev[item.id] ?? {
                              counts: { like: 0, fun: 0, visual: 0, gameplay: 0 },
                              userVotes: []
                            };
                          return {
                            ...prev,
                            [item.id]: updater(current)
                          };
                        })
                      }
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

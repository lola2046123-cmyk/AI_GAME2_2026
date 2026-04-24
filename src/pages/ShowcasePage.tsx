import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { SectionTitleEnDecor } from "../components/SectionTitleEnDecor";
import { RankingList } from "../components/showcase/RankingList";
import { ShowcaseCard } from "../components/showcase/ShowcaseCard";
import { ShowcaseEmpty } from "../components/showcase/ShowcaseEmpty";
import { ShowcaseStatBar } from "../components/showcase/ShowcaseStatBar";
import { getShowcaseListAsync } from "../lib/showcaseMerge";
import {
  buildRankings,
  getVoteStateForProjects,
  type ShowcaseVoteState,
  type ShowcaseVoteStateMap
} from "../lib/showcaseVotes";
import type { ShowcaseSubmission } from "../types/submission";

/* ─────────────── 类型 ─────────────── */
type FilterCategory = "全部" | "AI" | "叙事" | "策略" | "实验";
type SortOrder = "最新" | "热门" | "获奖";

const CATEGORIES: FilterCategory[] = ["全部", "AI", "叙事", "策略", "实验"];
const SORTS: SortOrder[] = ["最新", "热门", "获奖"];

/* ─────────────── 获奖状态（示例映射，生产环境可从 DB 读取） ─────────────── */
const AWARD_STATUS: Record<string, "winner" | "finalist"> = {
  "mock-stellar": "winner",
  "mock-echoes": "finalist",
  "mock-bonsai": "finalist"
};

/* ─────────────── AI 工具关键词 ─────────────── */
const AI_TOOLS = ["gemini", "chatgpt", "claude", "copilot", "gpt", "midjourney", "stable diffusion", "ai"];

/* ─────────────── 过滤逻辑 ─────────────── */
function matchCategory(item: ShowcaseSubmission, cat: FilterCategory): boolean {
  if (cat === "全部") return true;
  const stack = item.techStack.map((t) => t.toLowerCase());
  const gameplay = (item.gameplay + " " + (item.cardSummary ?? "")).toLowerCase();
  switch (cat) {
    case "AI":
      return stack.some((t) => AI_TOOLS.includes(t));
    case "叙事":
      return gameplay.includes("叙事") || gameplay.includes("对话") || gameplay.includes("故事") || gameplay.includes("narrative");
    case "策略":
      return gameplay.includes("策略") || gameplay.includes("战略") || gameplay.includes("决策") || gameplay.includes("strategy");
    case "实验":
      return stack.some((t) => t.includes("stable diffusion") || t.includes("midjourney") || t.includes("generative"));
    default:
      return true;
  }
}

function sortItems(
  items: ShowcaseSubmission[],
  sort: SortOrder,
  voteMap: ShowcaseVoteStateMap
): ShowcaseSubmission[] {
  const copy = [...items];
  if (sort === "最新") {
    return copy.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  if (sort === "热门") {
    return copy.sort(
      (a, b) =>
        (voteMap[b.id]?.counts.like ?? 0) - (voteMap[a.id]?.counts.like ?? 0)
    );
  }
  if (sort === "获奖") {
    const rank = (id: string) =>
      AWARD_STATUS[id] === "winner" ? 0 : AWARD_STATUS[id] === "finalist" ? 1 : 2;
    return copy.sort((a, b) => rank(a.id) - rank(b.id));
  }
  return copy;
}

/* ─────────────── Filter Bar 子组件 ─────────────── */
function FilterBar({
  category,
  sort,
  onCategory,
  onSort
}: {
  category: FilterCategory;
  sort: SortOrder;
  onCategory: (v: FilterCategory) => void;
  onSort: (v: SortOrder) => void;
}) {
  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* 分类 */}
      <div className="flex flex-wrap items-center gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategory(cat)}
            className={`rounded-full px-3.5 py-1.5 font-label text-xs font-medium uppercase tracking-widest transition-all duration-200 ${
              category === cat
                ? "bg-primary/15 border border-primary/30 text-primary"
                : "border border-white/[0.08] bg-white/[0.04] text-white/40 hover:border-white/15 hover:bg-white/[0.07] hover:text-white/70"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 分隔 */}
      <div className="hidden h-4 w-px bg-white/[0.08] sm:block" aria-hidden />

      {/* 排序 */}
      <div className="flex items-center gap-1">
        <span className="mr-1 font-label text-[10px] uppercase tracking-widest text-white/25">
          排序
        </span>
        {SORTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSort(s)}
            className={`rounded px-3 py-1.5 font-label text-xs font-medium uppercase tracking-widest transition-all duration-200 ${
              sort === s
                ? "bg-white/[0.1] text-white/80"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── 页面主体 ─────────────── */
export function ShowcasePage() {
  const { key } = useLocation();
  const [items, setItems] = useState<ShowcaseSubmission[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [category, setCategory] = useState<FilterCategory>("全部");
  const [sort, setSort] = useState<SortOrder>("最新");
  const [voteMap, setVoteMap] = useState<ShowcaseVoteStateMap>({});

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

  const filtered = useMemo(
    () => sortItems(items.filter((it) => matchCategory(it, category)), sort, voteMap),
    [items, category, sort, voteMap]
  );

  const rankings = useMemo(() => buildRankings(items, voteMap), [items, voteMap]);

  const hasItems = items.length > 0;
  const isFiltered = category !== "全部" || sort !== "最新";

  return (
    <>
      <main className="relative min-w-0 overflow-hidden bg-background pb-[max(5rem,calc(env(safe-area-inset-bottom,0px)+4.5rem))] md:pb-28">

        {/* 与「部署指南」一致的二级首屏：固定高度节奏 + 同款光晕 */}
        <header className="relative isolate w-full min-w-0 border-b border-white/[0.06] bg-background">
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-100" aria-hidden>
            <div className="absolute top-[-18%] left-1/2 h-[min(52vh,520px)] w-[min(100vw,1100px)] max-w-full -translate-x-1/2 bg-[radial-gradient(ellipse_72%_58%_at_50%_32%,rgba(168,255,225,0.072)_0%,rgba(0,255,204,0.034)_42%,transparent_74%)]" />
            <div className="absolute bottom-[-22%] left-1/2 h-[min(44vh,420px)] w-[min(100vw,960px)] max-w-full -translate-x-1/2 bg-[radial-gradient(ellipse_68%_52%_at_50%_78%,rgba(168,255,225,0.048)_0%,rgba(0,255,204,0.022)_44%,transparent_78%)]" />
          </div>
          <div className="relative z-10 mx-auto w-full min-w-0 max-w-home px-6 py-10 md:px-12 md:py-12 lg:py-14">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto flex w-full min-w-0 max-w-4xl flex-col items-center text-center"
            >
              <span className="font-label mb-3 block text-xs font-medium uppercase tracking-widest text-white/40">
                AI 游戏设计大赛 2026
                <span className="ml-2 text-white/20">· Showcase</span>
              </span>
              <SectionTitleEnDecor
                titleZh="参赛作品"
                titleEn="SHOWCASE"
                align="center"
                headingLevel={1}
                headlineClassName="text-white"
              />
              <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-white/60 md:mt-5 md:text-base">
                人类 × AI 的奇怪游戏合集
              </p>
              <p className="mt-1.5 font-label text-[10px] uppercase tracking-widest text-white/25 md:text-xs">
                Humans × AI · Odd game anthology
              </p>
              {loadError && (
                <p className="mx-auto mt-4 font-body text-sm text-red-400/90">{loadError}</p>
              )}
              <ShowcaseStatBar count={filtered.length} total={items.length} />
            </motion.div>
          </div>
        </header>

        <div className="relative z-[1] mx-auto w-full max-w-home px-6 pt-8 md:px-12 md:pt-10">

          <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-4">
            <RankingList
              title="热门作品"
              iconKey="flame"
              topN={5}
              items={rankings.like}
              voteCount={(e) => e.votes}
              emptyText="还没有点赞记录"
            />
            <RankingList
              title="视觉最佳"
              iconKey="sparkles"
              topN={5}
              items={rankings.visual}
              voteCount={(e) => e.votes}
            />
            <RankingList
              title="最有趣"
              iconKey="gamepad"
              topN={5}
              items={rankings.gameplay}
              voteCount={(e) => e.votes}
            />
            <RankingList
              title="最想氪金"
              iconKey="coin"
              topN={5}
              items={rankings.fun}
              voteCount={(e) => e.votes}
              emptyText="还没有「最想氪金」投票"
            />
          </div>

          {/* ── Filter Bar ── */}
          {hasItems && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 md:px-5 md:py-3.5"
            >
              <FilterBar
                category={category}
                sort={sort}
                onCategory={setCategory}
                onSort={setSort}
              />
            </motion.div>
          )}

          {/* ── 卡片栅格 ── */}
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ShowcaseEmpty filtered={hasItems && isFiltered} />
              </motion.div>
            ) : (
              <motion.div
                key={`${category}-${sort}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8"
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

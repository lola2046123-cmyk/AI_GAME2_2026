import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import type { VoteType, ShowcaseVoteState } from "../../lib/showcaseVotes";
import { likeProject, voteProject } from "../../lib/showcaseVotes";

type Props = {
  projectId: string;
  state?: ShowcaseVoteState;
  compact?: boolean;
  /** 详情页侧边栏竖排卡片模式 */
  panel?: boolean;
  onStateChange?: (updater: (prev: ShowcaseVoteState) => ShowcaseVoteState) => void;
};

const CATEGORY_LABEL: Record<Exclude<VoteType, "like">, string> = {
  visual: "视觉最佳",
  gameplay: "最有趣",
  fun: "最想氪金"
};

const CATEGORY_ORDER: readonly Exclude<VoteType, "like">[] = ["visual", "gameplay", "fun"];

export function ShowcaseVoteBar({
  projectId,
  state,
  compact = false,
  panel = false,
  onStateChange
}: Props) {
  const [loadingKey, setLoadingKey] = useState<VoteType | null>(null);
  const [flash, setFlash] = useState<null | VoteType>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 900);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const counts = state?.counts ?? { like: 0, fun: 0, visual: 0, gameplay: 0 };
  const userVotes = state?.userVotes ?? [];

  async function handleLike() {
    if (loadingKey || userVotes.includes("like")) return;
    try {
      setLoadingKey("like");
      setMessage("");
      await likeProject(projectId);
      onStateChange?.((prev) => ({
        counts: { ...prev.counts, like: prev.counts.like + 1 },
        userVotes: [...prev.userVotes, "like"]
      }));
      setFlash("like");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "点赞失败。");
    } finally {
      setLoadingKey(null);
    }
  }

  async function handleVote(type: Exclude<VoteType, "like">) {
    if (loadingKey || userVotes.includes(type)) return;
    try {
      setLoadingKey(type);
      setMessage("");
      await voteProject(projectId, type);
      onStateChange?.((prev) => ({
        counts: { ...prev.counts, [type]: prev.counts[type] + 1 },
        userVotes: [...prev.userVotes, type]
      }));
      setFlash(type);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "投票失败。");
    } finally {
      setLoadingKey(null);
    }
  }

  /* ── 侧边栏竖排卡片模式 ── */
  if (panel) {
    const likeActive = userVotes.includes("like");
    return (
      <div className="relative space-y-1.5">
        {/* 点赞 */}
        <button
          type="button"
          onClick={handleLike}
          disabled={loadingKey !== null || likeActive}
          className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200 disabled:cursor-not-allowed ${
            likeActive
              ? "border-rose-400/50 bg-rose-500/15 shadow-[0_0_20px_rgba(251,113,133,0.15)]"
              : "border-white/[0.09] bg-white/[0.03] hover:border-rose-400/35 hover:bg-rose-500/[0.07]"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <Heart
              className={`h-4 w-4 shrink-0 transition-colors ${likeActive ? "text-rose-300" : "text-white/40 group-hover:text-rose-300/70"}`}
              fill={likeActive ? "currentColor" : "none"}
              strokeWidth={2}
            />
            <span className={`font-label text-xs font-semibold tracking-wide ${likeActive ? "text-rose-200" : "text-white/55 group-hover:text-white/80"}`}>
              点赞
            </span>
            {likeActive && (
              <span className="rounded-full bg-rose-400/20 px-1.5 py-0.5 font-label text-[9px] text-rose-300/80">
                已赞
              </span>
            )}
          </span>
          <span className={`font-reward-hud text-base font-bold leading-none ${likeActive ? "text-rose-300" : "text-white/30 group-hover:text-white/50"}`}>
            {counts.like}
          </span>
        </button>

        {/* 分类投票 */}
        {CATEGORY_ORDER.map((type) => {
          const active = userVotes.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => void handleVote(type)}
              disabled={loadingKey !== null || active}
              className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200 disabled:cursor-not-allowed ${
                active
                  ? "border-primary/50 bg-primary/[0.12] shadow-[0_0_20px_rgba(168,255,225,0.12)]"
                  : "border-white/[0.09] bg-white/[0.03] hover:border-primary/30 hover:bg-primary/[0.06]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-primary" : "bg-white/25 group-hover:bg-primary/60"}`}
                  aria-hidden
                />
                <span className={`font-label text-xs font-semibold tracking-wide ${active ? "text-primary/90" : "text-white/55 group-hover:text-white/80"}`}>
                  {CATEGORY_LABEL[type]}
                </span>
                {active && (
                  <span className="rounded-full bg-primary/15 px-1.5 py-0.5 font-label text-[9px] text-primary/70">
                    已投
                  </span>
                )}
              </span>
              <span className={`font-reward-hud text-base font-bold leading-none ${active ? "text-primary/80" : "text-white/30 group-hover:text-white/50"}`}>
                {counts[type]}
              </span>
            </button>
          );
        })}

        {flash && (
          <span className="pointer-events-none absolute -top-5 left-4 font-label text-[10px] uppercase tracking-widest text-primary/90">
            +1
          </span>
        )}
        {message && (
          <p className="pt-1 font-body text-xs leading-relaxed text-white/40">{message}</p>
        )}
      </div>
    );
  }

  /* ── 卡片列表 compact 模式（ShowcasePage） ── */
  const chipBase = "inline-flex items-center rounded-full border font-label font-medium tracking-widest transition-colors";
  const sizeClass = compact ? "text-[10px] px-2.5 py-1" : "text-xs px-2.5 py-1";
  const gapClass = "gap-2";
  const heartClass = "mr-1 h-3 w-3";

  return (
    <div className="relative">
      <div className={`flex flex-wrap items-center ${gapClass}`}>
        <button
          type="button"
          onClick={handleLike}
          disabled={loadingKey !== null || userVotes.includes("like")}
          className={`${chipBase} ${sizeClass} ${
            userVotes.includes("like")
              ? "border-red-400/25 bg-red-400/12 text-red-300"
              : "border-white/10 bg-white/10 text-white/65 hover:border-white/20 hover:text-white/85"
          } disabled:cursor-not-allowed disabled:opacity-70`}
        >
          <Heart className={heartClass} fill={userVotes.includes("like") ? "currentColor" : "none"} strokeWidth={1.5} />
          {counts.like}
        </button>

        {CATEGORY_ORDER.map((type) => {
          const active = userVotes.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => void handleVote(type)}
              disabled={loadingKey !== null || active}
              className={`${chipBase} ${sizeClass} ${
                active
                  ? "border-primary/25 bg-primary/12 text-primary"
                  : "border-white/10 bg-white/10 text-white/55 hover:border-white/20 hover:text-white/80"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {CATEGORY_LABEL[type]}
              <span className="ml-1 text-white/35">{counts[type]}</span>
            </button>
          );
        })}
      </div>

      {flash && (
        <span className="pointer-events-none absolute -top-5 left-2 font-label text-[10px] uppercase tracking-widest text-primary/90">
          +1
        </span>
      )}
      {message && (
        <p className="mt-2 font-body text-xs leading-relaxed text-white/40">{message}</p>
      )}
    </div>
  );
}

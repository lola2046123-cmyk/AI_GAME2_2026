import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import type { VoteType, ShowcaseVoteState } from "../../lib/showcaseVotes";
import { likeProject, voteProject } from "../../lib/showcaseVotes";

type Props = {
  projectId: string;
  state?: ShowcaseVoteState;
  compact?: boolean;
  /** 详情页等：高对比描边与光晕 */
  prominent?: boolean;
  /** 详情 Hero：更小体量 + 霓虹色强化，首屏无滚动 */
  detailHero?: boolean;
  onStateChange?: (updater: (prev: ShowcaseVoteState) => ShowcaseVoteState) => void;
};

const CATEGORY_LABEL: Record<Exclude<VoteType, "like">, string> = {
  visual: "视觉最佳",
  gameplay: "最有趣",
  fun: "最想氪金"
};

/** 分类票展示顺序：与排行榜区块顺序一致，「最想氪金」置末 */
const CATEGORY_ORDER: readonly Exclude<VoteType, "like">[] = ["visual", "gameplay", "fun"];

export function ShowcaseVoteBar({
  projectId,
  state,
  compact = false,
  prominent = false,
  detailHero = false,
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

  const vivid = prominent || detailHero;
  const chipBase = detailHero
    ? "inline-flex items-center justify-center rounded-full border font-label font-semibold tracking-widest transition-all active:scale-[0.98] shadow-[0_0_16px_rgba(0,255,204,0.12)]"
    : prominent
      ? "inline-flex items-center justify-center rounded-full border-2 font-label font-semibold tracking-widest transition-all shadow-[0_0_20px_rgba(0,255,204,0.06)] active:scale-[0.98]"
      : "inline-flex items-center rounded-full border font-label font-medium tracking-widest transition-colors";
  const sizeClass = compact
    ? "text-[10px] px-2.5 py-1"
    : detailHero
      ? "text-[10px] px-2 py-1 sm:px-2.5 sm:py-1.5 sm:text-[11px]"
      : prominent
        ? "text-xs px-4 py-2.5 sm:text-sm sm:px-5 sm:py-3"
        : "text-xs px-2.5 py-1";
  const gapClass = detailHero ? "gap-1.5" : prominent ? "gap-2.5 sm:gap-3" : "gap-2";
  const heartClass = detailHero ? "mr-1 h-3 w-3" : prominent ? "mr-1.5 h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" : "mr-1 h-3 w-3";

  return (
    <div className="relative">
      <div className={`flex flex-wrap items-center ${gapClass}`}>
        <button
          type="button"
          onClick={handleLike}
          disabled={loadingKey !== null || userVotes.includes("like")}
          className={`${chipBase} ${sizeClass} ${
            userVotes.includes("like")
              ? detailHero
                ? "border-rose-400/70 bg-rose-500/25 text-rose-50 shadow-[0_0_18px_rgba(251,113,133,0.35)]"
                : vivid
                  ? "border-red-400/50 bg-red-500/20 text-red-200 shadow-[0_0_24px_rgba(248,113,113,0.12)]"
                  : "border-red-400/25 bg-red-400/12 text-red-300"
              : detailHero
                ? "border-rose-400/45 bg-rose-950/40 text-rose-100/95 hover:border-[#00ffcc]/55 hover:bg-[rgba(0,255,204,0.12)] hover:text-white hover:shadow-[0_0_20px_rgba(0,255,204,0.22)]"
                : vivid
                  ? "border-white/20 bg-white/[0.12] text-white/85 hover:border-primary/40 hover:bg-white/[0.16] hover:text-white hover:shadow-[0_0_28px_rgba(0,255,204,0.1)]"
                  : "border-white/10 bg-white/10 text-white/65 hover:border-white/20 hover:text-white/85"
          } disabled:cursor-not-allowed disabled:opacity-70`}
        >
          <Heart className={heartClass} fill={userVotes.includes("like") ? "currentColor" : "none"} strokeWidth={vivid ? 2 : 1.5} />
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
                  ? detailHero
                    ? "border-[#00ffcc]/70 bg-[rgba(0,255,204,0.18)] text-[#b8fff0] shadow-[0_0_20px_rgba(0,255,204,0.28)]"
                    : vivid
                      ? "border-primary/50 bg-primary/18 text-primary shadow-[0_0_24px_rgba(168,255,225,0.14)]"
                      : "border-primary/25 bg-primary/12 text-primary"
                  : detailHero
                    ? "border-[#00ffcc]/40 bg-[rgba(0,255,204,0.08)] text-[#d2fff0] hover:border-[#00ffcc]/65 hover:bg-[rgba(0,255,204,0.14)] hover:shadow-[0_0_18px_rgba(0,255,204,0.25)]"
                    : vivid
                      ? "border-white/18 bg-white/[0.08] text-white/75 hover:border-primary/35 hover:bg-primary/[0.08] hover:text-primary"
                      : "border-white/10 bg-white/10 text-white/55 hover:border-white/20 hover:text-white/80"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {CATEGORY_LABEL[type]}
              <span
                className={
                  detailHero
                    ? "ml-1.5 font-reward-hud text-[10px] text-[#00ffcc]/80 sm:text-[11px]"
                    : prominent
                      ? "ml-2 font-reward-hud text-[0.7rem] text-white/45 sm:text-xs"
                      : "ml-1 text-white/35"
                }
              >
                {counts[type]}
              </span>
            </button>
          );
        })}
      </div>

      {flash ? (
        <span className="pointer-events-none absolute -top-5 left-2 font-label text-[10px] uppercase tracking-widest text-primary/90">
          +1
        </span>
      ) : null}

      {message ? (
        <p className="mt-2 font-body text-xs leading-relaxed text-white/40">{message}</p>
      ) : null}
    </div>
  );
}

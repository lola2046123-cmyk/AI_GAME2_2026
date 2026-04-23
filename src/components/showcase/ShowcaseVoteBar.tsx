import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { VoteType, ShowcaseVoteState } from "../../lib/showcaseVotes";
import { likeProject, voteProject } from "../../lib/showcaseVotes";

type Props = {
  projectId: string;
  user: User | null;
  state?: ShowcaseVoteState;
  compact?: boolean;
  onRequireLogin: () => void;
  onStateChange?: (updater: (prev: ShowcaseVoteState) => ShowcaseVoteState) => void;
};

const CATEGORY_LABEL: Record<Exclude<VoteType, "like">, string> = {
  fun: "最搞怪",
  visual: "视觉最佳",
  gameplay: "最有趣"
};

export function ShowcaseVoteBar({
  projectId,
  user,
  state,
  compact = false,
  onRequireLogin,
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
    if (!user) {
      onRequireLogin();
      return;
    }
    if (loadingKey || userVotes.includes("like")) return;
    try {
      setLoadingKey("like");
      setMessage("");
      await likeProject(projectId, user.id);
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
    if (!user) {
      onRequireLogin();
      return;
    }
    if (loadingKey || userVotes.includes(type)) return;
    try {
      setLoadingKey(type);
      setMessage("");
      await voteProject(projectId, user.id, type);
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

  const chipBase =
    "inline-flex items-center rounded-full border px-2.5 py-1 font-label text-[10px] font-medium tracking-widest transition-colors";
  const sizeClass = compact ? "text-[10px]" : "text-xs";

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
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
          <Heart className="mr-1 h-3 w-3" fill={userVotes.includes("like") ? "currentColor" : "none"} />
          {counts.like}
        </button>

        {(["fun", "visual", "gameplay"] as const).map((type) => {
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

import type { LucideIcon } from "lucide-react";
import { Flame, Gamepad2, Sparkles, Zap } from "lucide-react";
import type { RankingEntry } from "../../lib/showcaseVotes";

export type RankingIconKey = "flame" | "zap" | "sparkles" | "gamepad";

const ICON_MAP: Record<RankingIconKey, LucideIcon> = {
  flame:    Flame,
  zap:      Zap,
  sparkles: Sparkles,
  gamepad:  Gamepad2
};

/* 每个榜单独立的配色方案 */
const ACCENT: Record<
  RankingIconKey,
  { icon: string; badge: string; countText: string }
> = {
  flame:    { icon: "text-orange-300 border-orange-400/25 bg-orange-400/[0.08]",   badge: "border-orange-400/15 bg-orange-400/[0.06] text-orange-300/70", countText: "text-orange-300/60" },
  zap:      { icon: "text-yellow-300 border-yellow-400/25 bg-yellow-400/[0.08]",   badge: "border-yellow-400/15 bg-yellow-400/[0.06] text-yellow-300/70",  countText: "text-yellow-300/60" },
  sparkles: { icon: "text-sky-300 border-sky-400/25 bg-sky-400/[0.08]",            badge: "border-sky-400/15 bg-sky-400/[0.06] text-sky-300/70",           countText: "text-sky-300/60"    },
  gamepad:  { icon: "text-primary border-primary/25 bg-primary/[0.08]",            badge: "border-primary/15 bg-primary/[0.06] text-primary/70",           countText: "text-primary/60"    }
};

/* 名次颜色：前三名区分 */
function rankStyle(index: number): string {
  if (index === 0) return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
  if (index === 1) return "border-white/15 bg-white/[0.06] text-white/55";
  if (index === 2) return "border-orange-400/20 bg-orange-400/[0.06] text-orange-300/70";
  return "border-white/[0.08] bg-white/[0.03] text-white/35";
}

type Props = {
  title: string;
  iconKey: RankingIconKey;
  emptyText?: string;
  voteCount: (entry: RankingEntry) => number;
  items: RankingEntry[];
};

export function RankingList({
  title,
  iconKey,
  items,
  voteCount,
  emptyText = "暂无投票数据"
}: Props) {
  const accent = ACCENT[iconKey];
  const Icon = ICON_MAP[iconKey];

  return (
    <section className="surface-card rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
      {/* 榜单标题行 */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${accent.icon}`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <h3 className="font-headline text-base font-semibold tracking-tight text-white">
            {title}
          </h3>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 font-label text-[10px] uppercase tracking-widest ${accent.badge}`}
        >
          Top 10
        </span>
      </div>

      {items.length === 0 ? (
        <p className="font-body text-sm text-white/40">{emptyText}</p>
      ) : (
        <ol className="space-y-2">
          {items.map((entry, index) => {
            const count = voteCount(entry);
            return (
              <li
                key={entry.project.id}
                className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2 transition-colors hover:bg-white/[0.04]"
              >
                {/* 名次徽章 */}
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-label text-[11px] font-semibold ${rankStyle(index)}`}
                >
                  {index + 1}
                </span>

                {/* 封面 */}
                <img
                  src={entry.project.thumbnailUrl}
                  alt={entry.project.gameName}
                  className="h-10 w-[3.75rem] shrink-0 rounded-md object-cover"
                  loading="lazy"
                />

                {/* 文字 */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-sm font-medium text-white">
                    {entry.project.gameName}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1">
                    <Icon className={`h-3 w-3 shrink-0 ${accent.countText}`} strokeWidth={1.8} />
                    <span className={`font-label text-[10px] uppercase tracking-widest ${accent.countText}`}>
                      {count}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

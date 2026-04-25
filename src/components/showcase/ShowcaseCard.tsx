import { Link } from "react-router-dom";
import { ThinArrow } from "../ThinArrow";
import type { ShowcaseSubmission } from "../../types/submission";
import { SHOWCASE_DETAILS } from "../../data/showcaseDetails";
import {
  stripMarkdownToPlain,
  truncatePlainText
} from "../../lib/showcaseCardSummary";
import type { ShowcaseVoteState } from "../../lib/showcaseVotes";
import { ShowcaseVoteBar } from "./ShowcaseVoteBar";

/**
 * 卡片摘要：有 summary 则优先使用（转纯文本后按需截断）；
 * 否则从 cardSummary / gameplay / 详情 Markdown 回退并截断 120–160 字 + "..."
 */
export function buildShowcaseCardSummary(item: ShowcaseSubmission): string {
  const detailMd = SHOWCASE_DETAILS[item.id]?.markdown;

  const explicit = item.summary?.trim();
  if (explicit) {
    const plain = stripMarkdownToPlain(explicit);
    return plain.length > 160 ? truncatePlainText(plain, 160) : plain;
  }

  const raw =
    item.cardSummary?.trim() ||
    item.gameplay?.trim() ||
    detailMd?.trim() ||
    "";
  const plain = stripMarkdownToPlain(raw);
  if (!plain) return "";
  return truncatePlainText(plain, 160);
}

type CardStatus = "winner" | "finalist" | undefined;

export function ShowcaseCard({
  item,
  status,
  rankLabel,
  showVote = false,
  voteState,
  onVoteStateChange
}: {
  item: ShowcaseSubmission;
  status?: CardStatus;
  /** 根据投票排行展示的荣誉标签，无数据时留空 */
  rankLabel?: string;
  /** 是否在卡片底部展示点赞/投票条（默认 false，首页等场景不显示） */
  showVote?: boolean;
  voteState?: ShowcaseVoteState;
  onVoteStateChange?: (updater: (prev: ShowcaseVoteState) => ShowcaseVoteState) => void;
}) {
  const isUser = item.source === "user";
  const blurb = buildShowcaseCardSummary(item);

  const inner = (
    <article className="group/card surface-card flex h-full flex-col overflow-hidden rounded-xl border border-white/10 transition-all duration-300 hover:border-white/[0.18] hover:shadow-[0_16px_48px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)] hover:-translate-y-0.5">

      {/* 封面 16:9 */}
      <div className="relative aspect-video overflow-hidden bg-white/[0.04]">
        <img
          src={item.thumbnailUrl}
          alt={item.gameName}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.05]"
          loading="lazy"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent"
          aria-hidden
        />

        {/* 左上：rankLabel 强化标签（替代原右上 Live） */}
        {rankLabel && (
          <div className="absolute top-0 left-0">
            <span className="flex items-center gap-1.5 rounded-br-xl bg-primary-container/90 px-3 py-1.5 font-label text-[10px] font-bold uppercase tracking-widest text-black/80 shadow-[0_2px_12px_rgba(0,255,204,0.35)] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-black/50" aria-hidden />
              {rankLabel}
            </span>
          </div>
        )}

        {/* 右上：奖项徽章（获奖/入围） */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {status === "winner" && (
            <span className="rounded-full border border-yellow-400/40 bg-yellow-400/15 px-2.5 py-0.5 font-label text-[10px] font-semibold uppercase tracking-widest text-yellow-300 backdrop-blur-md">
              Winner
            </span>
          )}
          {status === "finalist" && (
            <span className="rounded-full border border-primary/35 bg-primary/10 px-2.5 py-0.5 font-label text-[10px] font-semibold uppercase tracking-widest text-primary backdrop-blur-md">
              Finalist
            </span>
          )}
        </div>

        {/* hover：查看作品 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
          <span className="flex items-center gap-2 rounded-full border border-white/20 bg-black/75 px-5 py-2 font-label text-xs font-semibold tracking-wider text-white backdrop-blur-md">
            查看作品 <ThinArrow />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4 md:px-6 md:pb-6">
        {/* 卡片内标签占位（无 rankLabel 时保持高度对齐） */}
        {!rankLabel ? (
          <div className="mb-3 h-[1.375rem]">
            {!isUser && (
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-label text-[10px] uppercase tracking-widest text-white/30">
                示例
              </span>
            )}
          </div>
        ) : (
          <div className="mb-3 h-[1.375rem]" />
        )}

        <h2 className="font-headline text-base font-semibold leading-snug tracking-tight text-white line-clamp-1 md:text-lg">
          {item.gameName}
        </h2>

        {/* 创作者行：始终占位，保证后续内容对齐 */}
        <p className="mt-1.5 min-h-[1.5rem] font-body text-sm text-white/80 md:text-sm">
          {item.creatorNickname?.trim() ? (
            <span className="line-clamp-1">
              <span className="text-white/80">创作者 </span>
              {item.creatorNickname.trim()}
            </span>
          ) : null}
        </p>

        <p className="mt-2.5 flex-1 font-body text-sm leading-relaxed text-white/70 line-clamp-2">
          {blurb}
        </p>

        {showVote ? (
          <div className="mt-4">
            <ShowcaseVoteBar
              projectId={item.id}
              state={voteState}
              compact
              onStateChange={onVoteStateChange}
            />
          </div>
        ) : null}

        <p className="mt-3.5 border-t border-white/[0.07] pt-3 font-label text-[15px] uppercase tracking-widest text-white/40 transition-colors duration-300 group-hover/card:text-primary/60">
          <span className="inline-flex items-center gap-1 transition-transform duration-300 group-hover/card:translate-x-0.5">
            查看详情 <ThinArrow />
          </span>
        </p>
      </div>
    </article>
  );

  return (
    <Link
      to={`/showcase/${item.id}`}
      className="block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {inner}
    </Link>
  );
}

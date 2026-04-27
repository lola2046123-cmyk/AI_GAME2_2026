import { Link } from "react-router-dom";
import { ThinArrow } from "../ThinArrow";
import type { ShowcaseSubmission } from "../../types/submission";
import { SHOWCASE_DETAILS } from "../../data/showcaseDetails";
import {
  stripMarkdownToPlain,
  truncatePlainText
} from "../../lib/showcaseCardSummary";
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
  status
}: {
  item: ShowcaseSubmission;
  status?: CardStatus;
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

        {/* 右上：奖项徽章 */}
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
          {isUser && !status && (
            <span className="rounded-full border border-primary-container/20 bg-black/55 px-2.5 py-0.5 font-label text-[10px] font-semibold uppercase tracking-widest text-primary-container/60 backdrop-blur-md">
              Live
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
        <h2 className="font-headline text-base font-semibold leading-snug tracking-tight text-white line-clamp-1 md:text-lg">
          {item.gameName}
        </h2>

        <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-white/65 line-clamp-2">
          {blurb}
        </p>

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

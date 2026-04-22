import { ExternalLink } from "lucide-react";
import type { ShowcaseSubmission } from "../../types/submission";

function excerpt(text: string, max = 100) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function ShowcaseCard({ item }: { item: ShowcaseSubmission }) {
  const canLink = isValidUrl(item.deployUrl);
  const isUser = item.source === "user";
  const cardBlurb = (item.cardSummary?.trim() || item.gameplay).trim();

  const inner = (
    <article className="surface-card surface-card--lift flex h-full flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.04]">
        <img
          src={item.thumbnailUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.022]"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-95" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 to-transparent" />

        <div
          className="pointer-events-none absolute top-3.5 left-3.5 flex h-10 w-10 items-center justify-center rounded-full border border-white/16 bg-black/52 text-[#a8ffe1] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5),0_0_22px_-2px_rgba(0,255,204,0.22)] backdrop-blur-md transition-all duration-300 group-hover:scale-[1.025] group-hover:text-[#b8fff2] group-hover:shadow-[0_2px_6px_-1px_rgba(0,0,0,0.21),0_0_7px_0_rgba(0,255,204,0.16)]"
          aria-hidden
        >
          <ExternalLink className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>

        {isUser && (
          <span className="absolute top-3.5 right-3.5 rounded-full border border-[#a8ffe1]/35 bg-[#00ffcc]/14 px-2.5 py-1 font-label text-[10px] font-semibold uppercase leading-snug tracking-technical text-[#b8fff2] backdrop-blur-md">
            Live
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4 md:px-6 md:pb-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-label text-[10px] font-medium uppercase leading-snug tracking-technical text-primary/45">
              {isUser ? "参赛作品" : "官方示例"}
            </span>
            {isUser && item.gameplaySource === "ai" ? (
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 font-label text-[9px] font-semibold uppercase tracking-technical text-cyan-200/90 backdrop-blur-sm">
                AI Generated
              </span>
            ) : null}
          </span>
          <span className="rounded-full border border-white/[0.08] bg-black/25 px-2.5 py-1 font-label text-[10px] font-normal leading-snug tracking-normal text-primary/45">
            HTML5 · 网页游戏
          </span>
        </div>

        <h2 className="font-headline text-lg font-semibold leading-snug tracking-tight text-[#FFFFFF] md:text-xl md:tracking-[-0.02em]">
          {item.gameName}
        </h2>
        {item.creatorNickname?.trim() ? (
          <p className="mt-1 font-label text-[11px] font-medium tracking-normal text-primary/50">
            制作者 · {item.creatorNickname.trim()}
          </p>
        ) : null}
        <p className="font-body type-body-compact mt-2.5 flex-1 text-sm leading-[1.21] tracking-normal text-on-background/88 md:text-[0.95rem]">
          {excerpt(cardBlurb)}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {item.techStack.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-[#00ffcc]/28 bg-[#00ffcc]/[0.11] px-2 py-1 font-label text-[10px] font-medium tracking-normal text-[#b8fff2] transition-[border-color,background-color,box-shadow] duration-300 group-hover:border-[#00ffcc]/36 group-hover:bg-[#00ffcc]/[0.13] group-hover:shadow-[0_0_2px_-1px_rgba(0,255,204,0.125)]"
            >
              {tag}
            </span>
          ))}
          {item.techStack.length > 5 && (
            <span className="self-center font-label text-[10px] tracking-normal text-primary/45">
              +{item.techStack.length - 5}
            </span>
          )}
        </div>
        <p
          className={`font-label mt-3.5 border-t border-white/[0.06] pt-3 text-[10px] font-medium uppercase leading-snug tracking-technical transition-colors duration-300 ${
            canLink ? "text-primary/40 group-hover:text-[#00ffcc]/42" : "text-red-400/80"
          }`}
        >
          {canLink ? (
            <span className="inline-flex items-center gap-0.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5">
              Open in new tab →
            </span>
          ) : (
            "链接无效"
          )}
        </p>
      </div>
    </article>
  );

  if (canLink) {
    return (
      <a
        href={item.deployUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="showcase-card-hit group relative block h-full rounded-[1.125rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ffcc]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {inner}
      </a>
    );
  }

  return (
    <div className="relative block h-full cursor-not-allowed rounded-[1.125rem] opacity-[0.82]">{inner}</div>
  );
}

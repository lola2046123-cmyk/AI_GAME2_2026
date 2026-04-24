import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";
import { ShowcaseVoteBar } from "../components/showcase/ShowcaseVoteBar";
import { SHOWCASE_DETAILS } from "../data/showcaseDetails";
import { getShowcaseListAsync } from "../lib/showcaseMerge";
import { MOCK_SHOWCASE } from "../data/mockShowcase";
import {
  getVoteStateForProjects,
  type ShowcaseVoteState
} from "../lib/showcaseVotes";
import type { ShowcaseSubmission } from "../types/submission";
import { stripMarkdownToPlain } from "../lib/showcaseCardSummary";

/* ────────────────────────────────────────
   奖项状态映射（与 ShowcasePage 保持一致）
──────────────────────────────────────── */
const AWARD_STATUS: Record<string, "winner" | "finalist"> = {
  "mock-stellar": "winner",
  "mock-echoes": "finalist",
  "mock-bonsai": "finalist"
};

/* ────────────────────────────────────────
   Prose 样式（替代 @tailwindcss/typography）
──────────────────────────────────────── */
const proseClass = [
  "prose-article",
  "max-w-none",
  "text-white/70",
  "leading-relaxed"
].join(" ");

export function ShowcaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [mode, setMode] = useState<"preview" | "source">("preview");
  const [item, setItem] = useState<ShowcaseSubmission | null | undefined>(undefined);
  const [voteState, setVoteState] = useState<ShowcaseVoteState>({
    counts: { like: 0, fun: 0, visual: 0, gameplay: 0 },
    userVotes: []
  });

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setItem(null);
      return;
    }

    void getShowcaseListAsync()
      .then((list) => {
        if (cancelled) return;
        const hit =
          list.find((entry) => entry.id === id) ??
          MOCK_SHOWCASE.find((entry) => entry.id === id) ??
          null;
        setItem(hit);
      })
      .catch(() => {
        if (!cancelled) {
          setItem(MOCK_SHOWCASE.find((entry) => entry.id === id) ?? null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    if (!id || !item) return;

    void getVoteStateForProjects([id])
      .then((map) => {
        if (!cancelled && map[id]) setVoteState(map[id]);
      })
      .catch(() => {
        if (!cancelled) {
          setVoteState({
            counts: { like: 0, fun: 0, visual: 0, gameplay: 0 },
            userVotes: []
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, item]);

  const detail = id ? SHOWCASE_DETAILS[id] : undefined;

  if (item === undefined) {
    return (
      <main className="min-h-[50vh] -mt-[var(--site-header-height)] scroll-mt-[var(--site-header-height)] bg-background px-6 pt-[calc(var(--site-header-height)+2.5rem)] pb-20 text-center text-white/55 md:px-12 md:pt-[calc(var(--site-header-height)+3rem)]">
        加载中...
      </main>
    );
  }

  if (!item) return <Navigate to="/showcase" replace />;

  const status = id ? AWARD_STATUS[id] : undefined;
  const summary = detail?.summary ?? item.cardSummary ?? item.gameplay;
  const summaryPlainHero = stripMarkdownToPlain(summary);
  const markdown = detail?.markdown ?? `# ${item.gameName}\n\n${item.gameplay}`;
  const author = detail?.author ?? item.creatorNickname ?? "—";

  function isValidUrl(url: string) {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }
  const canLink = isValidUrl(item.deployUrl);

  return (
    <>
      <main className="relative -mt-[var(--site-header-height)] scroll-mt-[var(--site-header-height)] bg-background pt-[calc(var(--site-header-height)+0.5rem)] pb-[max(6rem,calc(env(safe-area-inset-bottom,0px)+5rem))]">
        {/* ── Hero：封面 + 叠渐变；简介仅行截断；底部再叠一层黑渐变与下方正文区衔接 */}
        <div className="relative isolate w-full overflow-x-clip">
          <div className="relative w-full min-h-[min(42svh,17rem)] md:min-h-[min(46vh,22rem)]">
            <img
              src={item.thumbnailUrl}
              alt={item.gameName}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0 z-0 max-md:bg-gradient-to-b max-md:from-background/90 max-md:via-background/48 max-md:to-background/92 md:bg-gradient-to-t md:from-background/25 md:via-background/65 md:to-background"
              aria-hidden
            />
            {/* 底部压暗条：与 main 背景 #101010 自然过渡到下方面板 */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[min(40%,12rem)] min-h-[5.5rem] bg-gradient-to-b from-transparent via-background/75 to-background md:h-[min(38%,14rem)] md:min-h-[6.5rem]"
              aria-hidden
            />
            <div className="relative z-[2] px-4 pb-10 pt-8 sm:px-6 md:px-12 md:pb-14 md:pt-12">
              <div className="mx-auto w-full max-w-home">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {status === "winner" && (
                      <span className="rounded-full border border-yellow-400/45 bg-yellow-400/15 px-3 py-1 font-label text-xs font-semibold uppercase tracking-widest text-yellow-200">
                        获奖作品
                      </span>
                    )}
                    {status === "finalist" && (
                      <span className="rounded-full border border-primary/45 bg-primary/12 px-3 py-1 font-label text-xs font-semibold uppercase tracking-widest text-primary">
                        入围作品
                      </span>
                    )}
                  </div>

                  <h1 className="font-headline text-2xl font-bold leading-snug tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] sm:text-3xl md:text-4xl lg:text-5xl">
                    {item.gameName}
                  </h1>

                  <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-body text-sm text-white/75 drop-shadow-md md:text-base">
                    <span className="font-label font-medium text-primary/75">
                      创作者
                    </span>
                    <span className="text-white/90">{author}</span>
                  </p>

                  <div className="mt-5">
                    <ShowcaseVoteBar
                      projectId={item.id}
                      state={voteState}
                      prominent
                      detailHero
                      onStateChange={(updater) => setVoteState((prev) => updater(prev))}
                    />
                  </div>

                  <p
                    className="mt-5 max-w-2xl font-body text-sm leading-relaxed text-white/75 drop-shadow-[0_1px_12px_rgba(0,0,0,0.45)] md:text-base line-clamp-4 md:line-clamp-3"
                    title={summaryPlainHero}
                  >
                    {summaryPlainHero}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.techStack.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#00ffcc]/35 bg-[#00ffcc]/[0.12] px-3 py-1 font-label text-xs tracking-normal text-[#d2fff0]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {canLink && (
                    <div className="mt-8">
                      <a
                        href={item.deployUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center gap-2 px-7 py-3 text-sm"
                      >
                        立即体验
                        <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                      </a>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 内容区：略上移与 Hero 底渐变叠化衔接 */}
        <div className="relative z-[1] mx-auto w-full max-w-home scroll-mt-[calc(var(--site-header-height)+0.75rem)] -mt-6 bg-background px-6 pt-6 pb-2 max-sm:px-4 max-sm:pt-5 md:-mt-8 md:px-12 md:pt-10 md:pb-0">

          {/* 模式切换 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-8 w-fit"
            role="tablist"
            aria-label="内容视图"
          >
            <div className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.025] p-1">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "preview"}
                aria-controls="tab-panel-preview"
                id="tab-preview"
                onClick={() => setMode("preview")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-label text-xs font-medium uppercase tracking-widest transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                  mode === "preview"
                    ? "bg-white/[0.1] text-white"
                    : "text-white/35 hover:text-white/65"
                }`}
              >
                预览
                <span className="text-[9px] opacity-50">Preview</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "source"}
                aria-controls="tab-panel-source"
                id="tab-source"
                onClick={() => setMode("source")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-label text-xs font-medium uppercase tracking-widest transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                  mode === "source"
                    ? "bg-white/[0.1] text-white"
                    : "text-white/35 hover:text-white/65"
                }`}
              >
                源码
                <span className="text-[9px] opacity-50">Markdown</span>
              </button>
            </div>
          </motion.div>

          {/* Markdown 内容 */}
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-3xl"
          >
            {mode === "preview" ? (
              <div
                id="tab-panel-preview"
                role="tabpanel"
                aria-labelledby="tab-preview"
                className={proseClass}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  disallowedElements={["html", "script"]}
                  components={{
                    h1: ({ children }) => (
                      <h2 className="mb-4 mt-8 font-headline text-2xl font-bold tracking-tight text-white md:text-3xl first:mt-0">
                        {children}
                      </h2>
                    ),
                    h2: ({ children }) => (
                      <h3 className="mb-3 mt-7 font-headline text-xl font-semibold tracking-tight text-white md:text-2xl">
                        {children}
                      </h3>
                    ),
                    h3: ({ children }) => (
                      <h4 className="mb-2 mt-5 font-headline text-base font-semibold tracking-tight text-white md:text-lg">
                        {children}
                      </h4>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 font-body text-sm leading-relaxed text-white/70 md:text-base">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-4 space-y-1.5 pl-5 font-body text-sm text-white/70 md:text-base">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-4 space-y-1.5 pl-5 font-body text-sm text-white/70 md:text-base">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="list-disc marker:text-primary/50">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="my-5 border-l-2 border-primary/40 pl-5 font-body text-sm italic text-white/50 md:text-base">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children, className }) => {
                      const isBlock = className?.includes("language-");
                      if (isBlock) {
                        return (
                          <code className="block w-full overflow-x-auto rounded-lg border border-white/[0.07] bg-white/[0.04] p-4 font-reward-hud text-xs leading-relaxed text-primary/80 md:text-sm">
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className="rounded border border-white/[0.08] bg-white/[0.06] px-1.5 py-0.5 font-reward-hud text-xs text-primary/90">
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="mb-4 overflow-x-auto rounded-xl border border-white/[0.07] bg-[#0e0e0e] p-5">
                        {children}
                      </pre>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary/80 underline underline-offset-2 transition-colors hover:text-primary"
                      >
                        {children}
                      </a>
                    ),
                    img: ({ src, alt }) => (
                      <img
                        src={src}
                        alt={alt || "(图片)"}
                        className="my-5 w-full rounded-xl border border-white/[0.07] object-cover"
                        loading="lazy"
                      />
                    ),
                    hr: () => (
                      <hr className="my-8 border-white/[0.08]" />
                    ),
                    table: ({ children }) => (
                      <div className="my-5 overflow-x-auto rounded-xl border border-white/[0.07]">
                        <table className="w-full font-body text-sm text-white/70">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="border-b border-white/[0.07] bg-white/[0.04]">
                        {children}
                      </thead>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-2.5 text-left font-label text-xs font-semibold uppercase tracking-widest text-white/50">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border-t border-white/[0.05] px-4 py-2.5">
                        {children}
                      </td>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-white/90">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-white/60">{children}</em>
                    )
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            ) : (
              /* 源码视图 */
              <div
                id="tab-panel-source"
                role="tabpanel"
                aria-labelledby="tab-source"
                className="relative rounded-xl border border-white/[0.07] bg-[#0c0c0c]"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
                  <span className="font-label text-[10px] uppercase tracking-widest text-white/30">
                    Markdown Source
                  </span>
                  <span className="font-label text-[10px] uppercase tracking-widest text-white/20">
                    {markdown.length} chars
                  </span>
                </div>
                <textarea
                  readOnly
                  value={markdown}
                  className="w-full resize-none bg-transparent px-5 py-4 font-reward-hud text-xs leading-relaxed text-white/55 outline-none md:text-sm"
                  rows={Math.min(40, markdown.split("\n").length + 2)}
                  spellCheck={false}
                />
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-white/[0.06] bg-background px-6 pt-10 pb-[max(3rem,calc(env(safe-area-inset-bottom,0px)+2.5rem))] font-label text-[10px] font-medium uppercase tracking-technical text-white/25 sm:pt-12 md:px-12 md:pt-16 md:pb-20">
        <div className="mx-auto flex w-full max-w-home items-center justify-between">
          <span>© 2026 AI_GAME_CONTEST · {item.gameName}</span>
          <Link
            to="/showcase"
            className="font-label text-[15px] uppercase tracking-widest text-white/25 transition-colors hover:text-white/50"
          >
            ← 返回展示
          </Link>
        </div>
      </footer>
    </>
  );
}

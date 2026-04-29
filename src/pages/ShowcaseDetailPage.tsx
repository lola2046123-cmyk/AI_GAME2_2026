import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUpRight } from "lucide-react";
import { ThinArrow } from "../components/ThinArrow";
import { SHOWCASE_DETAILS } from "../data/showcaseDetails";
import { getShowcaseListAsync } from "../lib/showcaseMerge";
import { gameNameSecondaryLine } from "../lib/gameNameBilingual";
import { formatComposition } from "../lib/composition";
import { unsplashSrcSet } from "../lib/responsiveThumbnail";
import { MOCK_SHOWCASE } from "../data/mockShowcase";
import type { ShowcaseSubmission } from "../types/submission";

/* ────────────────────────────────────────
   奖项状态映射
──────────────────────────────────────── */
const AWARD_STATUS: Record<string, "winner" | "finalist"> = {
  "mock-stellar": "winner",
  "mock-echoes": "finalist",
  "mock-bonsai": "finalist"
};

const SUBTITLE_HEX = "#A8FFE1";

/* ────────────────────────────────────────
   Prose 样式
──────────────────────────────────────── */
const proseClass = ["prose-article", "max-w-none", "text-white/70", "leading-relaxed"].join(" ");

export function ShowcaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [mode, setMode] = useState<"preview" | "source">("preview");
  const [item, setItem] = useState<ShowcaseSubmission | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    if (!id) { setItem(null); return; }
    void getShowcaseListAsync()
      .then((list) => {
        if (cancelled) return;
        const hit =
          list.find((e) => e.id === id) ??
          MOCK_SHOWCASE.find((e) => e.id === id) ??
          null;
        setItem(hit);
      })
      .catch(() => {
        if (!cancelled)
          setItem(MOCK_SHOWCASE.find((e) => e.id === id) ?? null);
      });
    return () => { cancelled = true; };
  }, [id]);

  const detail = id ? SHOWCASE_DETAILS[id] : undefined;

  if (item === undefined) {
    return (
      <main className="min-h-[50vh] -mt-[var(--site-header-height)] bg-background px-6 pt-[calc(var(--site-header-height)+3rem)] pb-20 text-center text-white/55 md:px-12">
        加载中…
      </main>
    );
  }
  if (!item) return <Navigate to="/showcase" replace />;

  const status = id ? AWARD_STATUS[id] : undefined;
  const markdown = detail?.markdown ?? `# ${item.gameName}\n\n${item.gameplay}`;

  function isValidUrl(url: string) {
    try { const u = new URL(url); return u.protocol === "http:" || u.protocol === "https:"; }
    catch { return false; }
  }
  const canLink = isValidUrl(item.deployUrl);
  const gameNameSubtitle = gameNameSecondaryLine(item.gameName);
  const compositionLabel = formatComposition(item.composition);
  const detailThumbSrcSet = unsplashSrcSet(item.thumbnailUrl);

  return (
    <>
      <main className="relative -mt-[var(--site-header-height)] bg-background pt-[var(--site-header-height)] pb-[max(6rem,calc(env(safe-area-inset-bottom,0px)+5rem))]">

        {/* ══════════════════════════════════════
            Hero：封面大图 + 居中信息布局
        ══════════════════════════════════════ */}
        <div className="relative isolate w-full overflow-x-clip">
          <div className="relative min-h-[clamp(12.5rem,39dvh,20.5rem)] w-full overflow-hidden sm:min-h-[min(53vh,26rem)] md:min-h-[min(58vh,30.5rem)]">

            {/* 封面图：铺满 Hero 高度，裁切不变形 */}
            <img
              src={item.thumbnailUrl}
              srcSet={detailThumbSrcSet}
              sizes="100vw"
              alt={item.gameName}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_35%] sm:object-[center_40%] md:object-center"
              decoding="async"
            />
            {/* 均匀暗化遮罩 */}
            <div className="pointer-events-none absolute inset-0 bg-black/58" aria-hidden />
            {/* 底部渐变 → background */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-b from-transparent via-background/60 to-background" aria-hidden />

            {/* ── 顶部：奖项 + 技术栈（叠在画面上方） ── */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 top-0 z-[3] flex flex-wrap items-center justify-center gap-1.5 px-3 pt-3.5 sm:gap-2 sm:px-6 sm:pt-7 md:px-12 md:pt-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {status === "winner" && (
                <span className="rounded-full border border-yellow-400/45 bg-yellow-400/15 px-3 py-1 font-label text-xs font-semibold uppercase tracking-widest text-yellow-200 backdrop-blur-sm">
                  获奖作品
                </span>
              )}
              {status === "finalist" && (
                <span className="rounded-full border border-primary/45 bg-primary/12 px-3 py-1 font-label text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur-sm">
                  入围作品
                </span>
              )}
              {item.techStack.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-black/60 px-3.5 py-1.5 font-reward-hud text-[11px] tracking-wider text-white/65 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* ── 标题 + 双语小字 + 体验按钮：在 Hero 区域内垂直居中 ── */}
            <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center px-[max(0.75rem,min(1rem,4vw))] pb-5 pt-6 text-center sm:px-6 sm:pb-10 sm:pt-12 md:px-12 md:pb-12 md:pt-[3.25rem]">
              <div className="translate-y-0 sm:-translate-y-3 md:-translate-y-5">
                <motion.div
                  className="flex max-w-4xl flex-col items-center gap-3 sm:gap-6 md:gap-7"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                <div className="flex max-w-[min(100%,calc(100vw-1.5rem))] flex-col items-center gap-0.5 text-center sm:max-w-none sm:gap-1">
                  <h1 className="font-headline text-balance text-[clamp(1.2rem,4.2vw+0.65rem,2rem)] font-bold leading-[1.12] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.7)] sm:text-4xl sm:leading-tight md:text-5xl lg:text-[3.5rem]">
                    {item.gameName}
                  </h1>
                  {gameNameSubtitle ? (
                    <p
                      className="font-label text-[11px] leading-none tracking-[0.12em] sm:text-xs sm:leading-none md:tracking-[0.14em]"
                      style={{ color: SUBTITLE_HEX }}
                    >
                      {gameNameSubtitle}
                    </p>
                  ) : null}
                </div>
                {compositionLabel ? (
                  <span
                    className="inline-flex max-w-[min(100%,calc(100vw-1.5rem))] items-center justify-center rounded-full border border-white/15 bg-black/45 px-2.5 py-0.5 font-label text-[11px] font-semibold uppercase tracking-[0.1em] backdrop-blur-sm sm:max-w-none sm:px-4 sm:py-1.5 sm:text-[17px] sm:tracking-[0.15em]"
                    style={{ color: SUBTITLE_HEX }}
                    aria-label={`创作团队：${compositionLabel}`}
                  >
                    {compositionLabel}
                  </span>
                ) : null}
                {canLink && (
                  <a
                    href={item.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-experience w-[min(100%,10.5rem)] max-w-[calc(100vw-2rem)] gap-2 whitespace-nowrap px-4 py-2.5 text-xs sm:w-[160px] sm:px-5 sm:py-3 sm:text-sm"
                  >
                    立即体验
                    <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={2} />
                  </a>
                )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            创作心语：评审重点参考；仅当作者填写后才渲染
            数据来源：item.evolution（前端语义即「创作心语」）
        ══════════════════════════════════════ */}
        {item.evolution?.trim() && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-[1] mx-auto w-full max-w-home px-4 pt-8 sm:px-6 md:px-12 md:pt-10"
          >
            {/*
              章节式样式：长文（接近 5000 字）下保持正文阅读节奏，
              移除卡片化高亮容器，仅以顶部 hairline + 章节标题作锚点。
            */}
            <div className="border-t pt-6 md:pt-7" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 md:mb-5">
                <span className="font-headline text-base font-semibold text-white md:text-lg">
                  创作心语
                </span>
                <span className="font-label text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Creator&apos;s Note
                </span>
              </div>
              <div className="prose-article max-w-none leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  disallowedElements={["html", "script"]}
                  components={{
                    p: ({ children }) => (
                      <p className="mb-4 font-body text-sm leading-7 text-white/70 md:text-base md:leading-[1.85] last:mb-0">
                        {children}
                      </p>
                    ),
                    h1: ({ children }) => (
                      <h3 className="mb-2 mt-4 font-headline text-base font-semibold tracking-tight text-white md:text-lg first:mt-0">
                        {children}
                      </h3>
                    ),
                    h2: ({ children }) => (
                      <h4 className="mb-2 mt-3 font-headline text-sm font-semibold tracking-tight text-white md:text-base first:mt-0">
                        {children}
                      </h4>
                    ),
                    h3: ({ children }) => (
                      <h5 className="mb-1.5 mt-2.5 font-headline text-sm font-semibold tracking-tight text-white first:mt-0">
                        {children}
                      </h5>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-4 list-disc space-y-1.5 pl-5 font-body text-sm leading-7 text-white/70 md:text-base md:leading-[1.85]">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-4 list-decimal space-y-1.5 pl-5 font-body text-sm leading-7 text-white/70 md:text-base md:leading-[1.85]">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="marker:text-primary/50">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="my-3 border-l-2 border-primary/40 pl-4 font-body text-sm italic text-white/50 md:text-base">
                        {children}
                      </blockquote>
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
                    strong: ({ children }) => (
                      <strong className="font-semibold text-white/90">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-white/60">{children}</em>
                    ),
                    code: ({ children }) => (
                      <code className="rounded border border-white/[0.08] bg-white/[0.06] px-1.5 py-0.5 font-reward-hud text-xs text-primary/90">
                        {children}
                      </code>
                    )
                  }}
                >
                  {item.evolution}
                </ReactMarkdown>
              </div>
            </div>
          </motion.section>
        )}

        {/* ══════════════════════════════════════
            内容区：单栏（Tab + Markdown）
        ══════════════════════════════════════ */}
        <div className="relative z-[1] mx-auto w-full max-w-home px-4 pt-6 pb-2 sm:px-6 md:px-12 md:pt-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22 }}
          >
            {/* 模式切换 Tab */}
            <div className="mb-6 w-fit" role="tablist" aria-label="内容视图">
              <div className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.025] p-1">
                {(["preview", "source"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    aria-controls={`tab-panel-${m}`}
                    id={`tab-${m}`}
                    onClick={() => setMode(m)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 font-label text-xs font-medium uppercase tracking-widest transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                      mode === m
                        ? "bg-white/[0.1] text-white"
                        : "text-white/35 hover:text-white/65"
                    }`}
                  >
                    {m === "preview" ? "预览" : "源码"}
                    <span className="text-[9px] opacity-50">
                      {m === "preview" ? "Preview" : "Markdown"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 内容面板 */}
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
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
                        <a href={href} target="_blank" rel="noopener noreferrer"
                          className="text-primary/80 underline underline-offset-2 transition-colors hover:text-primary">
                          {children}
                        </a>
                      ),
                      img: ({ src, alt }) => (
                        <img src={src} alt={alt || "(图片)"}
                          className="my-5 w-full rounded-xl border border-white/[0.07] object-cover" loading="lazy" />
                      ),
                      hr: () => <hr className="my-8 border-white/[0.08]" />,
                      table: ({ children }) => (
                        <div className="my-5 overflow-x-auto rounded-xl border border-white/[0.07]">
                          <table className="w-full font-body text-sm text-white/70">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="border-b border-white/[0.07] bg-white/[0.04]">{children}</thead>
                      ),
                      th: ({ children }) => (
                        <th className="px-4 py-2.5 text-left font-label text-xs font-semibold uppercase tracking-widest text-white/50">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border-t border-white/[0.05] px-4 py-2.5">{children}</td>
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
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-white/[0.06] bg-background px-6 pt-10 pb-[max(3rem,calc(env(safe-area-inset-bottom,0px)+2.5rem))] font-label text-[10px] font-medium uppercase tracking-technical text-white/25 sm:pt-12 md:px-12 md:pt-16 md:pb-20">
        <div className="mx-auto flex w-full max-w-home items-center justify-between">
          <span>© 2026 AI_GAME_CONTEST · {item.gameName}</span>
          <Link
            to="/showcase"
            className="inline-flex items-center gap-2 font-label text-[13px] uppercase tracking-widest text-white/25 transition-colors hover:text-white/50"
          >
            <ThinArrow dir="left" className="h-[10px] w-[14px] shrink-0" /> 返回展示
          </Link>
        </div>
      </footer>

    </>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { LoginModal } from "../components/auth/LoginModal";
import { ShowcaseVoteBar } from "../components/showcase/ShowcaseVoteBar";
import { SHOWCASE_DETAILS } from "../data/showcaseDetails";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { getShowcaseListAsync } from "../lib/showcaseMerge";
import {
  getVoteStateForProjects,
  type ShowcaseVoteState
} from "../lib/showcaseVotes";
import type { ShowcaseSubmission } from "../types/submission";

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
  const { user } = useCurrentUser();
  const [item, setItem] = useState<ShowcaseSubmission | null | undefined>(undefined);
  const [loginOpen, setLoginOpen] = useState(false);
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
        if (!cancelled) {
          setItem(list.find((entry) => entry.id === id) ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setItem(null);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    if (!id || !item) return;

    void getVoteStateForProjects([id], user?.id)
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
  }, [id, item, user?.id]);

  const detail = id ? SHOWCASE_DETAILS[id] : undefined;

  if (item === undefined) {
    return (
      <main className="min-h-[50vh] bg-background px-6 py-20 text-center text-white/55 md:px-12">
        加载中...
      </main>
    );
  }

  if (!item) return <Navigate to="/showcase" replace />;

  const status = id ? AWARD_STATUS[id] : undefined;
  const summary = detail?.summary ?? item.cardSummary ?? item.gameplay;
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
      <main className="relative bg-background pb-[max(6rem,calc(env(safe-area-inset-bottom,0px)+5rem))]">

        {/* ── Hero 封面区 ── */}
        <div className="relative isolate w-full overflow-hidden">
          {/* 封面图 */}
          <div className="aspect-[21/9] w-full overflow-hidden sm:aspect-[3/1] md:aspect-[4/1]">
            <img
              src={item.thumbnailUrl}
              alt={item.gameName}
              className="h-full w-full object-cover"
            />
          </div>
          {/* 渐变遮罩 */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10"
            aria-hidden
          />

          {/* Hero 内容层 */}
          <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10 md:px-12 md:pb-14">
            <div className="mx-auto w-full max-w-home">
              {/* 返回按钮 */}
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6"
              >
                <Link
                  to="/showcase"
                  className="inline-flex items-center gap-1.5 font-label text-xs font-medium uppercase tracking-widest text-white/40 transition-colors hover:text-white/75"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  返回展示
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* 状态徽章 */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {status === "winner" && (
                    <span className="rounded-full border border-yellow-400/40 bg-yellow-400/15 px-3 py-1 font-label text-xs font-semibold uppercase tracking-widest text-yellow-300">
                      获奖作品
                    </span>
                  )}
                  {status === "finalist" && (
                    <span className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 font-label text-xs font-semibold uppercase tracking-widest text-primary">
                      入围作品
                    </span>
                  )}
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.06] px-3 py-1 font-label text-xs uppercase tracking-widest text-white/35">
                    HTML5
                  </span>
                </div>

                {/* 标题 */}
                <h1 className="font-headline text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                  {item.gameName}
                </h1>

                {/* 作者 */}
                <p className="mt-2 font-label text-sm text-white/40">
                  {author}
                </p>

                {/* 简介 */}
                <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-white/65 md:text-base">
                  {summary}
                </p>

                {/* 技术标签 */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.techStack.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#00ffcc]/20 bg-[#00ffcc]/[0.07] px-3 py-1 font-label text-xs tracking-normal text-[#a8ffe1]/75"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA 按钮组 */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {canLink && (
                    <a
                      href={item.deployUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary inline-flex items-center gap-2 px-7 py-3 text-sm"
                    >
                      立即体验
                      <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                    </a>
                  )}
                  {canLink && (
                    <a
                      href={item.deployUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-7 py-3 font-label text-sm font-medium uppercase tracking-widest text-white/65 backdrop-blur-sm transition-colors hover:border-white/25 hover:text-white/90"
                    >
                      访问项目
                    </a>
                  )}
                </div>

                <div className="mt-6">
                  <ShowcaseVoteBar
                    projectId={item.id}
                    user={user}
                    state={voteState}
                    onRequireLogin={() => setLoginOpen(true)}
                    onStateChange={(updater) => setVoteState((prev) => updater(prev))}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── 内容区 ── */}
        <div className="mx-auto w-full max-w-home px-6 pt-10 md:px-12 md:pt-14">

          {/* 模式切换 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-8 flex items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.025] p-1 w-fit"
          >
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-label text-xs font-medium uppercase tracking-widest transition-all duration-200 ${
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
              onClick={() => setMode("source")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-label text-xs font-medium uppercase tracking-widest transition-all duration-200 ${
                mode === "source"
                  ? "bg-white/[0.1] text-white"
                  : "text-white/35 hover:text-white/65"
              }`}
            >
              源码
              <span className="text-[9px] opacity-50">Markdown</span>
            </button>
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
              <div className={proseClass}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  disallowedElements={["html", "script"]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="mb-4 mt-8 font-headline text-2xl font-bold tracking-tight text-white md:text-3xl first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-3 mt-7 font-headline text-xl font-semibold tracking-tight text-white md:text-2xl">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-2 mt-5 font-headline text-base font-semibold tracking-tight text-white md:text-lg">
                        {children}
                      </h3>
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
                          <code className="block w-full overflow-x-auto rounded-lg border border-white/[0.07] bg-white/[0.04] p-4 font-reward-hud text-xs leading-relaxed text-[#a8ffe1]/80 md:text-sm">
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className="rounded border border-white/[0.08] bg-white/[0.06] px-1.5 py-0.5 font-reward-hud text-xs text-[#a8ffe1]/90">
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
                        alt={alt ?? ""}
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
              <div className="relative rounded-xl border border-white/[0.07] bg-[#0c0c0c]">
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
            className="font-label text-[10px] uppercase tracking-widest text-white/25 transition-colors hover:text-white/50"
          >
            ← 返回展示
          </Link>
        </div>
      </footer>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUpRight, Eye, Lightbulb, Coins, Heart, UserRound } from "lucide-react";
import { ThinArrow } from "../components/ThinArrow";
import { useLikeBurst } from "../components/showcase/useLikeBurst";
import { SHOWCASE_DETAILS } from "../data/showcaseDetails";
import { getShowcaseListAsync } from "../lib/showcaseMerge";
import { MOCK_SHOWCASE } from "../data/mockShowcase";
import {
  getVoteStateForProjects,
  likeProject,
  voteProject,
  type ShowcaseVoteState,
  type VoteType
} from "../lib/showcaseVotes";
import type { ShowcaseSubmission } from "../types/submission";

/* ────────────────────────────────────────
   奖项状态映射
──────────────────────────────────────── */
const AWARD_STATUS: Record<string, "winner" | "finalist"> = {
  "mock-stellar": "winner",
  "mock-echoes": "finalist",
  "mock-bonsai": "finalist"
};

/* ────────────────────────────────────────
   分类投票配置
──────────────────────────────────────── */
type CategoryType = Exclude<VoteType, "like">;

const CATEGORY_CONFIG: {
  type: CategoryType;
  label: string;
  Icon: React.ElementType;
}[] = [
  { type: "visual",    label: "视觉最佳",  Icon: Eye },
  { type: "gameplay",  label: "最有意思",  Icon: Lightbulb },
  { type: "fun",       label: "最想氪金",  Icon: Coins }
];

/* ────────────────────────────────────────
   Prose 样式
──────────────────────────────────────── */
const proseClass = ["prose-article", "max-w-none", "text-white/70", "leading-relaxed"].join(" ");

export function ShowcaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [mode, setMode] = useState<"preview" | "source">("preview");
  const [item, setItem] = useState<ShowcaseSubmission | null | undefined>(undefined);
  const [voteState, setVoteState] = useState<ShowcaseVoteState>({
    counts: { like: 0, fun: 0, visual: 0, gameplay: 0 },
    userVotes: []
  });
  const [loadingKey, setLoadingKey] = useState<VoteType | null>(null);
  const [flash, setFlash] = useState<VoteType | null>(null);
  const [voteMsg, setVoteMsg] = useState("");
  const burst = useLikeBurst();

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

  useEffect(() => {
    let cancelled = false;
    if (!id || !item) return;
    void getVoteStateForProjects([id])
      .then((map) => { if (!cancelled && map[id]) setVoteState(map[id]); })
      .catch(() => {
        if (!cancelled)
          setVoteState({ counts: { like: 0, fun: 0, visual: 0, gameplay: 0 }, userVotes: [] });
      });
    return () => { cancelled = true; };
  }, [id, item]);

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), 900);
    return () => window.clearTimeout(t);
  }, [flash]);

  async function handleLike(event?: React.MouseEvent<HTMLButtonElement>) {
    if (!id || loadingKey === "like") return;

    // 即便已经赞过，再点也给一次愉悦反馈（9 颗心 + 缩放 + 心图标震动），
    // 与列表 / 卡片侧的点赞按钮交互保持一致
    burst.trigger(event);

    if (voteState.userVotes.includes("like")) return;

    try {
      setLoadingKey("like");
      setVoteMsg("");
      await likeProject(id);
      setVoteState((prev) => ({
        counts: { ...prev.counts, like: prev.counts.like + 1 },
        userVotes: [...prev.userVotes, "like"]
      }));
      setFlash("like");
    } catch (e) {
      setVoteMsg(e instanceof Error ? e.message : "点赞失败。");
    } finally { setLoadingKey(null); }
  }

  async function handleVote(type: CategoryType) {
    if (!id || loadingKey || voteState.userVotes.includes(type)) return;
    try {
      setLoadingKey(type);
      setVoteMsg("");
      await voteProject(id, type);
      setVoteState((prev) => ({
        counts: { ...prev.counts, [type]: prev.counts[type] + 1 },
        userVotes: [...prev.userVotes, type]
      }));
      setFlash(type);
    } catch (e) {
      setVoteMsg(e instanceof Error ? e.message : "投票失败。");
    } finally { setLoadingKey(null); }
  }

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
  const author = detail?.author ?? item.creatorNickname ?? "—";

  function isValidUrl(url: string) {
    try { const u = new URL(url); return u.protocol === "http:" || u.protocol === "https:"; }
    catch { return false; }
  }
  const canLink = isValidUrl(item.deployUrl);
  const counts = voteState.counts;
  const userVotes = voteState.userVotes;

  return (
    <>
      <main className="relative -mt-[var(--site-header-height)] bg-background pt-[var(--site-header-height)] pb-[max(6rem,calc(env(safe-area-inset-bottom,0px)+5rem))]">

        {/* ══════════════════════════════════════
            Hero：封面大图 + 居中信息布局
        ══════════════════════════════════════ */}
        <div className="relative isolate w-full overflow-x-clip">
          <div className="relative flex min-h-[min(58svh,26rem)] w-full flex-col items-center justify-between px-4 py-10 text-center sm:min-h-[min(62vh,30rem)] sm:px-6 md:min-h-[min(68vh,36rem)] md:px-12">

            {/* 封面图 */}
            <img
              src={item.thumbnailUrl}
              alt={item.gameName}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* 均匀暗化遮罩 */}
            <div className="pointer-events-none absolute inset-0 bg-black/58" aria-hidden />
            {/* 底部渐变 → background */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-b from-transparent via-background/60 to-background" aria-hidden />

            {/* ── 顶部：AI 工具标签 + 奖项徽章 ── */}
            <motion.div
              className="relative z-[2] flex flex-wrap items-center justify-center gap-2"
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
              {/* AI 工具标签 — 纯文字 + 暗色胶囊，无图标无计数，与投票按钮形成明显差异 */}
              {item.techStack.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-black/60 px-3.5 py-1.5 font-reward-hud text-[11px] tracking-wider text-white/65 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* ── 中部：标题 + 创作者 + 体验按钮 ── */}
            <motion.div
              className="relative z-[2] flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-headline text-[2rem] font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.7)] sm:text-4xl md:text-5xl lg:text-[3.5rem]">
                {item.gameName}
              </h1>
              <p className="flex items-center gap-2 font-body text-sm font-medium tracking-normal [text-shadow:0_2px_12px_rgba(0,0,0,0.78)] md:text-base">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary/80">
                  <UserRound className="h-3.5 w-3.5" strokeWidth={1.8} />
                </span>
                <span className="text-primary/90">创作者</span>
                <span className="text-primary/90">{author}</span>
              </p>
              {canLink && (
                <a
                  href={item.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-experience mt-1 w-[160px] gap-2 whitespace-nowrap px-5 py-3 text-sm"
                >
                  立即体验
                  <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={2} />
                </a>
              )}
            </motion.div>

            {/* ── 底部：投票按钮行 ──
                设计差异：有图标 + 有计数 + 可交互颜色变化
                vs AI 标签：无图标 + 无计数 + 静态展示 ── */}
            <motion.div
              className="relative z-[2] w-full max-w-sm sm:max-w-none"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* 移动端 2×2 网格，sm+ 恢复单行 flex */}
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">

                {/* 点赞按钮：9 颗心爆炸 + 按钮缩放 + 心图标震动（与列表点赞动效统一） */}
                <button
                  ref={burst.btnRef}
                  type="button"
                  onClick={(e) => void handleLike(e)}
                  disabled={loadingKey === "like"}
                  className={[
                    "flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium backdrop-blur-sm transition-all duration-200 disabled:cursor-not-allowed sm:w-auto",
                    userVotes.includes("like")
                      ? "border-rose-400/50 bg-rose-500/18 text-rose-300 shadow-[0_0_16px_rgba(251,113,133,0.18)]"
                      : "border-white/[0.14] bg-black/40 text-white/60 hover:border-rose-400/40 hover:bg-rose-500/[0.1] hover:text-rose-300"
                  ].join(" ")}
                >
                  <Heart
                    ref={burst.iconRef}
                    className="h-3.5 w-3.5 shrink-0 transition-colors"
                    fill={userVotes.includes("like") ? "currentColor" : "none"}
                    strokeWidth={1.8}
                  />
                  <span className="font-label tracking-wide">点赞</span>
                  <span className="font-reward-hud text-[13px] font-bold leading-none">
                    {counts.like}
                  </span>
                </button>

                {/* 三个分类投票按钮 */}
                {CATEGORY_CONFIG.map(({ type, label, Icon }) => {
                  const active = userVotes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => void handleVote(type)}
                      disabled={loadingKey !== null || active}
                      className={[
                        "flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium backdrop-blur-sm transition-all duration-200 disabled:cursor-not-allowed sm:w-auto",
                        active
                          ? "border-primary/45 bg-primary/15 text-primary shadow-[0_0_16px_rgba(168,255,225,0.15)]"
                          : "border-white/[0.14] bg-black/40 text-white/55 hover:border-primary/35 hover:bg-primary/[0.08] hover:text-primary/80"
                      ].join(" ")}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                      <span className="font-label tracking-wide">{label}</span>
                      <span className="font-reward-hud text-[13px] font-bold leading-none">
                        {counts[type]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 反馈提示 */}
              {flash && (
                <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 font-label text-[10px] uppercase tracking-widest text-primary/90">
                  +1
                </span>
              )}
            </motion.div>

            {voteMsg && (
              <p className="relative z-[2] mt-2 font-body text-xs text-red-400/80">{voteMsg}</p>
            )}
          </div>
        </div>

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

      {/* 9 颗心爆炸 portal —— useLikeBurst 内部已 portal 到 body，这里渲染挂载点即可 */}
      {burst.portal}
    </>
  );
}

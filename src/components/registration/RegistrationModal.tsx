import { useEffect, useRef, useState, type ChangeEvent, type FocusEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, X } from "lucide-react";
import { MarkdownEditor } from "./MarkdownEditor";
import { ThinArrow } from "../ThinArrow";
import {
  appendSubmission,
  updateSubmission
} from "../../lib/submissionsStorage";
import { compressImageFileToJpegDataUrl } from "../../lib/imageCompress";
import { requestScreenshot } from "../../lib/screenshotApi";
import type { RegistrationModalState } from "../../types/registrationModal";
import type { ShowcaseSubmission } from "../../types/submission";

const PRESET_TOOLS = [
  "Gemini",
  "Cursor",
  "Midjourney",
  "Stable Diffusion",
  "ChatGPT",
  "Copilot",
  "Claude"
] as const;

/** 游戏名称上限（码位） */
const MAX_GAME_NAME_CHARS = 20;
/** 玩法 / 进化论 / 链接等文本上限（码位） */
const MAX_FIELD_CHARS = 2000;
/** 核心玩法说明上限（码位）—单独放宽到 30000，便于承载更完整的设计描述 */
const MAX_GAMEPLAY_CHARS = 30000;
/** 首页卡片摘要上限（码位） */
const MAX_CARD_SUMMARY = 220;

function countChars(s: string): number {
  return [...s].length;
}

function clampChars(s: string, max: number): string {
  const arr = [...s];
  if (arr.length <= max) return s;
  return arr.slice(0, max).join("");
}

const inputSurface =
  "w-full rounded-xl border border-white/[0.12] bg-black/35 px-4 py-3 font-body text-sm text-on-background shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-primary/45 outline-none transition-[border-color,box-shadow] focus:border-primary-container/50 focus:shadow-[0_0_0_3px_rgba(0,255,204,0.18)]";

type Props = {
  state: RegistrationModalState;
  onStateChange: (s: RegistrationModalState) => void;
  /** 新建提交成功（跳转展示页等） */
  onSubmitted?: () => void;
  /** 管理员编辑保存成功 */
  onAdminSaved?: () => void;
};

export function RegistrationModal({
  state,
  onStateChange,
  onSubmitted,
  onAdminSaved
}: Props) {
  const open = state.kind !== "closed";
  const isEdit = state.kind === "edit";

  const [step, setStep] = useState(1);
  const [gameName, setGameName] = useState("");
  const [gameplay, setGameplay] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [customTool, setCustomTool] = useState("");
  const [deployUrl, setDeployUrl] = useState("");
  /** 用户新选的封面（JPEG data URL）；优先于截图服务 */
  const [coverDataUrl, setCoverDataUrl] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  /** 表单滚动容器 ref，用于移动端键盘弹出时将焦点元素滚动到视口 */
  const formScrollRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /**
   * 来源标记：历史记录可能带 "ai" / "local"（旧版文档解析结果），
   * 新提交一律视为 "manual"。保留字段以便 AdminPage 查看/编辑旧数据。
   */
  const [gameplaySource, setGameplaySource] = useState<"manual" | "ai" | "local">(
    "manual"
  );
  /** 与 gameplay 在文档解析模式下联动，用于首页卡片展示 */
  const [cardSummary, setCardSummary] = useState<string | null>(null);

  const reset = () => {
    setStep(1);
    setGameName("");
    setGameplay("");
    setTechStack([]);
    setCustomTool("");
    setDeployUrl("");
    setCoverDataUrl(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
    setError(null);
    setSubmitting(false);
    setGameplaySource("manual");
    setCardSummary(null);
  };

  const hydrate = (r: ShowcaseSubmission) => {
    setStep(1);
    setGameName(clampChars(r.gameName, MAX_GAME_NAME_CHARS));
    setGameplay(clampChars(r.gameplay, MAX_GAMEPLAY_CHARS));
    setTechStack(r.techStack.map((t) => clampChars(t, MAX_FIELD_CHARS)));
    setDeployUrl(clampChars(r.deployUrl, MAX_FIELD_CHARS));
    setCoverDataUrl(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
    setCustomTool("");
    setError(null);
    setSubmitting(false);
    setGameplaySource(
      r.gameplaySource === "ai"
        ? "ai"
        : r.gameplaySource === "local"
          ? "local"
          : "manual"
    );
    setCardSummary(
      r.cardSummary?.trim()
        ? clampChars(r.cardSummary.trim(), MAX_CARD_SUMMARY)
        : r.gameplaySource === "ai" || r.gameplaySource === "local"
          ? clampChars(r.gameplay.trim(), MAX_CARD_SUMMARY)
          : null
    );
  };

  const hydrateKey =
    state.kind === "edit"
      ? `${state.record.id}:${state.record.deployUrl}:${state.record.gameName}`
      : state.kind;

  useEffect(() => {
    if (state.kind === "closed") return;
    if (state.kind === "create") reset();
    else if (state.kind === "edit") hydrate(state.record);
  }, [hydrateKey, state.kind]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onStateChange({ kind: "closed" });
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onStateChange]);

  /** 移动端键盘弹出后，把聚焦的输入框滚动到可见区域 */
  useEffect(() => {
    const el = formScrollRef.current;
    if (!el) return;
    const onFocusin = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      window.setTimeout(() => {
        target.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }, 100);
    };
    el.addEventListener("focusin", onFocusin);
    return () => el.removeEventListener("focusin", onFocusin);
  }, []);

  const close = () => {
    onStateChange({ kind: "closed" });
    window.setTimeout(reset, 320);
  };

  const pickCover = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      setError(null);
      const dataUrl = await compressImageFileToJpegDataUrl(f);
      setCoverDataUrl(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "图片处理失败");
    }
  };

  const existingThumbUrl =
    isEdit && state.kind === "edit" ? state.record.thumbnailUrl : null;
  const coverPreviewUrl = coverDataUrl ?? existingThumbUrl;

  const toggleTool = (t: string) => {
    setTechStack((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const addCustomTool = () => {
    const v = clampChars(customTool.trim(), MAX_FIELD_CHARS);
    if (!v || techStack.includes(v)) return;
    setTechStack((p) => [...p, v]);
    setCustomTool("");
  };

  const validateStep1 = () => {
    const gn = gameName.trim();
    if (!gn) return "请填写游戏名称";
    if (countChars(gn) > MAX_GAME_NAME_CHARS) {
      return `游戏名称不超过 ${MAX_GAME_NAME_CHARS} 个字符`;
    }
    const gp = gameplay.trim();
    if (!gp) return "请填写核心玩法说明";
    if (countChars(gp) > MAX_GAMEPLAY_CHARS) {
      return `核心玩法说明不超过 ${MAX_GAMEPLAY_CHARS} 个字符`;
    }
    return null;
  };

  const validateStep2 = () => {
    if (techStack.length === 0) return "请至少选择或填写一项 AI 工具";
    return null;
  };

  const validateStep3 = () => {
    const u = deployUrl.trim();
    if (!u) return "请填写部署链接";
    if (countChars(u) > MAX_FIELD_CHARS) {
      return `部署链接不超过 ${MAX_FIELD_CHARS} 个字符`;
    }
    try {
      new URL(u);
    } catch {
      return "请输入有效的 URL（含 https://）";
    }
    return null;
  };

  const next = () => {
    setError(null);
    if (step === 1) {
      const e = validateStep1();
      if (e) {
        setError(e);
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      const e = validateStep2();
      if (e) {
        setError(e);
        return;
      }
      setStep(3);
    }
  };

  const back = () => {
    setError(null);
    if (step > 1) setStep((s) => s - 1);
  };

  const submit = async () => {
    const e = validateStep3();
    if (e) {
      setError(e);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const url = deployUrl.trim();
      if (isEdit && state.kind === "edit") {
        const prevUrl = state.record.deployUrl.trim();
        let thumbnailUrl: string;
        if (coverDataUrl) {
          thumbnailUrl = coverDataUrl;
        } else if (url !== prevUrl) {
          thumbnailUrl = await requestScreenshot(url);
        } else {
          thumbnailUrl = state.record.thumbnailUrl;
        }
        await updateSubmission(state.record.id, {
          gameName: gameName.trim(),
          gameplay: gameplay.trim(),
          cardSummary:
            gameplaySource === "ai" || gameplaySource === "local"
              ? clampChars((cardSummary ?? gameplay).trim(), MAX_CARD_SUMMARY)
              : undefined,
          gameplaySource,
          techStack: [...techStack],
          // UI 已移除 AI 进化论输入；编辑态保留原值以免破坏历史数据
          evolution: state.record.evolution ?? "",
          deployUrl: url,
          thumbnailUrl,
          is_visible: state.record.is_visible !== false
        });
        close();
        onAdminSaved?.();
      } else {
        const thumbnailUrl = coverDataUrl ?? (await requestScreenshot(url));
        const entry: ShowcaseSubmission = {
          id: crypto.randomUUID(),
          gameName: gameName.trim(),
          gameplay: gameplay.trim(),
          cardSummary:
            gameplaySource === "ai" || gameplaySource === "local"
              ? clampChars((cardSummary ?? gameplay).trim(), MAX_CARD_SUMMARY)
              : undefined,
          gameplaySource,
          techStack: [...techStack],
          // UI 已移除 AI 进化论输入；新建提交写空字符串
          evolution: "",
          deployUrl: url,
          thumbnailUrl,
          createdAt: new Date().toISOString(),
          source: "user",
          is_visible: true
        };
        await appendSubmission(entry);
        close();
        onSubmitted?.();
      }
    } catch (err) {
      const detail =
        err instanceof Error && err.message ? err.message : String(err ?? "");
      console.error("[RegistrationModal] submit failed", err);
      setError(
        detail
          ? `提交失败：${detail}`
          : "提交失败，请检查网络或稍后重试"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const modalTitle = isEdit ? "编辑作品" : "提交作品";

  /* ── 字段标题：强化，作为视觉锚点 ── */
  const fieldLabel = "font-label text-sm font-semibold text-white";
  /* ── 字符计数器：极度弱化，不抢眼 ── */
  const charCount = "font-label text-[10px] tabular-nums text-white/25";
  /* ── 辅助提示：弱化，仅补充信息 ── */
  const fieldHint = "mt-1.5 font-body text-[11px] leading-relaxed text-white/30";
  /* ── 字段间分隔线 ── */
  const fieldDivider = "border-b border-white/[0.06] pb-4 mb-1";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-x-0 top-0 z-[100] flex h-dvh items-center justify-center px-4 py-[max(1rem,env(safe-area-inset-top,0.5rem))] pb-[max(1rem,env(safe-area-inset-bottom,0.5rem))] sm:inset-0 sm:h-auto sm:p-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.button
            type="button"
            aria-label="关闭"
            className="absolute inset-0 bg-black/55 backdrop-blur-[12px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reg-modal-title"
            className="glass-floating-panel relative z-10 flex max-h-[calc(100dvh-2.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-[1.35rem] sm:max-h-[min(92vh,860px)]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            {/* ── 顶部 Header ── */}
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-5 py-4 md:px-6">
              <h2
                id="reg-modal-title"
                className="font-headline text-lg font-semibold tracking-tight text-white md:text-xl"
              >
                {modalTitle}
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="关闭"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/5 hover:text-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            {/* ── 进度条 + 步骤标签 ── */}
            <div className="flex shrink-0 flex-col gap-2 border-b border-white/[0.05] px-5 pt-3 pb-3.5 md:px-6">
              <div className="flex items-center justify-between">
                {(["作品信息", "AI 工具", "发布上线"] as const).map((label, i) => {
                  const n = i + 1;
                  const active = step === n;
                  const done = step > n;
                  return (
                    <span
                      key={label}
                      className={`font-label text-[10px] font-medium uppercase tracking-widest transition-colors duration-200 ${
                        active
                          ? "text-primary"
                          : done
                          ? "text-white/35"
                          : "text-white/20"
                      }`}
                    >
                      {n}&nbsp;·&nbsp;{label}
                    </span>
                  );
                })}
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className={`h-full rounded-full transition-all duration-400 ${
                        n <= step ? "w-full bg-primary-container" : "w-0"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── 表单主体 ── */}
            <div ref={formScrollRef} className="min-h-0 flex-1 overflow-y-auto scroll-smooth px-5 py-5 pb-3 scroll-pb-6 md:px-6 md:pb-5">
              <AnimatePresence mode="wait">

                {/* ────── 步骤 1：作品信息 ────── */}
                {step === 1 && (
                  <motion.div
                    key="s1"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    {/* 游戏名称 */}
                    <label className={`block ${fieldDivider}`}>
                      <div className="mb-2.5 flex items-baseline justify-between gap-2">
                        <span className={fieldLabel}>游戏名称</span>
                        <span className={charCount}>{countChars(gameName)}/{MAX_GAME_NAME_CHARS}</span>
                      </div>
                      <input
                        className={inputSurface}
                        value={gameName}
                        onChange={(e) => setGameName(clampChars(e.target.value, MAX_GAME_NAME_CHARS))}
                        placeholder="你的游戏叫什么名字？"
                        maxLength={MAX_GAME_NAME_CHARS * 2}
                        enterKeyHint="next"
                      />
                    </label>

                    {/* 核心玩法说明 */}
                    <div>
                      <div className="mb-2.5 flex items-baseline justify-between gap-2">
                        <span className={fieldLabel}>
                          核心玩法说明
                          {(gameplaySource === "ai" || gameplaySource === "local") && (
                            <span className="ml-2 font-label text-[10px] font-normal normal-case text-primary-container/70">
                              · 已从文档解析，可改
                            </span>
                          )}
                        </span>
                        <span className={charCount}>{countChars(gameplay)}/{MAX_GAMEPLAY_CHARS}</span>
                      </div>
                      <MarkdownEditor
                        value={gameplay}
                        onChange={(v) => {
                          const clamped = clampChars(v, MAX_GAMEPLAY_CHARS);
                          setGameplay(clamped);
                          if (gameplaySource === "ai" || gameplaySource === "local") {
                            setCardSummary(clampChars(clamped.trim(), MAX_CARD_SUMMARY));
                          }
                        }}
                        placeholder="描述核心玩法机制与节奏，以及 AI 在开发过程中扮演的角色…支持 Markdown 图文混排"
                        rows={4}
                        maxLength={MAX_GAMEPLAY_CHARS * 2}
                        textareaClassName={`${inputSurface} min-h-[110px] resize-y`}
                      />
                    </div>
                  </motion.div>
                )}

                {/* ────── 步骤 2：AI 工具 ────── */}
                {step === 2 && (
                  <motion.div
                    key="s2"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <div>
                      <p className={`mb-1 ${fieldLabel}`}>使用的 AI 工具</p>
                      <p className="mb-4 font-body text-[11px] leading-relaxed text-white/30">
                        选择本次创作中用到的 AI 工具，至少选择一项
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_TOOLS.map((t) => {
                          const on = techStack.includes(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => toggleTool(t)}
                              className={`rounded-full border px-3.5 py-1.5 font-label text-xs font-medium tracking-normal transition-all duration-200 ${
                                on
                                  ? "border-primary-container/55 bg-primary-container/15 text-primary-container shadow-[0_0_18px_-4px_rgba(0,255,204,0.45)]"
                                  : "border-white/[0.12] bg-white/[0.04] text-white/45 hover:border-white/25 hover:text-white/70"
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>

                      {/* 自定义工具输入 */}
                      <div className="mt-4 flex gap-2">
                        <input
                          className={inputSurface}
                          value={customTool}
                          onChange={(e) => setCustomTool(clampChars(e.target.value, MAX_FIELD_CHARS))}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTool())}
                          placeholder="其他工具名称，回车加入"
                          maxLength={MAX_FIELD_CHARS * 2}
                        />
                        <button
                          type="button"
                          onClick={addCustomTool}
                          className="shrink-0 rounded-xl border border-primary-container/35 bg-primary-container/10 px-4 font-label text-xs font-semibold text-primary-container transition-colors hover:bg-primary-container/18"
                        >
                          添加
                        </button>
                      </div>

                      {techStack.length > 0 && (
                        <p className="mt-3 border-t border-white/[0.06] pt-3 font-label text-[11px] text-white/40">
                          已选：
                          <span className="text-primary/70">{techStack.join("  ·  ")}</span>
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ────── 步骤 3：发布上线 ────── */}
                {step === 3 && (
                  <motion.div
                    key="s3"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    {/* 部署链接 */}
                    <label className={`block ${fieldDivider}`}>
                      <div className="mb-2.5 flex items-baseline justify-between gap-2">
                        <span className={fieldLabel}>游戏链接</span>
                        <span className={charCount}>{countChars(deployUrl)}/{MAX_FIELD_CHARS}</span>
                      </div>
                      <input
                        className={inputSurface}
                        value={deployUrl}
                        onChange={(e) => setDeployUrl(clampChars(e.target.value, MAX_FIELD_CHARS))}
                        placeholder="https://your-game.example.com"
                        inputMode="url"
                        autoComplete="url"
                        maxLength={MAX_FIELD_CHARS * 2}
                        enterKeyHint="done"
                      />
                      <p className={fieldHint}>粘贴可以在线体验的游戏地址</p>
                    </label>

                    {/* 封面缩略图 */}
                    <div>
                      <p className={`mb-3 ${fieldLabel}`}>封面图</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={pickCover}
                        />
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          className="rounded-lg border border-primary-container/35 bg-primary-container/10 px-3.5 py-2 font-label text-xs font-semibold text-primary-container transition-colors hover:bg-primary-container/18"
                        >
                          {coverDataUrl ? "重新选择" : "上传封面"}
                        </button>
                        {coverDataUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setCoverDataUrl(null);
                              if (coverInputRef.current) coverInputRef.current.value = "";
                            }}
                            className="rounded-lg border border-white/[0.12] px-3.5 py-2 font-label text-xs text-white/35 transition-colors hover:border-white/25 hover:text-white/60"
                          >
                            移除
                          </button>
                        )}
                      </div>

                      {coverPreviewUrl ? (
                        <div className="mt-3 overflow-hidden rounded-lg border border-white/[0.07] bg-black/40">
                          <img
                            src={coverPreviewUrl}
                            alt="封面预览"
                            className="max-h-36 w-full object-cover object-center"
                          />
                        </div>
                      ) : (
                        <p className={fieldHint}>
                          横图为宜（16:9）。未上传时将自动截图或使用占位图
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 rounded-xl border border-red-400/25 bg-red-400/[0.08] px-4 py-3 font-body text-xs leading-relaxed text-red-300/90"
                >
                  {error}
                </motion.p>
              )}
            </div>

            {/* ── 底部操作栏 ── */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.08] px-5 py-4 md:px-6">
              <button
                type="button"
                onClick={back}
                disabled={step === 1 || submitting}
                className="btn-secondary-outline gap-2 px-5 py-2.5 font-label text-sm font-medium disabled:pointer-events-none disabled:opacity-30"
              >
                <ThinArrow dir="left" />
                上一步
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={next}
                  className="btn-primary gap-1.5 px-6 py-2.5 font-label text-sm"
                >
                  下一步
                  <ThinArrow />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="btn-primary gap-2 px-6 py-2.5 font-label text-sm disabled:pointer-events-none disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isEdit ? "保存中…" : "提交中…"}
                    </>
                  ) : isEdit ? (
                    "保存修改"
                  ) : (
                    "提交作品"
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

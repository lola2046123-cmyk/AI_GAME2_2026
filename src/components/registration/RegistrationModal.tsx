import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import {
  appendSubmission,
  updateSubmission
} from "../../lib/submissionsStorage";
import { compressImageFileToJpegDataUrl } from "../../lib/imageCompress";
import { requestScreenshot } from "../../lib/screenshotApi";
import { extractDocumentText } from "../../lib/extractDocumentText";
import { summarizeGameDocument } from "../../lib/summarizeGameDocument";
import { GameplayDocDropzone } from "./GameplayDocDropzone";
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

function normalizeToolLabel(raw: string): string {
  const t = clampChars(raw.trim(), MAX_FIELD_CHARS);
  if (!t) return "";
  const presetHit = PRESET_TOOLS.find((p) => p.toLowerCase() === t.toLowerCase());
  return presetHit ?? t;
}

const inputSurface =
  "w-full rounded-xl border border-white/[0.12] bg-black/35 px-4 py-3 font-body text-sm text-on-background shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-primary/45 outline-none transition-[border-color,box-shadow] focus:border-[#5ed29c]/50 focus:shadow-[0_0_0_3px_rgba(94,210,156,0.18)]";

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
  const [evolution, setEvolution] = useState("");
  const [deployUrl, setDeployUrl] = useState("");
  /** 用户新选的封面（JPEG data URL）；优先于截图服务 */
  const [coverDataUrl, setCoverDataUrl] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** 文档解析 + Gemini 请求中 */
  const [docBusy, setDocBusy] = useState(false);
  const [gameplaySource, setGameplaySource] = useState<"manual" | "ai" | "local">(
    "manual"
  );
  /** 与 gameplay 在 AI 模式下联动，用于首页卡片展示 */
  const [cardSummary, setCardSummary] = useState<string | null>(null);

  const reset = () => {
    setStep(1);
    setGameName("");
    setGameplay("");
    setTechStack([]);
    setCustomTool("");
    setEvolution("");
    setDeployUrl("");
    setCoverDataUrl(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
    setError(null);
    setSubmitting(false);
    setDocBusy(false);
    setGameplaySource("manual");
    setCardSummary(null);
  };

  const hydrate = (r: ShowcaseSubmission) => {
    setStep(1);
    setGameName(clampChars(r.gameName, MAX_GAME_NAME_CHARS));
    setGameplay(clampChars(r.gameplay, MAX_FIELD_CHARS));
    setTechStack(r.techStack.map((t) => clampChars(t, MAX_FIELD_CHARS)));
    setEvolution(clampChars(r.evolution, MAX_FIELD_CHARS));
    setDeployUrl(clampChars(r.deployUrl, MAX_FIELD_CHARS));
    setCoverDataUrl(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
    setCustomTool("");
    setError(null);
    setSubmitting(false);
    setDocBusy(false);
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

  const close = () => {
    onStateChange({ kind: "closed" });
    window.setTimeout(reset, 320);
  };

  const handleGameplayDoc = useCallback(async (file: File) => {
    setError(null);
    setDocBusy(true);
    try {
      const text = await extractDocumentText(file);
      if (!text.trim()) throw new Error("未能从文件中提取到文本，请换一份文档");
      const { result: summary, mode } = await summarizeGameDocument(text);
      const g = clampChars(summary.coreGameplay, MAX_FIELD_CHARS);
      setGameplay(g);
      setCardSummary(clampChars(g.trim(), MAX_CARD_SUMMARY));
      setGameplaySource(mode === "gemini" ? "ai" : "local");
      setTechStack((prev) => {
        const set = new Set(prev.map((x) => normalizeToolLabel(x)).filter(Boolean));
        for (const raw of summary.aiTools) {
          const n = normalizeToolLabel(raw);
          if (n) set.add(n);
        }
        return [...set];
      });
      const prd = summary.prdSummary.trim();
      if (prd) {
        setEvolution(clampChars(prd, MAX_FIELD_CHARS));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "文档解析失败");
    } finally {
      setDocBusy(false);
    }
  }, []);

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
    if (countChars(gp) > MAX_FIELD_CHARS) {
      return `核心玩法说明不超过 ${MAX_FIELD_CHARS} 个字符`;
    }
    return null;
  };

  const validateStep2 = () => {
    if (techStack.length === 0) return "请至少选择或填写一项 AI 工具";
    return null;
  };

  const validateStep3 = () => {
    const ev = evolution.trim();
    if (!ev) return "请填写 AI 进化论说明";
    if (countChars(ev) > MAX_FIELD_CHARS) {
      return `AI 进化论说明不超过 ${MAX_FIELD_CHARS} 个字符`;
    }
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
        updateSubmission(state.record.id, {
          gameName: gameName.trim(),
          gameplay: gameplay.trim(),
          cardSummary:
            gameplaySource === "ai" || gameplaySource === "local"
              ? clampChars((cardSummary ?? gameplay).trim(), MAX_CARD_SUMMARY)
              : undefined,
          gameplaySource,
          techStack: [...techStack],
          evolution: evolution.trim(),
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
          evolution: evolution.trim(),
          deployUrl: url,
          thumbnailUrl,
          createdAt: new Date().toISOString(),
          source: "user",
          is_visible: true
        };
        appendSubmission(entry);
        close();
        onSubmitted?.();
      }
    } catch {
      setError("提交失败，请检查网络或稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  const modalTitle = isEdit ? "编辑作品" : "提交作品";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]"
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
            className="relative z-10 flex max-h-[min(92dvh,860px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.35rem] border border-white/[0.12] bg-background/93 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.76),0_0_36px_-14px_rgba(94,210,156,0.09),0_0_1px_rgba(94,210,156,0.32)] backdrop-blur-2xl sm:max-h-[min(92vh,860px)] sm:rounded-[1.35rem]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-5 py-4 md:px-6">
              <div>
                <p className="font-label text-[10px] font-medium uppercase tracking-technical text-[#5ed29c]/85">
                  {isEdit ? "Admin · Edit" : "Registration · 2026"}
                </p>
                <h2
                  id="reg-modal-title"
                  className="mt-1 font-headline text-lg font-semibold tracking-tight text-on-background md:text-xl"
                >
                  {modalTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-full p-2 text-primary/50 transition-colors hover:bg-white/5 hover:text-on-background"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="flex shrink-0 gap-1.5 px-5 py-3 md:px-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      n <= step
                        ? "w-full bg-primary-container"
                        : "w-0 bg-transparent"
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 md:px-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="s1"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <p className="font-label text-xs font-medium uppercase tracking-technical text-primary/50">
                      Step 1 · 作品定义
                    </p>
                    <label className="block space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-label text-xs text-primary/50">游戏名称</span>
                        <span className="font-label text-[10px] tabular-nums text-primary/35">
                          {countChars(gameName)}/{MAX_GAME_NAME_CHARS}
                        </span>
                      </div>
                      <input
                        className={inputSurface}
                        value={gameName}
                        onChange={(e) =>
                          setGameName(clampChars(e.target.value, MAX_GAME_NAME_CHARS))
                        }
                        placeholder="例如：星际观测者"
                        maxLength={MAX_GAME_NAME_CHARS * 2}
                        autoFocus
                      />
                    </label>
                    <GameplayDocDropzone
                      busy={docBusy}
                      disabled={submitting}
                      onFile={handleGameplayDoc}
                    />
                    <label className="block space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-label text-xs text-primary/50">
                          核心玩法说明
                          {gameplaySource === "ai" || gameplaySource === "local" ? (
                            <span className="ml-2 font-normal normal-case text-[#5ed29c]/75">
                              ·{" "}
                              {gameplaySource === "ai"
                                ? "已由 AI 预填，可直接修改"
                                : "已根据文档本地摘要预填，可直接修改"}
                            </span>
                          ) : null}
                        </span>
                        <span className="font-label text-[10px] tabular-nums text-primary/35">
                          {countChars(gameplay)}/{MAX_FIELD_CHARS}
                        </span>
                      </div>
                      <textarea
                        className={`${inputSurface} min-h-[120px] resize-y`}
                        value={gameplay}
                        onChange={(e) => {
                          const v = clampChars(e.target.value, MAX_FIELD_CHARS);
                          setGameplay(v);
                          if (gameplaySource === "ai" || gameplaySource === "local") {
                            setCardSummary(clampChars(v.trim(), MAX_CARD_SUMMARY));
                          }
                        }}
                        placeholder="上传文档可自动解析并调用 AI 总结；也可直接在此手写玩法说明…"
                        rows={5}
                        maxLength={MAX_FIELD_CHARS * 2}
                        disabled={docBusy}
                      />
                    </label>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="s2"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <p className="font-label text-xs font-medium uppercase tracking-technical text-primary/50">
                      Step 2 · AI 堆栈
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_TOOLS.map((t) => {
                        const on = techStack.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleTool(t)}
                            className={`rounded-full border px-3.5 py-2 font-label text-xs font-medium tracking-normal transition-all ${
                              on
                                ? "border-[#5ed29c]/55 bg-[#5ed29c]/15 text-[#5ed29c] shadow-[0_0_20px_-4px_rgba(94,210,156,0.4)]"
                                : "border-white/15 bg-black/30 text-primary/50 hover:border-white/25"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <input
                        className={inputSurface}
                        value={customTool}
                        onChange={(e) =>
                          setCustomTool(clampChars(e.target.value, MAX_FIELD_CHARS))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addCustomTool())
                        }
                        placeholder="其他工具，回车添加"
                        maxLength={MAX_FIELD_CHARS * 2}
                      />
                      <button
                        type="button"
                        onClick={addCustomTool}
                        className="shrink-0 rounded-xl border border-[#5ed29c]/35 bg-[#5ed29c]/10 px-4 font-label text-xs font-semibold text-[#5ed29c] transition-colors hover:bg-[#5ed29c]/18"
                      >
                        添加
                      </button>
                    </div>
                    {techStack.length > 0 && (
                      <p className="font-body text-xs text-primary/50">
                        已选：{techStack.join(" · ")}
                      </p>
                    )}
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="s3"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <p className="font-label text-xs font-medium uppercase tracking-technical text-primary/50">
                      Step 3 · 上线与总结
                    </p>
                    <label className="block space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-label text-xs text-primary/50">AI 进化论</span>
                        <span className="font-label text-[10px] tabular-nums text-primary/35">
                          {countChars(evolution)}/{MAX_FIELD_CHARS}
                        </span>
                      </div>
                      <textarea
                        className={`${inputSurface} min-h-[100px] resize-y`}
                        value={evolution}
                        onChange={(e) =>
                          setEvolution(clampChars(e.target.value, MAX_FIELD_CHARS))
                        }
                        placeholder="简述 AI 如何帮你突破原有开发边界…"
                        rows={4}
                        maxLength={MAX_FIELD_CHARS * 2}
                      />
                    </label>
                    <label className="block space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-label text-xs text-primary/50">部署链接</span>
                        <span className="font-label text-[10px] tabular-nums text-primary/35">
                          {countChars(deployUrl)}/{MAX_FIELD_CHARS}
                        </span>
                      </div>
                      <input
                        className={inputSurface}
                        value={deployUrl}
                        onChange={(e) =>
                          setDeployUrl(clampChars(e.target.value, MAX_FIELD_CHARS))
                        }
                        placeholder="https://your-game.example.com"
                        inputMode="url"
                        autoComplete="url"
                        maxLength={MAX_FIELD_CHARS * 2}
                      />
                    </label>

                    <div className="space-y-2 rounded-xl border border-white/[0.08] bg-black/20 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-label text-xs text-primary/50">封面缩略图</span>
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
                            className="rounded-lg border border-[#5ed29c]/35 bg-[#5ed29c]/10 px-3 py-1.5 font-label text-[11px] font-semibold text-[#5ed29c] transition-colors hover:bg-[#5ed29c]/18"
                          >
                            {coverDataUrl ? "重新选择" : "上传图片"}
                          </button>
                          {coverDataUrl ? (
                            <button
                              type="button"
                              onClick={() => {
                                setCoverDataUrl(null);
                                if (coverInputRef.current) coverInputRef.current.value = "";
                              }}
                              className="rounded-lg border border-white/15 px-3 py-1.5 font-label text-[11px] text-primary/50 transition-colors hover:border-white/25 hover:text-primary/70"
                            >
                              移除上传
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <p className="font-body text-[11px] leading-[1.21] text-primary/45">
                        推荐上传横图；将在浏览器内压缩为 JPEG（长边约 1200px），再保存。
                        若不传图，将尝试调用后端的{" "}
                        <code className="rounded bg-white/5 px-1 text-[#5ed29c]/85">
                          POST /api/screenshot
                        </code>
                        ；纯静态部署时无此接口，会得到站内占位图。
                      </p>
                      {coverPreviewUrl ? (
                        <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-black/40">
                          <img
                            src={coverPreviewUrl}
                            alt=""
                            className="max-h-36 w-full object-cover object-center"
                          />
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <p className="mt-3 rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 font-body text-xs text-red-300/95">
                  {error}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.08] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] md:px-6">
              <button
                type="button"
                onClick={back}
                disabled={step === 1 || submitting || docBusy}
                className="btn-secondary-outline gap-1 px-4 py-2.5 text-sm font-label font-medium disabled:opacity-35"
              >
                <ChevronLeft className="h-4 w-4" />
                上一步
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={docBusy}
                  className="btn-primary gap-1 px-5 py-2.5 text-sm disabled:opacity-45"
                >
                  下一步
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="btn-primary gap-2 px-5 py-2.5 text-sm disabled:opacity-55"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isEdit ? "保存中…" : "提交中…"}
                    </>
                  ) : isEdit ? (
                    "保存修改"
                  ) : (
                    "提交报名"
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

import type { GameDocAiResult } from "./geminiGameDocSummary";

/** 在正文中按子串匹配的常见 AI 工具名（大小写不敏感） */
const TOOL_KEYWORDS: readonly string[] = [
  "Gemini",
  "Cursor",
  "ChatGPT",
  "OpenAI",
  "Midjourney",
  "Stable Diffusion",
  "Copilot",
  "Claude",
  "Perplexity",
  "Runway",
  "Sora",
  "DALL·E",
  "DALL-E",
  "文心一言",
  "通义",
  "豆包",
  "Kimi",
  "DeepSeek",
  "GitHub Copilot"
];

function clampCodePoints(s: string, max: number): string {
  const t = s.trim();
  const arr = [...t];
  if (arr.length <= max) return t;
  return arr.slice(0, max).join("").trim();
}

function collapseLineBreaks(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function splitBlocks(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => collapseLineBreaks(b))
    .filter(Boolean);
}

function afterFirstSentence(s: string): string {
  const idx = s.search(/[。！？.!?]/);
  if (idx === -1) return "";
  return collapseLineBreaks(s.slice(idx + 1));
}

function findMentionedTools(text: string): string[] {
  const lower = text.toLowerCase();
  const out: string[] = [];
  const seen = new Set<string>();
  for (const name of TOOL_KEYWORDS) {
    if (name.length < 2) continue;
    const needle = name.toLowerCase();
    if (!lower.includes(needle)) continue;
    if (seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
}

/**
 * 不调用任何外部 API：用首段 / 次段与关键词扫描生成可编辑草稿。
 */
export function summarizeDocumentHeuristically(
  documentPlainText: string
): GameDocAiResult {
  const raw = documentPlainText.replace(/\r\n/g, "\n").trim();
  if (!raw) {
    return { coreGameplay: "", aiTools: [], prdSummary: "" };
  }

  const blocks = splitBlocks(raw);
  /** 无分段时首段取样：原 800 码位，增加 200% → 2400 */
  const first = blocks[0] ?? collapseLineBreaks(raw.slice(0, 2400));
  const second = blocks[1] ?? "";
  const tail = afterFirstSentence(first);

  /** 本地摘要长度与 Gemini 提示对齐：原 100 码位 → 300（+200%） */
  const coreGameplay = clampCodePoints(first, 300);
  const prdCandidate = second || tail || first;
  const prdSummary = clampCodePoints(prdCandidate, 300);
  const aiTools = findMentionedTools(raw);

  return {
    coreGameplay: coreGameplay || clampCodePoints(first, 600),
    aiTools,
    prdSummary: prdSummary || coreGameplay
  };
}

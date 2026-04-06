import { summarizeDocumentHeuristically } from "./localDocHeuristic";
import type { GameDocAiResult } from "./geminiGameDocSummary";

export type GameDocSummarizeMode = "gemini" | "local";

/**
 * 有 `VITE_GEMINI_API_KEY` 时走 Gemini；否则零配置使用本地启发式摘要（无需 Key、无需联网）。
 */
export async function summarizeGameDocument(
  documentPlainText: string
): Promise<{ result: GameDocAiResult; mode: GameDocSummarizeMode }> {
  const key = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  if (key) {
    const { summarizeGameDocumentWithGemini } = await import("./geminiGameDocSummary");
    const result = await summarizeGameDocumentWithGemini(documentPlainText);
    return { result, mode: "gemini" };
  }
  const result = summarizeDocumentHeuristically(documentPlainText);
  if (!result.coreGameplay.trim()) {
    throw new Error("未能从文档中生成有效摘要，请换一份可读文本更多的文件");
  }
  return { result, mode: "local" };
}

import { summarizeDocumentHeuristically } from "./localDocHeuristic";
import type { GameDocAiResult } from "./geminiGameDocSummary";

/**
 * 从赛事文档提取玩法摘要等：仅使用本地启发式（不上传、不调用云端模型）。
 */
export async function summarizeGameDocument(
  documentPlainText: string
): Promise<GameDocAiResult> {
  const result = summarizeDocumentHeuristically(documentPlainText);
  if (!result.coreGameplay.trim()) {
    throw new Error("未能从文档中生成有效摘要，请换一份可读文本更多的文件");
  }
  return result;
}

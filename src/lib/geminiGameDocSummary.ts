export type GameDocAiResult = {
  coreGameplay: string;
  aiTools: string[];
  prdSummary: string;
};

/** 送入模型的文档正文上限（码位）；相对原 28k 增加 200% → 84k */
const MAX_DOC_CHARS = 84_000;

function stripCodeFence(s: string): string {
  let t = s.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/u, "");
  }
  return t.trim();
}

/**
 * 调用 Google Gemini，将文档全文总结为玩法 / 工具链 / PRD 摘要。
 * 需在 `.env.local` 配置 `VITE_GEMINI_API_KEY`（生产环境建议走自有代理，勿暴露密钥）。
 */
export async function summarizeGameDocumentWithGemini(
  documentPlainText: string
): Promise<GameDocAiResult> {
  const key = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "未配置 VITE_GEMINI_API_KEY。在 .env.local 中填写密钥后重启开发服务器。"
    );
  }

  const model =
    import.meta.env.VITE_GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  const body = documentPlainText.slice(0, MAX_DOC_CHARS);

  const prompt = `你是一个游戏大赛评审。请阅读以下文档，并输出一个 JSON 对象（不要 markdown 代码块），字段严格为：
- coreGameplay：字符串，核心玩法说明，中文，不超过 300 字；
- aiTools：字符串数组，文档中提到的 AI 工具、模型或引擎名称（如 Cursor、Gemini）；没有则 []；
- prdSummary：字符串，详细 PRD 摘要，中文，不超过 300 字。

文档全文：
---
${body}
---`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        responseMimeType: "application/json"
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Gemini 请求失败（${res.status}）。${errText.slice(0, 200)}`
    );
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw?.trim()) {
    throw new Error("AI 未返回有效内容，请重试");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(stripCodeFence(raw)) as Record<string, unknown>;
  } catch {
    throw new Error("AI 返回格式无法解析，请重试或换一份文档");
  }

  const coreGameplay = String(parsed.coreGameplay ?? "").trim();
  const prdSummary = String(parsed.prdSummary ?? "").trim();
  const toolsRaw = parsed.aiTools;
  const aiTools = Array.isArray(toolsRaw)
    ? toolsRaw.map((x) => String(x).trim()).filter(Boolean)
    : [];

  if (!coreGameplay) {
    throw new Error("AI 未生成核心玩法，请手动填写或重试");
  }

  return { coreGameplay, aiTools, prdSummary };
}

/**
 * 展示卡片摘要：summary 优先；否则从 Markdown/混排文本生成纯文本并截断。
 */

/** 去除常见 Markdown 标记，输出单行纯文本 */
export function stripMarkdownToPlain(input: string): string {
  let s = input.trim();
  if (!s) return "";

  // 围栏代码块 ``` ... ```
  s = s.replace(/```[\s\S]*?```/g, " ");
  // 行内代码 `...`
  s = s.replace(/`([^`]+)`/g, "$1");
  // 图片 ![alt](url)
  s = s.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  // 链接 [text](url)
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  // 自动链接 <url>
  s = s.replace(/<[^>]+>/g, " ");
  // ATX 标题 # ## ###
  s = s.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  // 水平线 --- 或 ***
  s = s.replace(/^\s*([-*_]\s*){3,}\s*$/gm, " ");
  // 列表符号 - * +
  s = s.replace(/^\s{0,3}[-*+]\s+/gm, "");
  // 有序列表 1.
  s = s.replace(/^\s{0,3}\d+\.\s+/gm, "");
  // 引用 >
  s = s.replace(/^\s{0,3}>\s?/gm, "");
  // 粗斜 ** __ * _
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/__([^_]+)__/g, "$1");
  s = s.replace(/\*([^*]+)\*/g, "$1");
  s = s.replace(/_([^_]+)_/g, "$1");
  // 剩余星号/反引号/波浪
  s = s.replace(/[*_`~]+/g, "");
  // 表格竖线简化
  s = s.replace(/\|/g, " ");
  // 换行变空格
  s = s.replace(/[\r\n]+/g, " ");
  // 空白折叠
  s = s.replace(/\s{2,}/g, " ").trim();

  return s;
}

const MIN_LEN = 120;
const MAX_LEN = 160;

/** 在 [minLen, maxLen] 范围内截断，末尾加 ...（与全角 … 二选一，规范要求 "..."） */
export function truncatePlainText(text: string, maxLen = MAX_LEN): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen).trimEnd();
  const safe = cut.replace(/\s+\S*$/, "").trimEnd(); // 尽量不截半词
  const base = (safe.length >= MIN_LEN ? safe : cut).trimEnd();
  return `${base}...`;
}

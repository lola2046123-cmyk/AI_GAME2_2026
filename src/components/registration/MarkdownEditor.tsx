/**
 * MarkdownEditor — 编辑 / 预览双 tab 的 Markdown 输入器。
 * 用于「核心玩法说明」等长文字段，支持图文混排与外链（Google Docs 等）。
 */

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, Eye, Pencil } from "lucide-react";

type Tab = "write" | "preview";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  /** 透传给 textarea 的 Tailwind className（含 inputSurface 等） */
  textareaClassName?: string;
};

/* ─── Markdown 语法速查数据 ─── */

const HINT_ROWS: { syntax: string; desc: string }[] = [
  { syntax: "**粗体**",        desc: "加粗文字" },
  { syntax: "*斜体*",          desc: "斜体文字" },
  { syntax: "## 标题",         desc: "二级标题（# 一级，### 三级）" },
  { syntax: "- 列表项",        desc: "无序列表（`1.` 有序列表）" },
  { syntax: "> 引用文字",      desc: "引用块" },
  { syntax: "`代码`",          desc: "行内代码" },
  { syntax: "[文字](URL)",     desc: "超链接" },
  { syntax: "![说明](图片URL)", desc: "嵌入图片（支持外链）" },
  { syntax: "---",             desc: "水平分割线" },
];

/* ─── 预览区通用 Markdown prose 样式（Tailwind 任意子元素选择器） ─── */

const PREVIEW_CLS = [
  "min-h-[110px] rounded-xl border border-white/[0.12] bg-black/20 px-4 py-3",
  "font-body text-sm leading-relaxed text-on-background/90",
  "[&_h1]:mb-3 [&_h1]:mt-1 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-white/90",
  "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-white/85",
  "[&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-white/80",
  "[&_p]:mb-2 [&_p:last-child]:mb-0",
  "[&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5",
  "[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_li]:mb-1",
  "[&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary-container",
  "[&_img]:mt-2 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-white/[0.08]",
  "[&_code]:rounded [&_code]:bg-white/[0.08] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.8em] [&_code]:text-primary/80",
  "[&_pre]:mb-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-black/40 [&_pre]:p-3",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_blockquote]:mb-2 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/30 [&_blockquote]:pl-3 [&_blockquote]:text-white/50 [&_blockquote]:italic",
  "[&_hr]:my-3 [&_hr]:border-white/[0.08]",
  "[&_strong]:font-semibold [&_strong]:text-white/90",
  "[&_em]:text-white/70",
  "[&_table]:mb-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs",
  "[&_th]:border [&_th]:border-white/[0.1] [&_th]:bg-white/[0.04] [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-medium",
  "[&_td]:border [&_td]:border-white/[0.07] [&_td]:px-3 [&_td]:py-1.5",
].join(" ");

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  textareaClassName,
}: Props) {
  const [tab, setTab] = useState<Tab>("write");
  const [hintOpen, setHintOpen] = useState(false);

  return (
    <div className="space-y-1.5">

      {/* ── Tab 栏 ── */}
      <div className="flex items-center gap-0.5">
        {(["write", "preview"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-label text-[11px] font-medium transition-all ${
              tab === t
                ? "bg-white/[0.08] text-white/80"
                : "text-white/30 hover:text-white/55"
            }`}
          >
            {t === "write"
              ? <Pencil size={10} strokeWidth={2.5} />
              : <Eye size={10} strokeWidth={2.5} />}
            {t === "write" ? "编辑" : "预览"}
          </button>
        ))}
        <span className="ml-auto font-label text-[10px] tracking-wide text-primary/45">
          支持 Markdown
        </span>
      </div>

      {/* ── 编辑 / 预览面板 ── */}
      {tab === "write" ? (
        <textarea
          className={textareaClassName}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          enterKeyHint="next"
          spellCheck={false}
        />
      ) : (
        <div className={PREVIEW_CLS}>
          {value.trim() ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                /* 外链在新标签页打开 */
                a: ({ href, children, ...rest }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...rest}
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <p className="italic text-primary/30">
              暂无内容，切换到「编辑」开始写…
            </p>
          )}
        </div>
      )}

      {/* ── Markdown 语法速查（可折叠） ── */}
      <button
        type="button"
        onClick={() => setHintOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 py-0.5 text-left font-label text-[10px] text-white/22 transition-colors hover:text-white/45"
      >
        <ChevronDown
          size={10}
          strokeWidth={2.5}
          className={`shrink-0 transition-transform duration-200 ${hintOpen ? "rotate-180" : ""}`}
        />
        Markdown 语法速查
      </button>

      {hintOpen && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3.5 space-y-3">

          {/* 语法表格 */}
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            {HINT_ROWS.map(({ syntax, desc }) => (
              <>
                <code
                  key={`s-${syntax}`}
                  className="whitespace-nowrap rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-primary/75 leading-normal"
                >
                  {syntax}
                </code>
                <span
                  key={`d-${syntax}`}
                  className="font-body text-[11px] leading-normal text-white/35 self-center"
                >
                  {desc}
                </span>
              </>
            ))}
          </div>

          {/* 图片外链提示 */}
          <div className="rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-2.5 space-y-1">
            <p className="font-label text-[10px] font-medium uppercase tracking-wide text-primary/60">
              图文结合技巧
            </p>
            <p className="font-body text-[11px] leading-relaxed text-white/40">
              将图片上传至{" "}
              <a
                href="https://docs.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/70 underline underline-offset-2 hover:text-primary transition-colors"
              >
                Google 文档
              </a>
              {" "}或 Notion，右键图片 → 复制图片地址，再用{" "}
              <code className="rounded bg-white/[0.08] px-1 font-mono text-[10px] text-primary/70">
                ![图片说明](https://…)
              </code>
              {" "}嵌入。
            </p>
            <p className="font-body text-[11px] leading-relaxed text-white/30">
              链接到完整设计文档：{" "}
              <code className="rounded bg-white/[0.08] px-1 font-mono text-[10px] text-primary/60">
                [查看完整文档](https://docs.google.com/…)
              </code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

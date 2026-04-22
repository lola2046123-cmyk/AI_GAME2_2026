import { useCallback, useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";

const ACCEPT =
  ".pdf,.md,.markdown,.docx,application/pdf,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type Props = {
  disabled?: boolean;
  busy?: boolean;
  onFile: (file: File) => void;
};

/**
 * 毛玻璃 + 虚线框，支持点击 / 拖拽上传赛事文档。
 */
export function GameplayDocDropzone({ disabled, busy, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const pick = useCallback(
    (fileList: FileList | null) => {
      const f = fileList?.[0];
      if (!f || disabled || busy) return;
      onFile(f);
      if (inputRef.current) inputRef.current.value = "";
    },
    [busy, disabled, onFile]
  );

  return (
    <div className="space-y-2">
      <span className="font-label text-xs text-primary/50">上传文档</span>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled && !busy) setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
          if (disabled || busy) return;
          pick(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 transition-all md:py-8 ${
          dragOver
            ? "border-[#00ffcc]/55 bg-[#00ffcc]/[0.12] shadow-[0_0_28px_-6px_rgba(0,255,204,0.35)]"
            : "border-white/[0.22] bg-white/[0.04]"
        } backdrop-blur-md outline-none focus-visible:ring-2 focus-visible:ring-[#00ffcc]/45 disabled:cursor-not-allowed disabled:opacity-45`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          disabled={disabled || busy}
          onChange={(e) => pick(e.target.files)}
        />
        {busy ? (
          <Loader2 className="h-8 w-8 animate-spin text-[#00ffcc]" aria-hidden />
        ) : (
          <FileUp className="h-8 w-8 text-[#00ffcc]/85" aria-hidden />
        )}
        <span className="font-body text-center text-sm text-on-background/90">
          {busy ? "解析中" : "拖拽 PDF、Markdown 或 Word（.docx）到此处"}
        </span>
        <span className="font-body text-center text-xs text-primary/45">
          {busy ? "请稍候" : "或点击选择；上传后在本地解析并填入玩法概要"}
        </span>
      </button>
    </div>
  );
}

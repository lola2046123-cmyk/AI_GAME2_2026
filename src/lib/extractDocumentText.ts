import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

const MAX_BYTES = 12 * 1024 * 1024;

/** 从 PDF / Markdown / Word(.docx) 提取纯文本，供 AI 总结 */
export async function extractDocumentText(file: File): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("文件请小于 12MB");
  }

  const lower = file.name.toLowerCase();
  const ext = lower.includes(".") ? lower.slice(lower.lastIndexOf(".") + 1) : "";

  if (ext === "md" || ext === "markdown" || file.type === "text/markdown") {
    return (await file.text()).replace(/\r\n/g, "\n").trim();
  }

  if (ext === "pdf" || file.type === "application/pdf") {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
    const data = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjs.getDocument({ data }).promise;
    const chunks: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      for (const item of content.items) {
        if (typeof item === "object" && item !== null && "str" in item) {
          chunks.push(String((item as { str: string }).str));
        }
      }
      chunks.push("\n");
    }
    return chunks.join(" ").replace(/\s+\n/g, "\n").trim();
  }

  if (
    ext === "docx" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({
      arrayBuffer: await file.arrayBuffer()
    });
    return (value || "").trim();
  }

  throw new Error("仅支持 PDF、Markdown（.md）、Word（.docx）");
}

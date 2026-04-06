/**
 * 将用户选择的图片压成 JPEG data URL，便于写入 localStorage。
 * 限制长边与体积，避免撑爆存储配额。
 */

const MAX_INPUT_BYTES = 15 * 1024 * 1024;
/** 输出长边上限（像素） */
const MAX_OUTPUT_EDGE = 1200;
/** data URL 字符数上限（约对应 <400KB JPEG） */
const TARGET_MAX_DATA_URL_LENGTH = 520_000;

export async function compressImageFileToJpegDataUrl(file: File): Promise<string> {
  if (!/^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.type)) {
    throw new Error("请上传 JPEG、PNG、WebP 或 GIF 图片");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("图片请小于 15MB");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("无法读取该图片，请换一张试试");
  }

  try {
    const w = bitmap.width;
    const h = bitmap.height;
    const scale = Math.min(1, MAX_OUTPUT_EDGE / Math.max(w, h));
    const tw = Math.max(1, Math.round(w * scale));
    const th = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("当前环境无法处理图片");

    ctx.drawImage(bitmap, 0, 0, tw, th);

    let quality = 0.85;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    while (dataUrl.length > TARGET_MAX_DATA_URL_LENGTH && quality > 0.42) {
      quality -= 0.06;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }
    return dataUrl;
  } finally {
    bitmap.close();
  }
}

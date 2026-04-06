/**
 * 后端截图服务：POST /api/screenshot，body: { url: string }，返回 { imageUrl: string }。
 * 纯静态部署时无此接口，fetch 会失败；须依赖用户上传封面，或配置 Vite proxy / 自建 API。
 */

/** 不依赖外网的占位缩略图（避免外链图被墙或拦截） */
export function getLocalThumbnailPlaceholder(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" style="stop-color:#0e1814"/><stop offset="100%" style="stop-color:#070b0a"/>
  </linearGradient></defs>
  <rect width="640" height="400" fill="url(#g)"/>
  <text x="320" y="188" text-anchor="middle" fill="#00ffcc" fill-opacity="0.45" font-family="system-ui,sans-serif" font-size="17">未配置截图服务</text>
  <text x="320" y="218" text-anchor="middle" fill="#e2faf0" fill-opacity="0.22" font-family="system-ui,sans-serif" font-size="13">请上传封面图或部署 POST /api/screenshot</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const PLACEHOLDER = getLocalThumbnailPlaceholder();

export type ScreenshotResponse = {
  imageUrl: string;
};

export async function requestScreenshot(pageUrl: string): Promise<string> {
  const base = import.meta.env.VITE_API_BASE ?? "";
  const endpoint = `${base}/api/screenshot`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: pageUrl })
    });

    if (!res.ok) {
      console.warn("[screenshotApi] non-OK", res.status, endpoint);
      return PLACEHOLDER;
    }

    const data = (await res.json()) as ScreenshotResponse;
    if (typeof data?.imageUrl === "string" && data.imageUrl.length > 0) {
      return data.imageUrl;
    }
  } catch (e) {
    console.warn("[screenshotApi] fetch failed, using placeholder", e);
  }

  return PLACEHOLDER;
}

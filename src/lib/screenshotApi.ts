/**
 * 后端截图服务：POST /api/screenshot，body: { url: string }，返回 { imageUrl: string }。
 * 纯静态部署时无此接口，fetch 会失败；须依赖用户上传封面，或配置 Vite proxy / 自建 API。
 */

/** 不依赖外网的占位缩略图（避免外链图被墙或拦截） */
export function getLocalThumbnailPlaceholder(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <rect width="640" height="400" fill="#121212"/>
  <rect x="248" y="132" width="144" height="108" rx="8" fill="none" stroke="rgba(168,255,225,0.14)" stroke-width="1.25"/>
  <path d="M272 200h96M272 216h64" stroke="rgba(168,255,225,0.1)" stroke-width="1" stroke-linecap="round"/>
  <text x="320" y="278" text-anchor="middle" fill="rgba(255,255,255,0.2)" font-family="system-ui,-apple-system,sans-serif" font-size="11" letter-spacing="0.08em">暂无封面</text>
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

/**
 * 后端截图服务：POST /api/screenshot，body: { url: string }，返回 { imageUrl: string }。
 * 纯静态部署时无此接口，fetch 会失败；须依赖用户上传封面，或配置 Vite proxy / 自建 API。
 */

/** 不依赖外网的占位缩略图（以品牌 Logo 为中心元素） */
export function getLocalThumbnailPlaceholder(): string {
  // Logo 原始 viewBox 0 0 14 12，放大 6× → 84×72px，居中于 (320,182)
  const logoX = 320 - 42; // 278
  const logoY = 182 - 36; // 146
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <defs>
    <radialGradient id="pg" cx="50%" cy="46%" r="26%">
      <stop offset="0%" stop-color="#1EFDCD" stop-opacity="0.11"/>
      <stop offset="100%" stop-color="#1EFDCD" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="640" height="400" fill="#0e0e0e"/>
  <ellipse cx="320" cy="182" rx="116" ry="90" fill="url(#pg)"/>
  <line x1="24" y1="24" x2="54" y2="24" stroke="rgba(30,253,205,0.13)" stroke-width="1"/>
  <line x1="24" y1="24" x2="24" y2="54" stroke="rgba(30,253,205,0.13)" stroke-width="1"/>
  <line x1="616" y1="24" x2="586" y2="24" stroke="rgba(30,253,205,0.13)" stroke-width="1"/>
  <line x1="616" y1="24" x2="616" y2="54" stroke="rgba(30,253,205,0.13)" stroke-width="1"/>
  <line x1="24" y1="376" x2="54" y2="376" stroke="rgba(30,253,205,0.13)" stroke-width="1"/>
  <line x1="24" y1="376" x2="24" y2="346" stroke="rgba(30,253,205,0.13)" stroke-width="1"/>
  <line x1="616" y1="376" x2="586" y2="376" stroke="rgba(30,253,205,0.13)" stroke-width="1"/>
  <line x1="616" y1="376" x2="616" y2="346" stroke="rgba(30,253,205,0.13)" stroke-width="1"/>
  <g transform="translate(${logoX},${logoY}) scale(6)" fill="#1EFDCD" fill-opacity="0.26" shape-rendering="crispEdges">
    <path d="M2 8H3V9H4V10H5V11H9V10H11V11H10V12H4V11H3V10H2V9H1V8H0V5H1V3H2V2H3V1H4V0H10V1H11V2H9V1H5V2H4V3H3V5H2V8Z"/>
    <path d="M12 4H11V5H10V6H9V7H11V8H12V10H11V9H9V8H8V7H7V6H8V5H9V4H10V3H11V2H12V4Z"/>
    <path d="M14 7H12V5H14V7Z"/>
    <path d="M7 5H5V3H7V5Z"/>
  </g>
  <text x="320" y="284" text-anchor="middle" fill="rgba(255,255,255,0.28)" font-family="system-ui,-apple-system,sans-serif" font-size="14" letter-spacing="0.18em">暂无封面</text>
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

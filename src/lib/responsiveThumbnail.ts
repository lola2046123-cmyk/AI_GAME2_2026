/** `/showcase` 与首页「最新参赛」栅格：1 / 2 / 列 */
export const SHOWCASE_THUMB_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, min(520px, 33vw)";

/** 首页精选大图区：移动端通栏，桌面约半宽 */
export const FEATURED_THUMB_SIZES =
  "(max-width: 1024px) 100vw, min(720px, 50vw)";

/**
 * 为 Unsplash 图片 URL 生成 srcSet（多档宽度），其它来源返回 undefined。
 * 使用 URL API 合并查询参数，避免破坏已有 `q`、`auto`、`fit` 等。
 */
export function unsplashSrcSet(url: string): string | undefined {
  if (!url.includes("images.unsplash.com")) return undefined;
  try {
    const base = new URL(url);
    const widths = [320, 640, 960, 1280, 1600];
    return widths
      .map((w) => {
        const u = new URL(base.href);
        u.searchParams.set("w", String(w));
        if (!u.searchParams.has("q")) u.searchParams.set("q", "80");
        if (!u.searchParams.has("auto")) u.searchParams.set("auto", "format");
        return `${u.href} ${w}w`;
      })
      .join(", ");
  } catch {
    return undefined;
  }
}

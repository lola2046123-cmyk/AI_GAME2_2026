import { useEffect, type RefObject } from "react";
import { VFX } from "@vfx-js/core";
import { buildFluidPasses, makeSimSize } from "../../lib/fluidVfx";

type UseFluidVfxOpts = {
  /** 是否启用（条件加载，例如等待图片就绪） */
  enabled?: boolean;
  /** WebGL 像素比，低端设备可设 1 或 0.75 降负载（默认 devicePixelRatio） */
  pixelRatio?: number;
  /**
   * Canvas 的 z-index。
   * 默认 5：在 root bg-background 之上、在页面内容（AppChrome 的 .z-10）之下。
   * 这样原 `<img>` 被 VFX 设 opacity:0 后，分散后的 hero 像素从透明 img wrapper
   * 透出来，再经过暗罩/底部渐变/标题文字（都属于 z-10 子层）正常合成。
   */
  zIndex?: number;
};

/**
 * 在 ShowcasePage 的 hero 图上叠加「稳定流体模拟」可视化。
 *
 * 重要说明：
 *   • VFX 默认创建一个 `position: fixed; pointer-events: none;` 的全屏 canvas，
 *     不会拦截任何点击或滚动；
 *   • canvas 大部分像素透明，只在已注册元素覆盖区域绘制；
 *   • 元素离开视口时 VFX 会自动停止绘制该元素，hero 滚出屏幕后无开销；
 *   • 浏览器不支持 WebGL（少数老旧设备）时，`VFX.init` 返回 null，自动回退为无效果。
 */
export function useFluidVfx(
  ref: RefObject<HTMLElement | null>,
  { enabled = true, pixelRatio, zIndex = 5 }: UseFluidVfxOpts = {},
) {
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    let pos: [number, number] = [-1, -1];
    let delta: [number, number] = [0, 0];

    const onMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = window.innerHeight - e.clientY;
      if (pos[0] >= 0) {
        delta = [x - pos[0], y - pos[1]];
      }
      pos = [x, y];
    };

    window.addEventListener("pointermove", onMove);

    const simSize = makeSimSize(192);
    const passes = buildFluidPasses({
      simSize,
      mouseDelta: () => {
        delta = [delta[0] * 0.9, delta[1] * 0.9];
        return delta;
      },
      pressureIterations: 12,
      curlStrength: 14,
      velocityDissipation: 1.4,
      splatForce: 1800,
      splatRadius: 0.0024,
      displayStrength: 0.18,
    });

    const vfx = VFX.init({
      pixelRatio,
      zIndex,
      postEffect: passes,
    });

    if (!vfx) {
      window.removeEventListener("pointermove", onMove);
      return;
    }

    let cancelled = false;
    const start = async () => {
      if (el instanceof HTMLImageElement && !el.complete) {
        await new Promise<void>((resolve) => {
          el.addEventListener("load", () => resolve(), { once: true });
          el.addEventListener("error", () => resolve(), { once: true });
        });
      }
      if (cancelled) return;
      try {
        // overlay 默认 false：VFX 会把原 <img> opacity 设为 0，
        // 让分散后的 canvas 像素直接顶到 hero 位置，
        // 同时保留 DOM 上的暗罩/渐变/标题在更高层正常合成。
        await vfx.add(el, { shader: "none" });
        if (cancelled) return;
        vfx.play();
      } catch {
        // 任何初始化失败都安全降级（无视觉效果）
      }
    };
    void start();

    return () => {
      cancelled = true;
      window.removeEventListener("pointermove", onMove);
      try {
        vfx.remove(el);
      } catch {
        /* noop */
      }
      try {
        vfx.destroy();
      } catch {
        /* noop */
      }
    };
  }, [ref, enabled, pixelRatio, zIndex]);
}

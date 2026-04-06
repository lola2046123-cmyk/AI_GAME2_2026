/** 触屏 / 无悬停指针 / 减少动效 → 关闭自定义光标与拖尾 */

export function getArenaCursorEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (!window.matchMedia("(pointer: fine)").matches) return false;
  if (!window.matchMedia("(hover: hover)").matches) return false;
  return true;
}

export function subscribeArenaCursorGate(cb: () => void): () => void {
  const mqs = [
    window.matchMedia("(pointer: fine)"),
    window.matchMedia("(hover: hover)"),
    window.matchMedia("(prefers-reduced-motion: reduce)")
  ];
  for (const mq of mqs) mq.addEventListener("change", cb);
  return () => {
    for (const mq of mqs) mq.removeEventListener("change", cb);
  };
}

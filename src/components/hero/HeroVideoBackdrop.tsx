/**
 * 全屏背景：HLS 视频铺满（无蒙版叠层，保证画面最清晰）。
 */

import { HeroMuxHlsVideo } from "../HeroMuxHlsVideo";

export function HeroVideoBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-background" aria-hidden>
      {/* 移动端略放大，配合 object-cover 减少露底；不再叠渐变/压暗层 */}
      <div className="absolute inset-0 origin-center max-md:scale-[2.07]">
        <HeroMuxHlsVideo />
      </div>
    </div>
  );
}

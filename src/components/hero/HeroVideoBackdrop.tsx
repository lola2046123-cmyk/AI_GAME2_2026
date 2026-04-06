/**
 * 全屏背景：HLS 视频 + 左右/底部渐变 + 顶区椭圆光晕。
 */

import { HeroMuxHlsVideo } from "../HeroMuxHlsVideo";

export function HeroVideoBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-background" aria-hidden>
      {/* 移动端放大视频层，配合 object-cover 铺满可视区、减少上下/两侧露底 */}
      <div className="absolute inset-0 origin-center opacity-[0.63] max-md:scale-[2.07]">
        <HeroMuxHlsVideo />
      </div>

      {/* 顶区横向椭圆光晕（SVG + 25px 高斯模糊） */}
      <svg
        className="absolute top-[6%] left-1/2 z-[1] w-[min(120%,920px)] -translate-x-1/2 md:top-[7%]"
        style={{ filter: "blur(25px)" }}
        viewBox="0 0 900 200"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>ambient glow</title>
        <defs>
          <radialGradient id="codenest-hero-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00ffcc" stopOpacity="0.34" />
            <stop offset="50%" stopColor="#1a3d2e" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0a0f0d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="450" cy="100" rx="380" ry="72" fill="url(#codenest-hero-glow)" />
      </svg>

      {/* 中心区压暗：弱化矩阵光对主文案的干扰 */}
      <div
        className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_72%_58%_at_50%_38%,rgba(10,15,13,0.76)_0%,rgba(10,15,13,0.3)_45%,transparent_72%)]"
        aria-hidden
      />

      {/* 左侧深绿渐变 */}
      <div
        className="absolute inset-y-0 left-0 z-[2] w-[min(100%,720px)] bg-gradient-to-r from-background via-background/83 to-transparent"
        aria-hidden
      />
      {/* 底部轻遮罩：保留文案对比度，透出视频 */}
      <div
        className="absolute right-0 bottom-0 left-0 z-[2] h-[min(36vh,360px)] bg-gradient-to-t from-background/52 via-background/18 to-transparent"
        aria-hidden
      />
    </div>
  );
}

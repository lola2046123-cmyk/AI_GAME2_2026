/**
 * Mux HLS 首屏背景：hls.js 解析 .m3u8，卸载时 destroy；Safari 原生 HLS。
 * enableWorker: false 便于沙箱环境稳定；不透明度由父级控制。
 */

import Hls from "hls.js";
import { memo, useEffect, useRef, useSyncExternalStore } from "react";

export const HERO_MUX_HLS_SRC =
  "https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8";

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const HeroMuxHlsVideo = memo(function HeroMuxHlsVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reduceMotion) {
      video.pause();
      video.removeAttribute("src");
      return;
    }

    let hls: Hls | null = null;
    let onMeta: (() => void) | null = null;
    const src = HERO_MUX_HLS_SRC;

    const tryPlay = () => {
      void video.play().catch(() => {});
    };

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: false,
        lowLatencyMode: false
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              hls?.destroy();
              hls = null;
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      onMeta = tryPlay;
      video.addEventListener("loadedmetadata", onMeta);
    }

    return () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
      if (onMeta) video.removeEventListener("loadedmetadata", onMeta);
      video.removeAttribute("src");
      video.load();
    };
  }, [reduceMotion]);

  if (reduceMotion) {
    return null;
  }

  return (
    <video
      ref={videoRef}
      className="pointer-events-none h-full min-h-full w-full min-w-full object-cover object-center"
      style={{ opacity: 1 }}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      aria-hidden
    />
  );
});

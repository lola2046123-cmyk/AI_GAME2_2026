/**
 * 全局自定义光标 + Canvas 能量拖尾（仅精细指针 + 可悬停设备；触屏自动关闭）
 */

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  ARENA_CURSOR_LERP,
  ARENA_TRAIL_DECAY,
  ARENA_TRAIL_MAX_POINTS,
  ARENA_TRAIL_MIN_DIST,
  ARENA_TRAIL_MIN_MS,
  ARENA_TRAIL_RGB,
  ARENA_TRAIL_WIDTH_MAX,
  ARENA_TRAIL_WIDTH_MIN
} from "./arenaFxConfig";
import { getArenaCursorEnabled, subscribeArenaCursorGate } from "./arenaCursorGate";

type TrailPoint = { x: number; y: number; life: number };

function useArenaCursorEnabled() {
  return useSyncExternalStore(
    subscribeArenaCursorGate,
    getArenaCursorEnabled,
    () => false
  );
}

export function ArenaCursorTrail() {
  const enabled = useArenaCursorEnabled();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const rawRef = useRef({ x: 0, y: 0, has: false });
  const dispRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef<TrailPoint[]>([]);
  const lastPushRef = useRef({ t: 0, x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add("arena-cursor-active");
    return () => document.body.classList.remove("arena-cursor-active");
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    const dot = dotRef.current;
    if (!canvas || !dot) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      rawRef.current.x = e.clientX;
      rawRef.current.y = e.clientY;
      rawRef.current.has = true;
    };

    const tick = () => {
      const raw = rawRef.current;
      const disp = dispRef.current;
      const trail = trailRef.current;
      const lastPush = lastPushRef.current;

      if (raw.has) {
        const dx = raw.x - disp.x;
        const dy = raw.y - disp.y;
        disp.x += dx * ARENA_CURSOR_LERP;
        disp.y += dy * ARENA_CURSOR_LERP;
        dot.style.opacity = "1";
      } else {
        dot.style.opacity = "0";
      }

      dot.style.transform = `translate3d(${disp.x}px, ${disp.y}px, 0)`;

      const now = performance.now();
      if (raw.has) {
        const ddx = disp.x - lastPush.x;
        const ddy = disp.y - lastPush.y;
        const dist = Math.hypot(ddx, ddy);
        if (
          dist >= ARENA_TRAIL_MIN_DIST &&
          now - lastPush.t >= ARENA_TRAIL_MIN_MS
        ) {
          trail.push({ x: disp.x, y: disp.y, life: 1 });
          lastPush.t = now;
          lastPush.x = disp.x;
          lastPush.y = disp.y;
          while (trail.length > ARENA_TRAIL_MAX_POINTS) trail.shift();
        }
      }

      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].life -= ARENA_TRAIL_DECAY;
        if (trail[i].life <= 0) trail.splice(i, 1);
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (trail.length >= 2) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (let i = 1; i < trail.length; i++) {
          const a = trail[i - 1];
          const b = trail[i];
          const t = Math.min(a.life, b.life);
          const alpha = t * 0.42;
          const w =
            ARENA_TRAIL_WIDTH_MIN +
            (ARENA_TRAIL_WIDTH_MAX - ARENA_TRAIL_WIDTH_MIN) * t;
          ctx.strokeStyle = `rgba(${ARENA_TRAIL_RGB}, ${alpha})`;
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(rafRef.current);
      trailRef.current.length = 0;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="arena-cursor-canvas pointer-events-none fixed inset-0 z-[10055]"
        aria-hidden
      />
      <div
        ref={dotRef}
        className="arena-cursor-root pointer-events-none fixed left-0 top-0 z-[10062]"
        aria-hidden
      >
        <div className="arena-cursor-cross" />
        <div className="arena-cursor-nucleus" />
      </div>
    </>
  );
}

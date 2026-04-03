/**
 * 全局指针效果：点击短音效 + 移动/拖拽画布拖尾
 */

import { useEffect, useRef } from "react";

type TrailPoint = { x: number; y: number; life: number; width: number };

const MAX_POINTS = 32;
const COLOR = "0, 240, 255";

function playUiClick(ctx: AudioContext) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(2200, t);
  filter.Q.setValueAtTime(0.7, t);
  osc.type = "sine";
  osc.frequency.setValueAtTime(3200, t);
  osc.frequency.exponentialRampToValueAtTime(900, t + 0.045);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.11, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.07);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.08);
}

export function PointerFx() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<TrailPoint[]>([]);
  const lastRef = useRef({ t: 0, x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const points = pointsRef.current;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const ensureAudio = () => {
      if (!audioRef.current) {
        audioRef.current = new AudioContext();
      }
      const ac = audioRef.current;
      if (ac.state === "suspended") {
        void ac.resume();
      }
      return ac;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const el = e.target as HTMLElement;
      if (
        el.closest("input, textarea, select, [contenteditable=true]") ||
        el.isContentEditable
      ) {
        return;
      }
      try {
        playUiClick(ensureAudio());
      } catch {
        /* ignore */
      }
    };

    const pushPoint = (clientX: number, clientY: number, dragging: boolean) => {
      const now = performance.now();
      const last = lastRef.current;
      const minGap = dragging ? 12 : 28;
      if (now - last.t < minGap) return;
      const dx = clientX - last.x;
      const dy = clientY - last.y;
      const minDist = dragging ? 5 : 12;
      if (dx * dx + dy * dy < minDist * minDist && points.length > 0) return;
      last.t = now;
      last.x = clientX;
      last.y = clientY;

      points.push({
        x: clientX,
        y: clientY,
        life: 1,
        width: dragging ? 2.4 + Math.random() * 1.1 : 1.1 + Math.random() * 0.55,
      });
      while (points.length > MAX_POINTS) points.shift();
    };

    const onPointerMove = (e: PointerEvent) => {
      const dragging = e.buttons > 0;
      pushPoint(e.clientX, e.clientY, dragging);
    };

    const tick = () => {
      ctx2d.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const decay = 0.068;
      for (let i = points.length - 1; i >= 0; i--) {
        points[i].life -= decay;
        if (points[i].life <= 0) points.splice(i, 1);
      }

      if (points.length >= 2) {
        ctx2d.lineCap = "round";
        ctx2d.lineJoin = "round";
        for (let i = 1; i < points.length; i++) {
          const a = points[i - 1];
          const b = points[i];
          const alpha = Math.min(a.life, b.life) * 0.1;
          const w = ((a.width + b.width) / 2) * Math.min(a.life, b.life);
          ctx2d.strokeStyle = `rgba(${COLOR}, ${alpha})`;
          ctx2d.lineWidth = w;
          ctx2d.beginPath();
          ctx2d.moveTo(a.x, a.y);
          ctx2d.lineTo(b.x, b.y);
          ctx2d.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(rafRef.current);
      points.length = 0;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[10050]"
      aria-hidden
    />
  );
}

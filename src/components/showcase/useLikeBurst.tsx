import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

/**
 * 点赞按钮「炸开 9 颗心 + 按钮缩放 + 心图标震动」的统一动画 hook。
 *
 * 之所以用 Web Animations API 而不是 CSS class 切换：
 *   - 同名 CSS class 在 React 中保留不变时，浏览器不会重启动画；
 *   - 用 `state > 0 ? 'class' : ''` 这种写法只能触发**第一次**点击的动画，
 *     第二次开始 popKey 已恒为 truthy，class 字符串不变，动画不会重播。
 *   - `Element.animate(...)` 每次调用都从 0 帧重头跑，最稳。
 *
 * 用法：
 * ```tsx
 * const burst = useLikeBurst();
 * <button ref={burst.btnRef} onClick={(e) => { burst.trigger(e); ... }}>
 *   <Heart ref={burst.iconRef} />
 * </button>
 * {burst.portal}
 * ```
 */

const HEART_PATH =
  "M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z";

type HeartParam = { tx: number; ty: number; rot: number; delay: number; size: number };

const HEART_BURST_PARAMS: readonly HeartParam[] = [
  { tx: -28, ty: -42, rot: -22, delay: 0,   size: 12 },
  { tx:   8, ty: -56, rot:   6, delay: 50,  size: 14 },
  { tx:  36, ty: -38, rot:  18, delay: 30,  size: 12 },
  { tx: -44, ty:  -8, rot: -32, delay: 80,  size: 10 },
  { tx:  46, ty:  -6, rot:  22, delay: 100, size: 10 },
  { tx: -32, ty:  30, rot:  -8, delay: 130, size: 11 },
  { tx:   6, ty:  46, rot:  12, delay: 70,  size: 12 },
  { tx:  34, ty:  32, rot: -14, delay: 150, size: 11 },
  { tx:   0, ty: -64, rot:   0, delay: 0,   size: 14 },
];

const HEART_DURATION = 1100; // ms
const BUMP_DURATION = 480;
const THROB_DURATION = 540;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function HeartBurstPortal({ x, y }: { x: number; y: number }) {
  const refs = useRef<(SVGSVGElement | null)[]>([]);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    refs.current.forEach((el, i) => {
      if (!el) return;
      const p = HEART_BURST_PARAMS[i];
      el.animate(
        [
          {
            transform: "translate(-50%, -50%) scale(0.2) rotate(0deg)",
            opacity: 0,
          },
          {
            transform: "translate(-50%, -50%) scale(1) rotate(0deg)",
            opacity: 1,
            offset: 0.18,
          },
          {
            transform: `translate(calc(-50% + ${p.tx}px), calc(-50% + ${p.ty}px)) scale(0.9) rotate(${p.rot}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: HEART_DURATION,
          delay: p.delay,
          easing: EASE,
          fill: "forwards",
        },
      );
    });
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: x,
        top: y,
        width: 0,
        height: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      {HEART_BURST_PARAMS.map((p, i) => (
        <svg
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          viewBox="0 0 32 29.6"
          width={p.size}
          height={p.size}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            color: "#fb7185",
            fill: "currentColor",
            opacity: 0,
            transform: "translate(-50%, -50%) scale(0.2)",
            filter: "drop-shadow(0 0 6px rgba(251, 113, 133, 0.55))",
            willChange: "transform, opacity",
          }}
        >
          <path d={HEART_PATH} />
        </svg>
      ))}
    </div>,
    document.body,
  );
}

export type LikeBurstHandle = {
  /** 绑到点赞 `<button>` 的 ref */
  btnRef: React.MutableRefObject<HTMLButtonElement | null>;
  /** 绑到 lucide `<Heart>` 的 ref（也可以是任何 SVG） */
  iconRef: React.MutableRefObject<SVGSVGElement | null>;
  /** 在按钮 onClick 里调用，会同时触发 9 颗心爆炸、按钮缩放、心图标震动 */
  trigger: (event?: ReactMouseEvent<HTMLButtonElement>) => void;
  /** 渲染到 React 树里就行（HeartBurstPortal 会自己 portal 到 body） */
  portal: ReactNode;
};

export function useLikeBurst(): LikeBurstHandle {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const iconRef = useRef<SVGSVGElement | null>(null);
  const [pop, setPop] = useState<{ id: number; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!pop) return;
    // 比 1100ms 动画 + 最大 150ms delay 多出一点缓冲，确保动画完整跑完再卸载
    const timer = window.setTimeout(() => setPop(null), HEART_DURATION + 200);
    return () => window.clearTimeout(timer);
  }, [pop]);

  function trigger(event?: ReactMouseEvent<HTMLButtonElement>) {
    if (event) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setPop({
        id: Date.now(),
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    if (prefersReducedMotion()) return;

    btnRef.current?.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.18)", offset: 0.35 },
        { transform: "scale(0.96)", offset: 0.7 },
        { transform: "scale(1)" },
      ],
      { duration: BUMP_DURATION, easing: EASE },
    );
    iconRef.current?.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.45)", offset: 0.25 },
        { transform: "scale(0.85)", offset: 0.55 },
        { transform: "scale(1)" },
      ],
      { duration: THROB_DURATION, easing: EASE },
    );
  }

  return {
    btnRef,
    iconRef,
    trigger,
    portal: pop ? <HeartBurstPortal key={pop.id} x={pop.x} y={pop.y} /> : null,
  };
}

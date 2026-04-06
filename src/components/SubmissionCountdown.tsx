/**
 * 距 2026.04.26 23:59 的倒计时 — 极客暗黑风（等宽 / 青辉光 / 秒脉冲 / 过期态）。
 */

import { useEffect, useState } from "react";

/** 投稿截止（与页面「关键时刻」一致） */
const DEADLINE = new Date(2026, 3, 26, 23, 59, 59);

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function getParts(): Parts {
  const ms = DEADLINE.getTime() - Date.now();
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const total = Math.floor(ms / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60
  };
}

function padDays(n: number) {
  return n < 100 ? String(n).padStart(2, "0") : String(n);
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

type SubmissionCountdownProps = {
  /** default：通用；compact：首屏区；footer：视口底部次要信息 */
  variant?: "default" | "compact" | "footer";
};

export function SubmissionCountdown({ variant = "default" }: SubmissionCountdownProps) {
  const [parts, setParts] = useState<Parts>(() => getParts());

  useEffect(() => {
    const id = window.setInterval(() => setParts(getParts()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const expired = Date.now() >= DEADLINE.getTime();
  const compact = variant === "compact";
  const footer = variant === "footer";

  if (expired) {
    if (footer) {
      return (
        <div
          className="countdown-liquid-glass mx-auto flex max-w-[min(100%,15.84rem)] items-center justify-center rounded-full px-6 py-[0.45rem] font-mono text-sm font-medium tracking-normal text-red-400/90"
          role="status"
        >
          封盘中
        </div>
      );
    }
    return (
      <div
        className={
          compact
            ? "mx-auto flex max-w-[12.96rem] items-center justify-center rounded-lg border border-white/10 bg-black/60 px-[0.525rem] py-1.5 font-mono text-xs font-medium uppercase tracking-[0.036em] text-red-400/95 backdrop-blur-sm"
            : "mx-auto flex w-full max-w-[360px] items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.055] px-3 py-[0.9rem] font-mono text-sm font-medium uppercase tracking-[0.036em] text-red-400/95 shadow-[0_0_18px_rgba(94,210,156,0.07)] backdrop-blur-xl md:text-base"
        }
        role="status"
      >
        PROTOCOL_EXPIRED / 封盘中
      </div>
    );
  }

  const blocks = [
    { value: padDays(parts.days), label: "天" },
    { value: pad2(parts.hours), label: "时" },
    { value: pad2(parts.minutes), label: "分" },
    { value: pad2(parts.seconds), label: "秒" }
  ] as const;

  const shell = footer
    ? "countdown-liquid-glass mx-auto max-w-[min(100%,316.8px)] rounded-full px-[1.08rem] py-[0.525rem] font-mono md:px-[1.8rem] md:py-[0.6rem]"
    : compact
      ? "mx-auto flex max-w-[12.6rem] flex-nowrap items-center justify-center gap-[0.27rem] rounded-lg border border-[#5ed29c]/28 bg-black/52 px-1.5 py-1.5 font-mono text-white shadow-[0_0_14px_rgba(94,210,156,0.12)] backdrop-blur-md"
      : "mx-auto flex w-full max-w-[360px] flex-nowrap items-center justify-center gap-[0.54rem] rounded-xl border border-white/[0.1] bg-white/[0.055] px-[0.6rem] py-[0.75rem] font-mono text-on-background shadow-[0_0_22px_rgba(94,210,156,0.075)] backdrop-blur-xl sm:gap-[0.63rem] sm:px-[0.75rem] sm:py-[0.81rem] md:gap-[0.9rem] md:px-[0.9rem] md:py-[0.81rem]";

  const digit = footer
    ? "block whitespace-nowrap text-[clamp(0.8125rem,3.1vw,1.2rem)] font-semibold leading-none text-white md:text-[1.35rem] [text-shadow:0_0_12px_rgba(94,210,156,0.35)]"
    : compact
      ? "block whitespace-nowrap text-[clamp(0.875rem,3.6vw,1.25rem)] font-semibold leading-none text-[#7ee5b5] [text-shadow:0_0_10px_rgba(126,229,181,0.42),0_0_20px_rgba(94,210,156,0.14)]"
      : `block whitespace-nowrap text-[clamp(1.125rem,4.6vw,2.25rem)] font-semibold leading-none text-primary-container transition-opacity duration-300 sm:text-[clamp(1.2rem,4vw,2.7rem)] md:text-[3.3rem] md:leading-none [text-shadow:0_0_12px_rgba(94,210,156,0.28),0_0_24px_rgba(94,210,156,0.12)]`;

  const labelCls = footer
    ? "mt-1 block whitespace-nowrap text-[0.66rem] font-normal tracking-[0.036em] text-primary/50 md:text-[0.72rem]"
    : compact
      ? "mt-0.5 block whitespace-nowrap text-[0.6rem] font-normal tracking-[0.036em] text-white/45"
      : "mt-1 block whitespace-nowrap text-[0.78rem] font-normal tracking-[0.036em] text-primary/50 sm:mt-1.5 sm:text-[0.84rem]";

  const blockMin = footer
    ? "min-w-0 flex-1 text-center md:min-w-[2.16rem] md:flex-none"
    : compact
      ? "min-w-0 flex-1 text-center"
      : "min-w-0 flex-1 text-center md:min-w-[3.24rem] md:flex-none";

  const inner = (
    <>
      {blocks.map((b) => (
        <div key={b.label} className={blockMin}>
          <span
            className={`${digit}${b.label === "秒" ? " countdown-geek-seconds" : ""}`}
          >
            {b.value}
          </span>
          <span className={labelCls}>{b.label}</span>
        </div>
      ))}
    </>
  );

  if (footer) {
    return (
      <div className={shell} role="timer" aria-label="投稿截止倒计时">
        <div className="relative z-[1] flex w-full min-w-0 flex-nowrap items-center justify-center gap-x-[0.6rem] whitespace-nowrap md:gap-x-[0.9rem]">
          {inner}
        </div>
      </div>
    );
  }

  return (
    <div className={`${shell} min-w-0 whitespace-nowrap`} role="timer" aria-label="投稿截止倒计时">
      {inner}
    </div>
  );
}

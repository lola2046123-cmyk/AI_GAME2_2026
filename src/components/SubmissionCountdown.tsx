/**
 * 比赛阶段倒计时 — 根据当前时间自动切换「投稿 → 评审 → 公示 → 落幕」四个状态。
 *
 * 时间节点（可在此统一修改）：
 *   DEADLINE_SUBMIT  投稿截止
 *   DEADLINE_REVIEW  评审截止 / 结果揭晓开始
 *   DEADLINE_ANNOUNCE 公示结束 / 大赛正式落幕
 */

import { useEffect, useState } from "react";

/* ─────────────── 时间节点配置 ─────────────── */

/** 投稿截止：2026-04-26 23:59:59 */
const DEADLINE_SUBMIT = new Date(2026, 3, 26, 23, 59, 59);

/** 评审截止（投票 / 评审委员会打分结束）：2026-05-05 23:59:59 */
const DEADLINE_REVIEW = new Date(2026, 4, 5, 23, 59, 59);

/** 公示结束（获奖名单正式公布后的展示期结束）：2026-05-12 23:59:59 */
const DEADLINE_ANNOUNCE = new Date(2026, 4, 12, 23, 59, 59);

/* ─────────────── 阶段枚举 ─────────────── */

type Phase =
  | "submitting"   // 投稿中（倒计时跑向 DEADLINE_SUBMIT）
  | "reviewing"    // 评审中（倒计时跑向 DEADLINE_REVIEW）
  | "announcing"   // 公示中（倒计时跑向 DEADLINE_ANNOUNCE）
  | "closed";      // 大赛落幕

function getPhase(): Phase {
  const now = Date.now();
  if (now < DEADLINE_SUBMIT.getTime()) return "submitting";
  if (now < DEADLINE_REVIEW.getTime()) return "reviewing";
  if (now < DEADLINE_ANNOUNCE.getTime()) return "announcing";
  return "closed";
}

/* ─────────────── 倒计时拆分 ─────────────── */

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function getParts(target: Date): Parts {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const total = Math.floor(ms / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/** 根据当前阶段返回倒计时目标时间（仅在 submitting / reviewing / announcing 有意义）*/
function getTarget(phase: Phase): Date {
  if (phase === "submitting") return DEADLINE_SUBMIT;
  if (phase === "reviewing") return DEADLINE_REVIEW;
  return DEADLINE_ANNOUNCE;
}

function padDays(n: number) {
  return n < 100 ? String(n).padStart(2, "0") : String(n);
}
function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/* ─────────────── 阶段文案 ─────────────── */

const PHASE_LABEL: Record<Phase, { title: string; timer: string; badge: string }> = {
  submitting: {
    title: "投递截止倒计时",
    timer: "投递截止倒计时",
    badge: "PROTOCOL_EXPIRED / 封盘中",   // 不会出现，但 TS 需要
  },
  reviewing: {
    title: "评审进行中",
    timer: "评审截止倒计时",
    badge: "REVIEWING / 评审进行中",
  },
  announcing: {
    title: "获奖名单公示中",
    timer: "公示结束倒计时",
    badge: "ANNOUNCING / 公示进行中",
  },
  closed: {
    title: "大赛已落幕",
    timer: "",
    badge: "CONTEST_CLOSED / 大赛已落幕",
  },
};

/* ─────────────── 颜色映射 ─────────────── */

const PHASE_COLOR: Record<Phase, string> = {
  submitting: "text-red-400",
  reviewing:  "text-amber-400",
  announcing: "text-emerald-400",
  closed:     "text-white/40",
};

/* ─────────────── 组件 ─────────────── */

type SubmissionCountdownProps = {
  /** default：通用；compact：首屏区；footer：视口底部次要信息 */
  variant?: "default" | "compact" | "footer";
};

export function SubmissionCountdown({ variant = "default" }: SubmissionCountdownProps) {
  const [phase, setPhase] = useState<Phase>(getPhase);
  const [parts, setParts] = useState<Parts>(() => getParts(getTarget(getPhase())));

  useEffect(() => {
    const id = window.setInterval(() => {
      const p = getPhase();
      setPhase(p);
      setParts(getParts(getTarget(p)));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const compact = variant === "compact";
  const footer = variant === "footer";
  const label = PHASE_LABEL[phase];
  const color = PHASE_COLOR[phase];

  /* ── 非倒计时态（已落幕 / 或单行 badge 展示） ── */
  const isCountingDown = phase !== "closed";

  if (!isCountingDown) {
    if (footer) {
      return (
        <div
          className="countdown-liquid-glass mx-auto flex w-full max-w-[min(100%,340px)] flex-col items-center gap-2 rounded-2xl px-5 py-3 md:px-6 md:py-3.5"
          role="status"
          aria-label={label.title}
        >
          <p className="font-body text-[13px] font-normal tracking-normal text-primary md:text-[14px]">
            {label.title}
          </p>
          <p className={`font-mono text-sm font-medium tracking-normal ${color}`}>
            {label.badge.split(" / ")[1]}
          </p>
        </div>
      );
    }
    return (
      <div
        className={
          compact
            ? `mx-auto flex max-w-[12.96rem] items-center justify-center rounded-lg border border-white/10 bg-black/60 px-[0.525rem] py-1.5 font-mono text-xs font-medium uppercase tracking-[0.036em] ${color} backdrop-blur-sm`
            : `mx-auto flex w-full max-w-[360px] items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.055] px-3 py-[0.9rem] font-mono text-sm font-medium uppercase tracking-[0.036em] ${color} shadow-[0_0_18px_rgba(0,255,204,0.07)] backdrop-blur-xl md:text-base`
        }
        role="status"
      >
        {label.badge}
      </div>
    );
  }

  /* ── 倒计时态（submitting / reviewing / announcing） ── */
  const blocks = [
    { value: padDays(parts.days), label: "天" },
    { value: pad2(parts.hours), label: "时" },
    { value: pad2(parts.minutes), label: "分" },
    { value: pad2(parts.seconds), label: "秒" },
  ] as const;

  const shell = footer
    ? "countdown-liquid-glass mx-auto flex w-full max-w-[min(100%,340px)] flex-col items-center gap-2 rounded-2xl px-5 py-3 font-mono md:px-6 md:py-3.5"
    : compact
      ? "mx-auto flex max-w-[12.6rem] flex-nowrap items-center justify-center gap-[0.27rem] rounded-lg border border-[#00ffcc]/28 bg-black/52 px-1.5 py-1.5 font-mono text-white shadow-[0_0_14px_rgba(0,255,204,0.12)] backdrop-blur-md"
      : "mx-auto flex w-full max-w-[360px] flex-nowrap items-center justify-center gap-[0.54rem] rounded-xl border border-white/[0.1] bg-white/[0.055] px-[0.6rem] py-[0.75rem] font-mono text-on-background shadow-[0_0_22px_rgba(0,255,204,0.075)] backdrop-blur-xl sm:gap-[0.63rem] sm:px-[0.75rem] sm:py-[0.81rem] md:gap-[0.9rem] md:px-[0.9rem] md:py-[0.81rem]";

  const digit = footer
    ? "block whitespace-nowrap text-[clamp(0.8125rem,3.1vw,1.2rem)] font-semibold leading-none text-white md:text-[1.35rem]"
    : compact
      ? "block whitespace-nowrap text-[clamp(0.875rem,3.6vw,1.25rem)] font-semibold leading-none text-[#a8ffe1] [text-shadow:0_0_10px_rgba(168,255,225,0.42),0_0_20px_rgba(0,255,204,0.14)]"
      : "block whitespace-nowrap text-[clamp(1.125rem,4.6vw,2.25rem)] font-semibold leading-none text-primary-container transition-opacity duration-300 sm:text-[clamp(1.2rem,4vw,2.7rem)] md:text-[3.3rem] md:leading-none [text-shadow:0_0_12px_rgba(0,255,204,0.28),0_0_24px_rgba(0,255,204,0.12)]";

  const labelCls = footer
    ? "mt-1 block whitespace-nowrap text-[0.66rem] font-normal tracking-[0.036em] text-primary md:text-[0.72rem]"
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
            className={`${digit}${b.label === "秒" && !footer ? " countdown-geek-seconds" : ""}`}
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
      <div className={shell} role="timer" aria-label={label.timer}>
        <p className="relative z-[1] font-body text-[13px] font-normal tracking-normal text-primary md:text-[14px]">
          {label.timer}
        </p>
        <div className="relative z-[1] flex w-full min-w-0 flex-nowrap items-center justify-center gap-x-[0.6rem] whitespace-nowrap md:gap-x-[0.9rem]">
          {inner}
        </div>
      </div>
    );
  }

  return (
    <div className={`${shell} min-w-0 whitespace-nowrap`} role="timer" aria-label={label.timer}>
      {inner}
    </div>
  );
}

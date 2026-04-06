import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

type Props = {
  icon: LucideIcon;
  emphasis?: "primary" | "secondary";
  /** 错开各卡片的浮动相位 */
  phase?: number;
  size?: "md" | "lg";
  className?: string;
  iconClassName?: string;
};

export function PrizeAwardIcon({
  icon: Icon,
  emphasis = "secondary",
  phase = 0,
  size = "md",
  className,
  iconClassName
}: Props) {
  const reduce = useReducedMotion();
  const ring =
    emphasis === "primary"
      ? "border-[#8af0c8]/58 bg-[#5ed29c]/26 text-[#f0fff9] shadow-[0_0_32px_rgba(126,229,181,0.48),0_0_52px_-6px_rgba(94,210,156,0.26)]"
      : "border-[#5ed29c]/46 bg-[#5ed29c]/[0.15] text-[#b8f8da] shadow-[0_0_22px_rgba(94,210,156,0.32),0_0_36px_-8px_rgba(126,229,181,0.14)]";

  const iconGlow =
    emphasis === "primary"
      ? "drop-shadow-[0_0_10px_rgba(200,255,230,0.75)]"
      : "drop-shadow-[0_0_8px_rgba(126,229,181,0.5)]";

  const box = size === "lg" ? "h-14 w-14 rounded-2xl" : "h-11 w-11 rounded-xl";
  const iconPx = size === "lg" ? "h-7 w-7" : "h-[22px] w-[22px]";

  return (
    <motion.div
      className={`mb-2 flex shrink-0 items-center justify-center border ${box} ${ring}${className ? ` ${className}` : ""}`}
      animate={
        reduce
          ? undefined
          : {
              y: [0, -4, 0]
            }
      }
      transition={{
        duration: 2.8 + phase * 0.25,
        repeat: Infinity,
        ease: "easeInOut",
        delay: phase * 0.4
      }}
      whileHover={reduce ? undefined : { scale: 1.06 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
    >
      <motion.div
        animate={
          reduce
            ? undefined
            : {
                scale: [1, 1.04, 1]
              }
        }
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: phase * 0.35
        }}
      >
        <Icon
          className={`${iconPx} ${iconGlow}${iconClassName ? ` ${iconClassName}` : ""}`}
          strokeWidth={emphasis === "primary" ? 1.65 : 1.5}
          aria-hidden
        />
      </motion.div>
    </motion.div>
  );
}

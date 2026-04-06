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
  /** 扁平：无阴影发光；仅主奖（20,000 U）青绿，其余中性灰 */
  const ring =
    emphasis === "primary"
      ? "border border-primary-container/50 bg-primary-container/[0.07] text-primary-container shadow-none"
      : "border border-outline-variant bg-white/[0.02] text-on-background/46 shadow-none";

  const box = size === "lg" ? "h-14 w-14 rounded-full" : "h-11 w-11 rounded-full";
  const iconPx = size === "lg" ? "h-7 w-7" : "h-[22px] w-[22px]";

  return (
    <motion.div
      className={`mb-2 flex shrink-0 items-center justify-center ${box} ${ring}${className ? ` ${className}` : ""}`}
      animate={
        reduce
          ? undefined
          : {
              y: [0, -3, 0]
            }
      }
      transition={{
        duration: 2.8 + phase * 0.25,
        repeat: Infinity,
        ease: "easeInOut",
        delay: phase * 0.4
      }}
      whileHover={reduce ? undefined : { scale: 1.03 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
    >
      <Icon
        className={`${iconPx}${iconClassName ? ` ${iconClassName}` : ""}`}
        strokeWidth={1.5}
        aria-hidden
      />
    </motion.div>
  );
}

/**
 * 细线箭头 SVG 图标，统一替代 → / ← 符号及 Lucide ChevronRight 等。
 * 颜色使用 `currentColor`，通过父级 text-* 控制。
 */
export function ThinArrow({
  dir = "right",
  className = "h-[10px] w-[14px] shrink-0"
}: {
  dir?: "right" | "left";
  className?: string;
}) {
  return (
    <svg
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {dir === "right" ? (
        <path
          d="M12.75 4.75L8.75 0.75M12.75 4.75L8.75 8.75M12.75 4.75L0.75 4.75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M1.25 4.75L5.25 0.75M1.25 4.75L5.25 8.75M1.25 4.75L13.25 4.75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

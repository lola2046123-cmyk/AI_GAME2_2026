/**
 * BrandLogo — 站点品牌图标（极简扁平吃豆人 + 青色豆子）。
 * 与 public/icon.svg 同款，便于 favicon 与顶栏视觉一致。
 */

type Props = {
  size?: number;
  className?: string;
};

export function BrandLogo({ size = 28, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="64" height="64" rx="14" fill="#101010" />
      <path d="M 26 32 L 45.9 22.7 A 22 22 0 1 0 45.9 41.3 Z" fill="#FFC831" />
      <circle cx="28" cy="22" r="2.8" fill="#101010" />
      <circle cx="53" cy="32" r="2.6" fill="#00FFCC" />
      <circle cx="60" cy="32" r="1.6" fill="#00FFCC" opacity="0.5" />
    </svg>
  );
}

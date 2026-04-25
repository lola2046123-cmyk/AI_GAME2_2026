/**
 * BrandLogo — 站点品牌图标（像素风）。
 * 使用用户提供的简化 SVG 造型。
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
      viewBox="0 0 14 12"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M2 8H3V9H4V10H5V11H9V10H11V11H10V12H4V11H3V10H2V9H1V8H0V5H1V3H2V2H3V1H4V0H10V1H11V2H9V1H5V2H4V3H3V5H2V8Z" fill="#1EFDCD" />
      <path d="M12 4H11V5H10V6H9V7H11V8H12V10H11V9H9V8H8V7H7V6H8V5H9V4H10V3H11V2H12V4Z" fill="#1EFDCD" />
      <path d="M14 7H12V5H14V7Z" fill="#1EFDCD" />
      <path d="M7 5H5V3H7V5Z" fill="#1EFDCD" />
    </svg>
  );
}

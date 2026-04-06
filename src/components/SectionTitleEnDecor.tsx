type Props = {
  titleZh: string;
  titleEn: string;
  align: "left" | "center";
  headlineClassName?: string;
  /** 独立页面主标题用 h1，首页内区块保持默认 h2 */
  headingLevel?: 1 | 2;
};

/** 中文主标题 + 英文仅作底部弱装饰，不与中文同级阅读 */
export function SectionTitleEnDecor({
  titleZh,
  titleEn,
  align,
  headlineClassName = "",
  headingLevel = 2
}: Props) {
  const wrap =
    align === "center" ? "mx-auto text-center" : "w-fit max-w-full text-left";
  const enPos = align === "center" ? "left-1/2 -translate-x-1/2" : "left-0";
  const HeadingTag = headingLevel === 1 ? "h1" : "h2";

  return (
    <div className={`relative pb-3 ${wrap}`}>
      <HeadingTag
        className={`relative z-10 text-balance font-headline text-5xl font-bold leading-[1.05] tracking-sophisticated text-on-background md:text-6xl ${headlineClassName}`}
      >
        {titleZh}
      </HeadingTag>
      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-0 ${enPos} translate-y-[36%] select-none whitespace-nowrap font-label text-[0.58rem] font-medium uppercase tracking-[0.12em] text-primary/30 md:text-[0.62rem]`}
      >
        {titleEn}
      </span>
    </div>
  );
}

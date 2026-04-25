type Props = {
  count: number;
  total?: number;
  /** 加载中：占位避免布局闪动 */
  isLoading?: boolean;
};

export function ShowcaseStatBar({ count, total, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="mt-5 flex min-h-[2.125rem] items-center justify-center md:mt-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-label text-[11px] font-medium uppercase tracking-technical text-white/50">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
          加载作品…
        </span>
      </div>
    );
  }

  if (count === 0 && (total === undefined || total === 0)) return null;

  const isFiltered = total !== undefined && total > 0 && count !== total;

  return (
    <div className="mt-5 flex min-h-[2.125rem] items-center justify-center md:mt-6">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-label text-[11px] font-medium uppercase tracking-technical text-white/55">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-container/90" aria-hidden />
        {isFiltered ? `${count} / ${total}` : `${count}`} 件作品
      </span>
    </div>
  );
}

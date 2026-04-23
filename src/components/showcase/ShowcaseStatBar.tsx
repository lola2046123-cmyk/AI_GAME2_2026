type Props = { count: number; total?: number };

export function ShowcaseStatBar({ count, total }: Props) {
  if (count === 0 && (total === undefined || total === 0)) return null;

  const isFiltered = total !== undefined && total > 0 && count !== total;

  return (
    <div className="mt-5 flex items-center justify-center gap-3 md:mt-6">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-label text-[11px] font-medium uppercase tracking-technical text-white/40">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00ffcc]" aria-hidden />
        {isFiltered ? `${count} / ${total}` : `${count}`} 件作品
      </span>
      <span className="font-label text-[11px] uppercase tracking-technical text-white/20">·</span>
      <span className="font-label text-[11px] uppercase tracking-technical text-white/25">
        HTML5 · 网页游戏
      </span>
    </div>
  );
}

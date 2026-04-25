/**
 * 展示页顶部的标签筛选条：
 * - 单选：点击切换激活，再点取消
 * - 仅渲染「至少有一条作品命中」的标签，避免无意义按钮
 * - 显示每个标签的命中数（不含「全部」）
 */

import { SHOWCASE_TAGS } from "../../types/showcaseTags";

type Props = {
  /** 全量作品（用于计算每个标签的命中数） */
  totalCount: number;
  counts: Record<string, number>;
  active: string | null;
  onChange: (next: string | null) => void;
};

export function ShowcaseTagFilter({ totalCount, counts, active, onChange }: Props) {
  const visibleTags = SHOWCASE_TAGS.filter((t) => (counts[t.value] ?? 0) > 0);

  if (visibleTags.length === 0 && totalCount === 0) return null;

  const baseChip =
    "shrink-0 rounded-full border px-3.5 py-1.5 font-label text-xs font-medium tracking-normal transition-all duration-200";
  const activeChip =
    "border-primary-container/55 bg-primary-container/15 text-primary-container shadow-[0_0_18px_-4px_rgba(0,255,204,0.45)]";
  const idleChip =
    "border-white/[0.12] bg-white/[0.04] text-white/55 hover:border-white/25 hover:text-white/80";

  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between gap-3 mb-2.5">
        <p className="font-label text-[11px] font-medium uppercase tracking-technical text-white/40">
          按标签筛选
        </p>
        {active && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="font-label text-[10px] uppercase tracking-technical text-primary/55 hover:text-primary-container transition-colors"
          >
            清除筛选
          </button>
        )}
      </div>

      <div
        className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]"
        role="tablist"
        aria-label="作品标签筛选"
      >
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`${baseChip} ${active === null ? activeChip : idleChip}`}
          role="tab"
          aria-selected={active === null}
        >
          全部
          <span className="ml-1.5 font-mono text-[10px] opacity-60">
            {totalCount}
          </span>
        </button>

        {visibleTags.map((t) => {
          const on = active === t.value;
          const n = counts[t.value] ?? 0;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(on ? null : t.value)}
              className={`${baseChip} ${on ? activeChip : idleChip}`}
              role="tab"
              aria-selected={on}
            >
              {t.value}
              <span className="ml-1.5 font-mono text-[10px] opacity-55">{n}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

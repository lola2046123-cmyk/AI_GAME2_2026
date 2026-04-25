/**
 * 报名表单中的「作品标签」多选器：
 * - 分组（玩法 / 风格）
 * - 最多 3 个，达到上限后未选项变灰禁用
 * - 视觉与现有 PRESET_TOOLS chip 一致
 */

import {
  SHOWCASE_TAGS,
  TAG_CATEGORY_LABEL,
  MAX_TAGS_PER_SUBMISSION,
  groupTags,
  type ShowcaseTagCategory,
} from "../../types/showcaseTags";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
};

const CATEGORY_ORDER: ShowcaseTagCategory[] = ["gameplay", "style"];

export function ShowcaseTagPicker({ value, onChange }: Props) {
  const grouped = groupTags(SHOWCASE_TAGS);
  const reachedMax = value.length >= MAX_TAGS_PER_SUBMISSION;

  const toggle = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
      return;
    }
    if (reachedMax) return;
    onChange([...value, tag]);
  };

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <p className="font-label text-xs font-medium uppercase tracking-technical text-white/55">
          作品标签
          <span className="ml-2 normal-case text-[10px] font-normal text-white/30">
            最多 {MAX_TAGS_PER_SUBMISSION} 个 · 用于展示页筛选
          </span>
        </p>
        <span
          className={`font-label text-[10px] uppercase tracking-technical ${
            reachedMax ? "text-primary-container/80" : "text-white/30"
          }`}
        >
          {value.length}/{MAX_TAGS_PER_SUBMISSION}
        </span>
      </div>

      <div className="space-y-3">
        {CATEGORY_ORDER.map((cat) => {
          const tags = grouped.get(cat) ?? [];
          if (tags.length === 0) return null;
          return (
            <div key={cat}>
              <p className="mb-2 font-label text-[10px] font-medium uppercase tracking-widest text-white/35">
                {TAG_CATEGORY_LABEL[cat]}
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => {
                  const on = value.includes(t.value);
                  const disabled = !on && reachedMax;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => toggle(t.value)}
                      disabled={disabled}
                      className={`rounded-full border px-3.5 py-1.5 font-label text-xs font-medium tracking-normal transition-all duration-200 ${
                        on
                          ? "border-primary-container/55 bg-primary-container/15 text-primary-container shadow-[0_0_18px_-4px_rgba(0,255,204,0.45)]"
                          : disabled
                            ? "border-white/[0.06] bg-white/[0.02] text-white/20 cursor-not-allowed"
                            : "border-white/[0.12] bg-white/[0.04] text-white/45 hover:border-white/25 hover:text-white/70"
                      }`}
                    >
                      {t.value}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

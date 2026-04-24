import { useOutletContext } from "react-router-dom";
import { ThinArrow } from "../ThinArrow";
import type { AppOutletContext } from "../../types/outlet";

type Props = { filtered?: boolean };

export function ShowcaseEmpty({ filtered = false }: Props) {
  let openRegister: (() => void) | undefined;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ctx = useOutletContext<AppOutletContext>();
    openRegister = ctx.openRegister;
  } catch {
    openRegister = undefined;
  }

  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-24 text-center md:py-36">
      {/* 空心圆点装饰 */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
        <span
          className="font-label text-2xl font-bold leading-none text-white/15"
          aria-hidden
        >
          ∅
        </span>
      </div>

      {filtered ? (
        <>
          <p className="font-headline text-base font-semibold text-white">
            暂无匹配作品
          </p>
          <p className="mt-2 max-w-xs font-body text-sm leading-relaxed text-white/40">
            尝试切换分类或排序方式，浏览全部参赛作品。
          </p>
        </>
      ) : (
        <>
          <p className="font-headline text-base font-semibold text-white">
            暂无参赛作品
          </p>
          <p className="mt-2 max-w-xs font-body text-sm leading-relaxed text-white/40">
            作品提交后将在这里展示，成为第一位参赛者吧。
          </p>
          {openRegister && (
            <button
              type="button"
              onClick={openRegister}
              className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-6 py-2.5 font-label text-xs font-medium uppercase tracking-widest text-white/60 transition-colors duration-200 hover:border-white/25 hover:text-white/90"
            >
              提交作品 <ThinArrow />
            </button>
          )}
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useOpenRegistration } from "../../context/RegistrationUiContext";
import { BrandLogo } from "./BrandLogo";

const navLinkClass =
  "site-nav-link font-label text-sm font-medium tracking-normal text-white/80 transition-colors hover:text-primary-container";

/**
 * 全站统一顶栏：与首页同布局、悬停高亮、移动端全屏菜单。
 */
export function SiteHeader() {
  const { pathname } = useLocation();
  const openRegistration = useOpenRegistration();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 flex h-[var(--site-header-height)] w-full flex-col border-b border-white/[0.095] bg-background/66 backdrop-blur-xl box-border">
        <div
          className="shrink-0"
          style={{ height: "env(safe-area-inset-top, 0px)" }}
          aria-hidden
        />
        <div className="flex h-[var(--site-header-inner-height)] w-full items-center justify-center px-6 md:px-12">
          <div className="flex w-full max-w-home items-center justify-between gap-4 sm:gap-6">
          <Link
            to="/"
            className="site-brand-logo group inline-flex shrink-0 items-center gap-2 font-headline text-lg font-semibold tracking-[-0.02em] text-white md:text-xl"
          >
            <BrandLogo
              size={28}
              className="shrink-0 drop-shadow-[0_0_10px_rgba(0,255,204,0.18)] transition-transform duration-300 group-hover:scale-[1.06] md:h-[32px] md:w-[32px]"
            />
            AI_GAME_2026
          </Link>

          <nav
            className="hidden items-center gap-10 md:flex"
            aria-label="主导航"
          >
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${navLinkClass} ${isActive ? "site-nav-link--active text-primary-container" : ""}`
              }
            >
              首页海报
            </NavLink>
            <NavLink
              to="/showcase"
              className={({ isActive }) =>
                `${navLinkClass} ${isActive ? "site-nav-link--active text-primary-container" : ""}`
              }
            >
              参赛展示
            </NavLink>
            <NavLink
              to="/deploy"
              className={({ isActive }) =>
                `${navLinkClass} ${isActive ? "site-nav-link--active text-primary-container" : ""}`
              }
            >
              部署指南
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openRegistration?.()}
              className="btn-primary hidden text-xs md:inline-flex md:px-5 md:py-2.5"
            >
              提交作品
            </button>
            <Link
              to="/admin"
              className="hidden font-label text-[10px] uppercase tracking-technical text-primary/45 transition-colors hover:text-primary-container/90 sm:inline"
              title="管理中心"
            >
              管理
            </Link>
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-white md:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-background/97 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="菜单"
        >
          <div className="flex justify-end px-4 pt-3 sm:pt-5">
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-white"
              aria-label="关闭菜单"
              onClick={() => setMenuOpen(false)}
            >
              <X className="h-7 w-7" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-8 overflow-y-auto px-10 pt-4 pb-[max(2rem,env(safe-area-inset-bottom,0px)+1.5rem)] font-headline text-lg">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-white/90 transition-colors hover:text-primary-container ${isActive ? "text-primary-container" : ""}`
              }
              onClick={() => setMenuOpen(false)}
            >
              首页海报
            </NavLink>
            <NavLink
              to="/showcase"
              className={({ isActive }) =>
                `text-white/90 transition-colors hover:text-primary-container ${isActive ? "text-primary-container" : ""}`
              }
              onClick={() => setMenuOpen(false)}
            >
              参赛展示
            </NavLink>
            <NavLink
              to="/deploy"
              className={({ isActive }) =>
                `text-white/90 transition-colors hover:text-primary-container ${isActive ? "text-primary-container" : ""}`
              }
              onClick={() => setMenuOpen(false)}
            >
              部署指南
            </NavLink>
            <Link
              to="/admin"
              className="text-primary/50 transition-colors hover:text-primary-container/80"
              onClick={() => setMenuOpen(false)}
            >
              管理
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openRegistration?.();
              }}
              className="btn-primary mt-4 w-fit px-8 py-3.5 text-left text-sm"
            >
              提交作品
            </button>
          </nav>
        </div>
      ) : null}
    </>
  );
}

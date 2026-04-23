import type { ReactNode } from "react";
import { ArenaCursorTrail } from "../arena/ArenaCursorTrail";
import { SiteHeader } from "./SiteHeader";

export function AppChrome({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen min-h-[100dvh] bg-background text-on-background">
      <ArenaCursorTrail />
      <div className="app-atmosphere bg-background" aria-hidden>
        <span className="app-atmosphere__grid" />
        <span className="app-atmosphere__beam" />
        <div className="absolute top-[-8%] left-[12%] h-[min(72vh,760px)] w-[min(110vw,900px)] max-w-[1400px] -translate-x-1/4 animate-pulse rounded-full bg-[radial-gradient(ellipse_at_center,rgba(168,255,225,0.09)_0%,rgba(0,255,204,0.045)_42%,transparent_68%)] blur-[min(9rem,18vw)]" />
        <div className="absolute right-[-6%] bottom-[-12%] h-[min(78vh,820px)] w-[min(115vw,920px)] max-w-[1400px] animate-pulse rounded-full bg-[radial-gradient(ellipse_at_center,rgba(168,255,225,0.065)_0%,rgba(0,255,204,0.032)_45%,transparent_70%)] blur-[min(10rem,20vw)] delay-1000" />
      </div>
      <div className="app-film-grain" aria-hidden />
      <div className="relative z-10">
        <SiteHeader />
        {/* fixed 顶栏占位：高度与 --site-header-height / SiteHeader 一致 */}
        <div className="shrink-0" style={{ height: "var(--site-header-height)" }} aria-hidden />
        <div className="overflow-x-clip">{children}</div>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { PointerFx } from "../PointerFx";
import { SiteHeader } from "./SiteHeader";

export function AppChrome({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const pointerFxOn = pathname !== "/";

  return (
    <div className="relative min-h-screen min-h-[100dvh]">
      {pointerFxOn ? <PointerFx /> : null}
      <div className="noise-overlay" />
      <div className="fixed inset-0 -z-10 bg-background">
        <div className="absolute top-0 left-1/4 h-[520px] w-[520px] animate-pulse rounded-full bg-[#5ed29c]/[0.085] blur-[125px]" />
        <div className="absolute right-1/4 bottom-0 h-[600px] w-[600px] animate-pulse rounded-full bg-[#5ed29c]/[0.068] blur-[152px] delay-1000" />
      </div>
      <SiteHeader />
      {/* fixed 顶栏占位：高度与 --site-header-height / SiteHeader 一致 */}
      <div className="shrink-0" style={{ height: "var(--site-header-height)" }} aria-hidden />
      <div className="overflow-x-clip">{children}</div>
    </div>
  );
}

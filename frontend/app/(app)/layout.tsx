import type { ReactNode } from "react";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { demoFarm } from "@/lib/sample-data";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <a
        href="#main-content"
        className="sr-only z-30 rounded-control bg-white px-4 py-3 font-semibold text-forest focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to main content
      </a>
      <Sidebar farm={demoFarm} />
      <div className="flex min-w-0 flex-col">
        <TopBar farm={demoFarm} />
        <main
          id="main-content"
          className="mx-auto w-full max-w-[1120px] flex-1 px-4 pt-6 pb-24 sm:px-6 lg:px-10 lg:pt-8 lg:pb-12"
        >
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

"use client";

import { type ReactNode, useState, useSyncExternalStore } from "react";
import { MobileNav } from "./MobileNav";
import { SiteFooter } from "./SiteFooter";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

// Desktops start with the full sidebar, tablets with the narrow rail. The same rule is in globals.css.
const WIDE = "(min-width: 1280px)";
const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

// The frame every app page sits in: sidebar, top bar, the page itself, and the phone navigation.
// The sidebar choice is kept in memory only, like everything else in a session.
export function AppShell({ children }: { children: ReactNode }) {
  // null = the farmer has not chosen, so the screen size decides
  const [choice, setChoice] = useState<boolean | null>(null);
  const wide = useSyncExternalStore(subscribe, () => window.matchMedia(WIDE).matches, () => true);
  const navOpen = choice ?? wide;

  return (
    <div className="fs-shell min-h-dvh md:flex" data-nav={choice === null ? "auto" : choice ? "open" : "closed"}>
      <a
        href="#main-content"
        className="sr-only z-40 min-h-12 items-center rounded-control bg-white px-4 font-semibold text-forest focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:inline-flex"
      >
        Skip to main content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar navOpen={navOpen} onToggleNav={() => setChoice(!navOpen)} />
        <main
          id="main-content"
          className="mx-auto w-full max-w-[1120px] flex-1 [overflow-wrap:anywhere] px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 md:pb-14 lg:px-10 lg:pt-8"
        >
          {children}
          <SiteFooter className="mt-14 border-t border-line pt-6" />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

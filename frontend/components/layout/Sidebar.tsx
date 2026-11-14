"use client";

import { Lock, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useEndSession } from "@/components/session/EndSessionButton";
import { cx } from "@/lib/cx";
import { currentItem, navGroups } from "@/lib/navigation";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";

const row =
  "fs-nav-link relative flex h-11 w-full items-center gap-3 overflow-hidden rounded-control px-3 text-[15px] transition-colors focus-visible:outline-white";

// The sidebar for tablets and desktops. Its width is set by the shell (see globals.css):
// full width with names, or a narrow rail of icons. Names stay readable by screen readers either way.
export function Sidebar() {
  const pathname = usePathname();
  const endSession = useEndSession();
  const active = currentItem(pathname)?.href;
  const nav = useRef<HTMLElement>(null);
  const [mark, setMark] = useState<{ top: number; height: number } | null>(null);
  const [ready, setReady] = useState(false);

  // Slide the marker to the page that is open.
  useEffect(() => {
    const el = nav.current;
    if (!el) return;
    const measure = () => {
      const li = active ? el.querySelector<HTMLElement>(`[data-href="${active}"]`) : null;
      setMark(li ? { top: li.offsetTop, height: li.offsetHeight } : null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);

  // The first time, the marker appears in place. After that it slides.
  useEffect(() => {
    if (!mark || ready) return;
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [mark, ready]);

  return (
    <aside id="app-sidebar" aria-label="Sidebar" className="fs-sidebar hidden bg-forest md:block">
      <div className="fs-sidebar-inner sticky top-0 flex h-dvh flex-col px-3 pb-3">
        <div className="flex h-14 shrink-0 items-center pl-1.5">
          <Logo fades />
        </div>

        <nav ref={nav} aria-label="Main" className="relative mt-3">
          <span
            aria-hidden="true"
            className="fs-nav-indicator"
            data-ready={ready && mark !== null}
            style={mark ? { transform: `translateY(${mark.top}px)`, height: mark.height } : undefined}
          />
          {navGroups.map((group, index) => {
            const headingId = `nav-group-${group.title.toLowerCase()}`;
            return (
              <div key={group.title} className={cx(index > 0 && "mt-4")}>
                <div className="relative flex h-7 items-center">
                  <p
                    id={headingId}
                    className="fs-nav-label px-3 text-[11px] font-semibold tracking-[0.1em] text-on-forest-muted uppercase"
                  >
                    {group.title}
                  </p>
                  {index > 0 && <span aria-hidden="true" className="fs-nav-rule absolute inset-x-2 top-1/2 h-px bg-white/15" />}
                </div>
                <ul aria-labelledby={headingId} className="space-y-0.5">
                  {group.items.map((item) => {
                    const { label, icon: Icon } = item;
                    const current = item.href === active;
                    return (
                      <li key={item.href} data-href={item.href} className="relative">
                        <NavLink
                          item={item}
                          current={current}
                          className={cx(
                            row,
                            current ? "font-semibold text-white" : "text-on-forest hover:bg-white/[0.07] hover:text-white",
                          )}
                        >
                          <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={current ? 2 : 1.7} />
                          <span className="fs-nav-label">{label}</span>
                        </NavLink>
                        <span aria-hidden="true" className="fs-tip">
                          {label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="mt-auto space-y-0.5 border-t border-white/10 pt-3">
          <p className="flex h-11 items-center gap-3 overflow-hidden px-3 text-[13px] text-on-forest-muted">
            <Lock aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.7} />
            <span className="fs-nav-label">Nothing is saved</span>
          </p>
          <div className="relative">
            <button type="button" onClick={endSession} className={cx(row, "text-on-forest hover:bg-white/[0.07] hover:text-white")}>
              <LogOut aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.7} />
              <span className="fs-nav-label">End session</span>
            </button>
            <span aria-hidden="true" className="fs-tip">
              End session
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

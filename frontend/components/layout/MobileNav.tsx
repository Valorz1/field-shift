"use client";

import { Lock, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { EndSessionButton } from "@/components/session/EndSessionButton";
import { cx } from "@/lib/cx";
import { currentItem, navGroups, tabItems } from "@/lib/navigation";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";

const tab = "fs-press relative flex min-h-14 w-full flex-col items-center justify-center gap-1 text-xs";

// Phones: the 4 main pages sit in a bar at the bottom, and "Menu" slides out the full list.
// The menu is a <dialog>, so the browser keeps focus inside it and Escape closes it.
export function MobileNav() {
  const active = currentItem(usePathname())?.href;
  const drawer = useRef<HTMLDialogElement>(null);
  const close = () => drawer.current?.close();
  const inTabs = tabItems.some((item) => item.href === active);

  return (
    <>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="grid grid-cols-5">
          {tabItems.map((item) => {
            const { shortLabel, icon: Icon } = item;
            const current = item.href === active;
            return (
              <li key={item.href}>
                <NavLink item={item} current={current} className={cx(tab, current ? "font-semibold text-forest" : "text-caption")}>
                  {current && <span aria-hidden="true" className="absolute top-0 h-0.5 w-8 rounded-full bg-gold" />}
                  <Icon aria-hidden="true" className="size-5" strokeWidth={current ? 2 : 1.6} />
                  {shortLabel}
                </NavLink>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => drawer.current?.showModal()}
              className={cx(tab, !inTabs && active ? "font-semibold text-forest" : "text-caption")}
            >
              {!inTabs && active && <span aria-hidden="true" className="absolute top-0 h-0.5 w-8 rounded-full bg-gold" />}
              <Menu aria-hidden="true" className="size-5" strokeWidth={1.6} />
              Menu
            </button>
          </li>
        </ul>
      </nav>

      <dialog
        ref={drawer}
        aria-label="Menu"
        className="fs-drawer md:hidden"
        // a tap on the dimmed page (the dialog's own backdrop) closes the menu
        onClick={(event) => event.target === drawer.current && close()}
      >
        <div className="flex h-full flex-col overflow-y-auto px-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex h-14 shrink-0 items-center justify-between pl-1.5">
            <Logo />
            <button
              type="button"
              onClick={close}
              aria-label="Close the menu"
              className="fs-press grid size-11 place-items-center rounded-control text-on-forest hover:bg-white/10 focus-visible:outline-white"
            >
              <X aria-hidden="true" className="size-5" strokeWidth={1.8} />
            </button>
          </div>
          <nav aria-label="All pages" className="mt-2">
            {navGroups.map((group, index) => (
              <div key={group.title} className={cx(index > 0 && "mt-4")}>
                <p className="px-3 py-1.5 text-[11px] font-semibold tracking-[0.1em] text-on-forest-muted uppercase">{group.title}</p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const { label, icon: Icon } = item;
                    const current = item.href === active;
                    return (
                      <li key={item.href}>
                        <NavLink
                          item={item}
                          current={current}
                          onClick={close}
                          className={cx(
                            "relative flex h-12 items-center gap-3 rounded-control px-3 text-base focus-visible:outline-white",
                            current ? "bg-white/10 font-semibold text-white" : "text-on-forest hover:bg-white/[0.07]",
                          )}
                        >
                          {current && <span aria-hidden="true" className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-gold" />}
                          <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={current ? 2 : 1.7} />
                          {label}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
            <p className="flex items-center gap-3 px-3 text-sm text-on-forest-muted">
              <Lock aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.7} />
              Session only. Nothing is saved.
            </p>
            <EndSessionButton className="w-full" />
          </div>
        </div>
      </dialog>
    </>
  );
}

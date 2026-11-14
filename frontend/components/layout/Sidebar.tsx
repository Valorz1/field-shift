"use client";

import { usePathname } from "next/navigation";
import { EndSessionButton } from "@/components/session/EndSessionButton";
import { cx } from "@/lib/cx";
import { isActivePath, navItems, navKey } from "@/lib/navigation";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";
import { SessionCard } from "./SessionCard";
import { WithSite } from "./WithSite";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden bg-forest lg:block">
      <div className="sticky top-0 flex h-dvh flex-col gap-8 overflow-y-auto px-4 py-6">
        <Logo className="px-2" />
        <nav aria-label="Main">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const { label, icon: Icon } = item;
              const active = isActivePath(pathname, item);
              return (
                <li key={navKey(item)}>
                  <NavLink
                    item={item}
                    current={active}
                    className={cx(
                      "flex min-h-12 items-center gap-3 rounded-control px-3 text-base transition-colors focus-visible:outline-white",
                      active
                        ? "bg-primary font-semibold text-white"
                        : "text-on-forest hover:bg-white/8 hover:text-white",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.6} />
                    {label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto space-y-4">
          <WithSite render={(site) => <SessionCard site={site} />} />
          <p className="text-sm leading-relaxed text-on-forest-muted">
            Session only. Nothing is stored after you finish. Free, no hidden fees. Built by team Valor Astra.
          </p>
          <EndSessionButton className="w-full" />
        </div>
      </div>
    </aside>
  );
}

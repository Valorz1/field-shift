"use client";

import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import { isActivePath, navItems, navKey } from "@/lib/navigation";
import { NavLink } from "./NavLink";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {navItems.map((item) => {
          const { shortLabel, icon: Icon } = item;
          const active = isActivePath(pathname, item);
          return (
            <li key={navKey(item)}>
              <NavLink
                item={item}
                current={active}
                className={cx(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-sm",
                  active ? "font-semibold text-primary" : "text-caption hover:text-forest",
                )}
              >
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.6} />
                {shortLabel}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

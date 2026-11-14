"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import { isActivePath, navItems } from "@/lib/navigation";

const mobileItems = navItems.filter((item) => item.shortLabel);

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {mobileItems.map(({ href, shortLabel, icon: Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-sm",
                  active ? "font-semibold text-primary" : "text-caption hover:text-forest",
                )}
              >
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.6} />
                {shortLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

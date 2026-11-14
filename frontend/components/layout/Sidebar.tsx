"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EndSessionButton } from "@/components/session/EndSessionButton";
import { cx } from "@/lib/cx";
import { isActivePath, navItems } from "@/lib/navigation";
import { Logo } from "./Logo";
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
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = isActivePath(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "flex min-h-11 items-center gap-3 rounded-control px-3 text-sm transition-colors focus-visible:outline-white",
                      active
                        ? "bg-primary font-semibold text-white"
                        : "text-on-forest hover:bg-white/8 hover:text-white",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.6} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto space-y-4">
          <WithSite render={(site) => <SessionCard site={site} />} />
          <p className="text-xs leading-relaxed text-on-forest-muted">
            Session only. Nothing is stored after you finish. Free, no hidden fees. Built by team Valor Astra.
          </p>
          <EndSessionButton className="w-full" />
        </div>
      </div>
    </aside>
  );
}

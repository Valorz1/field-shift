"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import type { NavItem } from "@/lib/navigation";

type Props = { item: NavItem; className: string; current: boolean; children: ReactNode };

const target = (item: NavItem, site: string | null) =>
  `${item.href}${item.href === "/dashboard" && site ? `?site=${encodeURIComponent(site)}` : ""}${item.section ? `#${item.section}` : ""}`;

function WithFarm({ item, className, current, children }: Props) {
  const site = useSearchParams().get("site");
  return (
    <Link href={target(item, site)} aria-current={current ? "page" : undefined} className={className}>
      {children}
    </Link>
  );
}

// Keeps the open demo farm when jumping between sections. useSearchParams needs a Suspense boundary.
export function NavLink(props: Props) {
  return (
    <Suspense
      fallback={
        <Link href={target(props.item, null)} className={props.className}>
          {props.children}
        </Link>
      }
    >
      <WithFarm {...props} />
    </Suspense>
  );
}

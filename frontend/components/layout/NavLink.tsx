"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import type { NavItem } from "@/lib/navigation";

type Props = { item: NavItem; className: string; current: boolean; children: ReactNode; onClick?: () => void };

const target = (item: NavItem, site: string | null) =>
  `${item.href}${item.keepsFarm && site ? `?site=${encodeURIComponent(site)}` : ""}`;

function WithFarm({ item, className, current, children, onClick }: Props) {
  const site = useSearchParams().get("site");
  return (
    <Link href={target(item, site)} aria-current={current ? "page" : undefined} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

// Keeps the open demo farm when moving between pages. useSearchParams needs a Suspense boundary.
export function NavLink(props: Props) {
  return (
    <Suspense
      fallback={
        <Link href={target(props.item, null)} className={props.className} onClick={props.onClick}>
          {props.children}
        </Link>
      }
    >
      <WithFarm {...props} />
    </Suspense>
  );
}

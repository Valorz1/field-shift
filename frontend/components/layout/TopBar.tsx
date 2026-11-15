"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { currentItem } from "@/lib/navigation";
import { useClimateSite } from "@/lib/use-climate-site";
import { LogoMark } from "./Logo";
import { FarmSelector } from "./topbar/FarmSelector";
import { FieldAlerts } from "./topbar/FieldAlerts";
import { PeriodInfo } from "./topbar/PeriodInfo";
import { SessionMenu } from "./topbar/SessionMenu";

type Props = { navOpen: boolean; onToggleNav: () => void };

// Farm, page, dates, alerts and session. The dates and alerts only show on pages about one field,
// and only once the NASA data for it has arrived.
function Tools({ label, aboutField }: { label?: string; aboutField: boolean }) {
  const { place, site } = useClimateSite();
  return (
    <>
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex min-w-0 items-center gap-1">
          <li className="min-w-0">
            <FarmSelector place={place} />
          </li>
          {label && (
            <li className="hidden items-center gap-2 text-sm sm:flex">
              <span aria-hidden="true" className="text-sage">
                /
              </span>
              <span aria-current="page" className="font-medium whitespace-nowrap text-ink">
                {label}
              </span>
            </li>
          )}
        </ol>
      </nav>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {aboutField && site && (
          <>
            <div className="hidden lg:block">
              <PeriodInfo site={site} />
            </div>
            <FieldAlerts site={site} />
          </>
        )}
        <SessionMenu place={place} />
      </div>
    </>
  );
}

export function TopBar({ navOpen, onToggleNav }: Props) {
  const item = currentItem(usePathname());
  const ToggleIcon = navOpen ? PanelLeftClose : PanelLeftOpen;
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-page/85 backdrop-blur-md">
      <div className="relative flex h-14 items-center gap-1 px-3 md:px-4">
        <Link href="/dashboard" aria-label="Rotara, go to the dashboard" className="grid size-11 shrink-0 place-items-center rounded-lg md:hidden">
          <LogoMark />
        </Link>
        <button
          type="button"
          onClick={onToggleNav}
          aria-label={navOpen ? "Collapse the sidebar" : "Expand the sidebar"}
          aria-expanded={navOpen}
          aria-controls="app-sidebar"
          className="fs-press mr-1 hidden size-10 place-items-center rounded-control transition-colors hover:bg-white md:grid"
        >
          <ToggleIcon aria-hidden="true" className="size-5 text-forest" strokeWidth={1.7} />
        </button>
        <Suspense fallback={null}>
          <Tools label={item?.label} aboutField={Boolean(item?.aboutField)} />
        </Suspense>
      </div>
    </header>
  );
}

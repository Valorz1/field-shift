"use client";

import { Lock } from "lucide-react";
import { formatYears } from "@/lib/format";
import { Logo } from "./Logo";
import { WithSite } from "./WithSite";

export function TopBar() {
  return (
    <header className="sticky top-0 z-10">
      <div className="flex min-h-14 items-center bg-forest px-4 lg:hidden">
        <Logo />
      </div>
      <div className="hidden min-h-16 items-center justify-between gap-4 border-b border-line bg-white px-6 lg:flex">
        <WithSite
          render={(site) => (
            <dl className="flex items-center gap-2 text-sm text-ink">
              <div className="rounded-control border border-line px-3 py-2">
                <dt className="sr-only">Location</dt>
                <dd className="font-medium">
                  {site.name}, {site.region}
                </dd>
              </div>
              <div className="rounded-control border border-line px-3 py-2">
                <dt className="sr-only">Year shown</dt>
                <dd className="font-medium">Jan – Dec {site.year}</dd>
              </div>
              <div className="rounded-control border border-line px-3 py-2">
                <dt className="sr-only">Usual</dt>
                <dd className="font-medium">Usual: {formatYears(site.baseline.start, site.baseline.end)}</dd>
              </div>
            </dl>
          )}
        />
        <p className="inline-flex items-center gap-2 rounded-full bg-green-tint px-3 py-1.5 text-sm font-medium text-green-ink">
          <Lock aria-hidden="true" className="size-4" strokeWidth={1.6} />
          Session only · cleared when you finish
        </p>
      </div>
    </header>
  );
}

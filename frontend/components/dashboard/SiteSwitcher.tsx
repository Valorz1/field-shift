"use client";

import { MapPin } from "lucide-react";
import Link from "next/link";
import { cx } from "@/lib/cx";
import { climateSites } from "@/lib/data/climate";
import { updateSession } from "@/lib/session-store";

// Example farm switch, as round buttons: white on the dark banner, green on light pages.
export function SiteSwitcher({ current, onDark = false }: { current: string; onDark?: boolean }) {
  return (
    <nav aria-label="Example farms">
      <ul className="flex flex-wrap gap-2">
        {climateSites.map((site) => {
          const active = site.id === current;
          return (
            <li key={site.id}>
              <Link
                href={{ query: { site: site.id } }}
                // choosing a demo farm drops the pinned place and goes back to that farm's own crop
                onClick={() => updateSession({ latitude: undefined, longitude: undefined, crop: undefined })}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "fs-press flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-base font-semibold transition-colors",
                  onDark
                    ? active
                      ? "border-white bg-white text-forest"
                      : "border-on-forest-muted text-white hover:bg-white/10"
                    : active
                      ? "border-forest bg-forest text-white"
                      : "border-line bg-white text-forest hover:border-sage hover:bg-green-tint",
                )}
              >
                {active && <MapPin aria-hidden="true" className="size-4" strokeWidth={2} />}
                {site.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

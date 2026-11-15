"use client";

import Link from "next/link";
import { cx } from "@/lib/cx";
import { climateSites } from "@/lib/data/climate";
import { updateSession } from "@/lib/session-store";

export function SiteSwitcher({ current, onDark = false }: { current: string; onDark?: boolean }) {
  return (
    <nav aria-label="Location">
      <ul className={cx("flex flex-wrap gap-2", !onDark && "border-b border-line")}>
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
                  onDark
                    ? "flex min-h-12 items-center justify-center rounded-full border px-4 text-base font-semibold transition-colors"
                    : "-mb-px flex min-h-12 min-w-12 items-center justify-center border-b-2 px-3 text-lg transition-colors",
                  onDark
                    ? active
                      ? "border-white bg-white text-forest"
                      : "border-on-forest-muted text-white hover:bg-white/10"
                    : active
                      ? "border-forest font-semibold text-forest"
                      : "border-transparent text-caption hover:text-forest",
                )}
              >
                {site.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

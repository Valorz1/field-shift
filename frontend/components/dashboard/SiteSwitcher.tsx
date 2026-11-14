import Link from "next/link";
import { cx } from "@/lib/cx";
import { climateSites } from "@/lib/data/climate";

export function SiteSwitcher({ current }: { current: string }) {
  return (
    <nav aria-label="Location">
      <ul className="flex gap-2 border-b border-line">
        {climateSites.map((site) => {
          const active = site.id === current;
          return (
            <li key={site.id}>
              <Link
                href={{ query: { site: site.id } }}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "-mb-px flex min-h-12 min-w-12 items-center justify-center border-b-2 px-3 text-lg transition-colors",
                  active ? "border-forest font-semibold text-forest" : "border-transparent text-caption hover:text-forest",
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

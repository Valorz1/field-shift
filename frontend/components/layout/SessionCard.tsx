import type { ClimateSite } from "@/lib/data/climate";
import { formatCoordinates, formatYears } from "@/lib/format";

export function SessionCard({ site }: { site: ClimateSite }) {
  return (
    <section aria-labelledby="session-card-title" className="rounded-inner bg-white/8 p-4 text-on-forest">
      <p className="text-sm font-medium tracking-wider text-on-forest-muted uppercase">This session</p>
      <h2 id="session-card-title" className="mt-1 font-display text-base font-bold text-white">
        {site.name}, {site.region}
      </h2>
      <p className="mt-1 text-sm">{formatCoordinates(site.latitude, site.longitude)}</p>
      <p className="mt-1 text-sm">NASA POWER monthly data, {formatYears(site.source.firstYear, site.source.lastYear)}</p>
    </section>
  );
}

import { MapPin } from "lucide-react";
import { FieldIllustration } from "@/components/landing/FieldIllustration";
import { headline, usualYears } from "@/lib/climate-facts";
import type { ClimateSite } from "@/lib/data/climate";
import { formatCoordinates } from "@/lib/format";
import { SiteSwitcher } from "./SiteSwitcher";

// The green banner at the top of the dashboard: which field, and the one-sentence answer.
export function DashboardHero({ site }: { site: ClimateSite }) {
  return (
    <header className="fs-rise relative overflow-hidden rounded-card bg-forest text-white">
      <FieldIllustration className="absolute inset-0 size-full" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,61,50,0.97)_0%,rgba(22,61,50,0.88)_60%,rgba(22,61,50,0.55)_100%)]"
      />
      <div className="relative space-y-4 p-5 sm:p-7">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-on-forest">
          <span className="inline-flex items-center gap-1.5 font-semibold text-white">
            <MapPin aria-hidden="true" className="size-5" strokeWidth={1.8} />
            {site.name}, {site.region}
          </span>
          <span className="text-on-forest-muted">{formatCoordinates(site.latitude, site.longitude)}</span>
        </p>
        <h1 className="max-w-3xl font-display text-[26px] leading-tight font-extrabold sm:text-[34px]">
          {headline(site)}
        </h1>
        <p className="text-base text-on-forest-muted">
          Compared with the usual {usualYears(site)} weather for this place. Data: NASA POWER.
        </p>
        <SiteSwitcher current={site.id} onDark />
      </div>
    </header>
  );
}

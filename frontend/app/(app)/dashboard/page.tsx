import { KpiCard } from "@/components/dashboard/KpiCard";
import { SiteSwitcher } from "@/components/dashboard/SiteSwitcher";
import { PageHeader } from "@/components/layout/PageHeader";
import { StrategyCard } from "@/components/strategies/StrategyCard";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { type ClimateSite, getSite } from "@/lib/data/climate";
import { formatCoordinates, formatYears } from "@/lib/format";
import { kpisFor } from "@/lib/kpis";
import { strategiesFor } from "@/lib/strategies";

const describeYear = ({ name, year, baseline, annual }: ClimateSite) => {
  const warmth =
    Math.abs(annual.temperatureChangeC) < 0.05
      ? "about as warm as"
      : `${Math.abs(annual.temperatureChangeC).toFixed(1)} °C ${annual.temperatureChangeC > 0 ? "warmer" : "cooler"} than`;
  const rain =
    Math.abs(annual.rainfallChangePct) < 2
      ? "about the usual amount of rain"
      : `${Math.round(Math.abs(annual.rainfallChangePct))}% ${annual.rainfallChangePct > 0 ? "more" : "less"} rain`;
  return `${name} was ${warmth} its ${formatYears(baseline.start, baseline.end)} average in ${year}, with ${rain}.`;
};

type DashboardProps = { searchParams: Promise<{ site?: string }> };

export default async function DashboardPage({ searchParams }: DashboardProps) {
  const site = getSite((await searchParams).site);
  const { source } = site;

  return (
    <div className="space-y-6">
      <PageHeader title="Good day" lead={describeYear(site)}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-caption">
            <li>
              {site.name}, {site.region} · {formatCoordinates(site.latitude, site.longitude)} · {site.elevationM} m
            </li>
            <li>
              NASA POWER monthly data, {formatYears(source.firstYear, source.lastYear)} (API {source.apiVersion})
            </li>
          </ul>
          <SiteSwitcher current={site.id} />
        </div>
      </PageHeader>

      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">
          Farm conditions, Jan – Dec {site.year}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpisFor(site).map((kpi) => (
            <KpiCard key={kpi.kind} kpi={kpi} />
          ))}
        </div>
        <p className="mt-3 text-xs text-caption">
          Rainfall is NASA POWER {source.precipitation.parameter} ({source.precipitation.name.toLowerCase()}) in mm/day,
          multiplied by the days in each month. Yearly figures and the{" "}
          {formatYears(site.baseline.start, site.baseline.end)} averages are calculated from the monthly values.
        </p>
      </section>

      <section aria-labelledby="strategies-heading" className="space-y-4">
        <h2 id="strategies-heading" className="font-display text-lg font-bold text-forest">
          Your Crop Rotation Strategies
        </h2>
        <div className="grid gap-4 xl:grid-cols-3">
          {strategiesFor(site).map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} />
          ))}
        </div>
        <Disclaimer />
      </section>
    </div>
  );
}

"use client";

import { HistoryCharts } from "@/components/charts/HistoryCharts";
import { RainfallChart } from "@/components/charts/RainfallChart";
import { TemperatureChart } from "@/components/charts/TemperatureChart";
import { ChevronDown } from "lucide-react";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SiteSwitcher } from "@/components/dashboard/SiteSwitcher";
import { PageHeader } from "@/components/layout/PageHeader";
import { WithSite } from "@/components/layout/WithSite";
import { FarmMap } from "@/components/map/FarmMap";
import { StrategyCards } from "@/components/strategies/StrategyCards";
import { headline, seasonInsights, statusRuleText, usualYears } from "@/lib/climate-facts";
import type { ClimateSite } from "@/lib/data/climate";
import { formatCoordinates, formatYears } from "@/lib/format";
import { kpisFor } from "@/lib/kpis";
import { useStrategies } from "@/lib/use-strategies";

function Footnote({ site }: { site: ClimateSite }) {
  const { annual, source, year } = site;
  return (
    <aside aria-labelledby="footnote-heading" className="space-y-2 border-t border-line pt-4 text-sm text-caption">
      <h3 id="footnote-heading" className="text-base font-semibold text-ink">
        About these numbers
      </h3>
      <ul className="space-y-1.5">
        <li>
          {site.name}, {site.region}: {formatCoordinates(site.latitude, site.longitude)}
          {site.elevationM !== undefined && `, ${site.elevationM} m above sea level`}.
        </li>
        <li>
          {year} average: temperature {annual.temperatureC.toFixed(1)} °C (usual{" "}
          {annual.baselineTemperatureC.toFixed(1)} °C), rain in a year {Math.round(annual.rainfallMm)} mm (usual{" "}
          {Math.round(annual.baselineRainfallMm)} mm).
        </li>
        {statusRuleText().map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
        <li>Grey cards have no data yet. Grey is not a status.</li>
        <li>
          Soil wetness is how wet the root zone was, from the NASA POWER MERRA-2 model, not from a satellite. NASA SMAP
          satellite soil data is still coming.
        </li>
        <li>
          Source: NASA POWER monthly data, {formatYears(source.firstYear, source.lastYear)}.
        </li>
      </ul>
    </aside>
  );
}

function Dashboard({ site }: { site: ClimateSite }) {
  const { crop, data, error } = useStrategies(site);
  return (
    <div className="space-y-8">
      <PageHeader title="Your field at a glance" lead={headline(site)}>
        <p className="text-base text-caption">
          Usual = the {usualYears(site)} average for this place, from NASA POWER.
        </p>
        <div className="pt-2">
          <SiteSwitcher current={site.id} />
        </div>
      </PageHeader>

      <section id="soil" aria-labelledby="year-heading" className="scroll-mt-24 space-y-4">
        <h2 id="year-heading" className="font-display text-xl font-bold text-forest">
          What {site.year} looked like on your field
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpisFor(site, { crop, risk: data?.risk, error }).map((kpi) => (
            <KpiCard key={kpi.kind} kpi={kpi} />
          ))}
        </div>
      </section>

      <section id="climate" aria-labelledby="seasons-heading" className="scroll-mt-24 space-y-4">
        <h2 id="seasons-heading" className="font-display text-xl font-bold text-forest">
          Spring and summer {site.year}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {seasonInsights(site).map((insight) => (
            <InsightCard key={insight.name} insight={insight} />
          ))}
        </div>
      </section>

      <details className="group rounded-card border border-line bg-white">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-2 rounded-card px-4 sm:px-5 [&::-webkit-details-marker]:hidden">
          <span>
            <span id="months-heading" className="block font-display text-lg font-bold text-forest">
              Month by month, and how we worked it out
            </span>
            <span className="block text-base text-caption">Charts for every month since 2001, and the rules behind the colours</span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-6 shrink-0 text-forest transition-transform group-open:rotate-180"
            strokeWidth={1.6}
          />
        </summary>
        <div className="space-y-4 border-t border-line p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <TemperatureChart site={site} />
            <RainfallChart site={site} />
          </div>
          <HistoryCharts site={site} />
          <Footnote site={site} />
        </div>
      </details>

      <section id="plans" aria-labelledby="strategies-heading" className="scroll-mt-24 space-y-4">
        <h2 id="strategies-heading" className="font-display text-xl font-bold text-forest">
          Three ways to plan the next 3 years
        </h2>
        <StrategyCards site={site} />
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <FarmMap />
      <WithSite showStates render={(site) => <Dashboard site={site} />} />
    </div>
  );
}

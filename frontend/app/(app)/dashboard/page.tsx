"use client";

import { HistoryCharts } from "@/components/charts/HistoryCharts";
import { RainfallChart } from "@/components/charts/RainfallChart";
import { TemperatureChart } from "@/components/charts/TemperatureChart";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SiteSwitcher } from "@/components/dashboard/SiteSwitcher";
import { PageHeader } from "@/components/layout/PageHeader";
import { WithSite } from "@/components/layout/WithSite";
import { StrategyCard } from "@/components/strategies/StrategyCard";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { seasonInsights, statusRuleText, usualYears, yearSummary } from "@/lib/climate-facts";
import type { ClimateSite } from "@/lib/data/climate";
import { formatCoordinates, formatYears } from "@/lib/format";
import { kpisFor } from "@/lib/kpis";
import { strategiesAreIllustrative, strategiesFor } from "@/lib/strategies";

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
          Jan–Dec {year}: average temperature {annual.temperatureC.toFixed(1)} °C (usual{" "}
          {annual.baselineTemperatureC.toFixed(1)} °C), total rain {Math.round(annual.rainfallMm)} mm (usual{" "}
          {Math.round(annual.baselineRainfallMm)} mm).
        </li>
        {statusRuleText().map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
        <li>Grey cards have no data yet. Grey is not a status.</li>
        <li>
          Source: NASA POWER monthly data, {formatYears(source.firstYear, source.lastYear)}.
        </li>
      </ul>
    </aside>
  );
}

function Dashboard({ site }: { site: ClimateSite }) {
  return (
    <div className="space-y-8">
      <PageHeader title="Good day" lead={yearSummary(site)}>
        <p className="text-base text-caption">
          Usual = the {usualYears(site)} average for this place, from NASA POWER.
        </p>
        <div className="pt-2">
          <SiteSwitcher current={site.id} />
        </div>
      </PageHeader>

      <section aria-labelledby="year-heading" className="space-y-4">
        <h2 id="year-heading" className="font-display text-xl font-bold text-forest">
          What {site.year} looked like on your field
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpisFor(site).map((kpi) => (
            <KpiCard key={kpi.kind} kpi={kpi} />
          ))}
        </div>
      </section>

      <section aria-labelledby="seasons-heading" className="space-y-4">
        <h2 id="seasons-heading" className="font-display text-xl font-bold text-forest">
          Spring and summer {site.year}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {seasonInsights(site).map((insight) => (
            <InsightCard key={insight.name} insight={insight} />
          ))}
        </div>
      </section>

      <section aria-labelledby="months-heading" className="space-y-4">
        <h2 id="months-heading" className="font-display text-xl font-bold text-forest">
          Month by month
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <TemperatureChart site={site} />
          <RainfallChart site={site} />
        </div>
        <HistoryCharts site={site} />
        <Footnote site={site} />
      </section>

      <section aria-labelledby="strategies-heading" className="space-y-4">
        <h2 id="strategies-heading" className="font-display text-xl font-bold text-forest">
          Three ways to plan the next 3 years
        </h2>
        <div className="grid gap-4 xl:grid-cols-3">
          {strategiesFor(site).map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} illustrative={strategiesAreIllustrative} />
          ))}
        </div>
        <Disclaimer />
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return <WithSite showStates render={(site) => <Dashboard site={site} />} />;
}

"use client";

import { HistoryCharts } from "@/components/charts/HistoryCharts";
import { RainfallChart } from "@/components/charts/RainfallChart";
import { TemperatureChart } from "@/components/charts/TemperatureChart";
import { CalendarRange, ChevronDown, Sprout, Sun } from "lucide-react";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { Footnote } from "@/components/dashboard/Footnote";
import { RecentWeather } from "@/components/dashboard/RecentWeather";
import { SectionTitle } from "@/components/layout/SectionTitle";
import { WithSite } from "@/components/layout/WithSite";
import { FarmMap } from "@/components/map/FarmMap";
import { StrategyCards } from "@/components/strategies/StrategyCards";
import { seasonInsights } from "@/lib/climate-facts";
import type { ClimateSite } from "@/lib/data/climate";
import { kpisFor } from "@/lib/kpis";
import { useStrategies } from "@/lib/use-strategies";

function Dashboard({ site }: { site: ClimateSite }) {
  const { crop, data, error } = useStrategies(site);
  return (
    <div className="space-y-8">
      <DashboardHero site={site} />

      <RecentWeather site={site} />

      <section id="soil" aria-labelledby="year-heading" className="scroll-mt-24 space-y-4">
        <SectionTitle id="year-heading" icon={CalendarRange}>
          {`Your field in ${site.year}`}
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpisFor(site, { crop, risk: data?.risk, error }).map((kpi) => (
            <KpiCard key={kpi.kind} kpi={kpi} />
          ))}
        </div>
      </section>

      <section id="climate" aria-labelledby="seasons-heading" className="scroll-mt-24 space-y-4">
        <SectionTitle id="seasons-heading" icon={Sun}>
          {`Spring and summer rain, ${site.year}`}
        </SectionTitle>
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
        <SectionTitle id="strategies-heading" icon={Sprout}>
          3 plans for the next 3 years
        </SectionTitle>
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

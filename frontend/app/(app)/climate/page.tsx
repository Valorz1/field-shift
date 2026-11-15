"use client";

import { CalendarDays, ChevronDown, History, Sun, Thermometer } from "lucide-react";
import { HistoryCharts } from "@/components/charts/HistoryCharts";
import { RainfallChart } from "@/components/charts/RainfallChart";
import { TemperatureChart } from "@/components/charts/TemperatureChart";
import { Footnote } from "@/components/dashboard/Footnote";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RecentWeather } from "@/components/dashboard/RecentWeather";
import { SeasonalRain } from "@/components/dashboard/SeasonalRain";
import { Page } from "@/components/layout/Page";
import { PageIntro } from "@/components/layout/PageIntro";
import { SectionTitle } from "@/components/layout/SectionTitle";
import { WithSite } from "@/components/layout/WithSite";
import { headline } from "@/lib/climate-facts";
import type { ClimateSite } from "@/lib/data/climate";
import { kpisFor } from "@/lib/kpis";

function Climate({ site }: { site: ClimateSite }) {
  // Temperature and yearly rain only; soil and risk have their own pages.
  const kpis = kpisFor(site, { crop: "" }).filter((kpi) => kpi.kind === "temperature" || kpi.kind === "rain");
  return (
    <Page>
      <PageIntro icon={Thermometer} title="Climate" lead={headline(site)} />

      <RecentWeather site={site} />

      <section aria-labelledby="climate-year" className="space-y-4">
        <SectionTitle id="climate-year" icon={CalendarDays}>
          {`The whole year, ${site.year}`}
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {kpis.map((kpi, i) => (
            <KpiCard key={kpi.kind} kpi={kpi} index={i} />
          ))}
        </div>
      </section>

      <section aria-labelledby="climate-seasons" className="space-y-4">
        <SectionTitle id="climate-seasons" icon={Sun}>
          {`Spring and summer rain, ${site.year}`}
        </SectionTitle>
        <SeasonalRain site={site} />
      </section>

      <section aria-labelledby="climate-months" className="space-y-4">
        <SectionTitle id="climate-months" icon={CalendarDays}>
          Month by month
        </SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
          <TemperatureChart site={site} />
          <RainfallChart site={site} />
        </div>
      </section>

      <details className="group rounded-card border border-line bg-white">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-card px-4 sm:px-5 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-3">
            <History aria-hidden="true" className="size-5 text-forest" strokeWidth={1.8} />
            <span>
              <span id="climate-history" className="block font-display text-lg font-bold text-forest">
                Every month since 2001, and how we worked it out
              </span>
              <span className="block text-base text-caption">25 years of NASA data, and the rules behind the colours</span>
            </span>
          </span>
          <ChevronDown aria-hidden="true" className="size-6 shrink-0 text-forest transition-transform group-open:rotate-180" strokeWidth={1.6} />
        </summary>
        <div className="space-y-4 border-t border-line p-4 sm:p-5">
          <HistoryCharts site={site} />
          <Footnote site={site} />
        </div>
      </details>
    </Page>
  );
}

export default function ClimatePage() {
  return <WithSite showStates render={(site) => <Climate site={site} />} />;
}

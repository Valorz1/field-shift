"use client";

import { CalendarDays, History, Sun, Thermometer } from "lucide-react";
import { HistoryCharts } from "@/components/charts/HistoryCharts";
import { RainfallChart } from "@/components/charts/RainfallChart";
import { TemperatureChart } from "@/components/charts/TemperatureChart";
import { Footnote } from "@/components/dashboard/Footnote";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RecentWeather } from "@/components/dashboard/RecentWeather";
import { PageIntro } from "@/components/layout/PageIntro";
import { SectionTitle } from "@/components/layout/SectionTitle";
import { WithSite } from "@/components/layout/WithSite";
import { headline, seasonInsights } from "@/lib/climate-facts";
import type { ClimateSite } from "@/lib/data/climate";
import { kpisFor } from "@/lib/kpis";

function Climate({ site }: { site: ClimateSite }) {
  // Temperature and yearly rain only; soil and risk have their own pages.
  const kpis = kpisFor(site, { crop: "" }).filter((kpi) => kpi.kind === "temperature" || kpi.kind === "rain");
  return (
    <div className="space-y-8">
      <PageIntro icon={Thermometer} title="Climate" lead={headline(site)} site={site.id} />

      <RecentWeather site={site} />

      <section aria-labelledby="climate-year" className="space-y-4">
        <SectionTitle id="climate-year" icon={CalendarDays}>
          {`The whole year, ${site.year}`}
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.kind} kpi={kpi} />
          ))}
        </div>
      </section>

      <section aria-labelledby="climate-seasons" className="space-y-4">
        <SectionTitle id="climate-seasons" icon={Sun}>
          {`Spring and summer rain, ${site.year}`}
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {seasonInsights(site).map((insight) => (
            <InsightCard key={insight.name} insight={insight} />
          ))}
        </div>
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

      <section aria-labelledby="climate-history" className="space-y-4">
        <SectionTitle id="climate-history" icon={History}>
          Every month since 2001
        </SectionTitle>
        <HistoryCharts site={site} />
        <Footnote site={site} />
      </section>
    </div>
  );
}

export default function ClimatePage() {
  return <WithSite showStates render={(site) => <Climate site={site} />} />;
}

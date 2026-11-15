"use client";

import { CalendarRange, ChevronDown, MessageCircle, Sun } from "lucide-react";
import { Suspense } from "react";
import { HistoryCharts } from "@/components/charts/HistoryCharts";
import { RainfallChart } from "@/components/charts/RainfallChart";
import { TemperatureChart } from "@/components/charts/TemperatureChart";
import { AssistantPanel } from "@/components/dashboard/AssistantPanel";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { FieldHero } from "@/components/dashboard/FieldHero";
import { Footnote } from "@/components/dashboard/Footnote";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RecentWeather } from "@/components/dashboard/RecentWeather";
import { SeasonalRain } from "@/components/dashboard/SeasonalRain";
import { FarmProfileCard } from "@/components/farm/FarmProfileCard";
import { FieldRisks } from "@/components/dashboard/FieldRisks";
import { Page } from "@/components/layout/Page";
import { SectionTitle } from "@/components/layout/SectionTitle";
import { WithSite } from "@/components/layout/WithSite";
import { PlanStrips } from "@/components/strategies/PlanStrips";
import type { ClimateSite } from "@/lib/data/climate";
import { kpisFor } from "@/lib/kpis";
import { useStrategies } from "@/lib/use-strategies";

// Top to bottom: the answer first (banner), then what to do (3 plans), then the evidence, then the chat.
function Dashboard({ site }: { site: ClimateSite }) {
  const { crop, data, error } = useStrategies(site);
  return (
    <div className="space-y-8">
      <DashboardHero site={site} />

      <FarmProfileCard />

      <PlanStrips site={site} />

      <RecentWeather site={site} />

      <FieldRisks site={site} />

      <section id="soil" aria-labelledby="year-heading" className="scroll-mt-24 space-y-4">
        <SectionTitle id="year-heading" icon={CalendarRange}>
          {`Your field in ${site.year}`}
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpisFor(site, { crop, risk: data?.risk, error }).map((kpi, i) => (
            <KpiCard key={kpi.kind} kpi={kpi} index={i} />
          ))}
        </div>
      </section>

      <section id="climate" aria-labelledby="seasons-heading" className="scroll-mt-24 space-y-4">
        <SectionTitle id="seasons-heading" icon={Sun}>
          {`Spring and summer rain, ${site.year}`}
        </SectionTitle>
        <SeasonalRain site={site} />
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

      <section id="assistant" aria-labelledby="assistant-heading" className="scroll-mt-24 space-y-4">
        <SectionTitle id="assistant-heading" icon={MessageCircle}>
          Ask about your field
        </SectionTitle>
        <AssistantPanel site={site} crop={crop} />
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Page>
      <Suspense fallback={null}>
        <FieldHero />
      </Suspense>
      <WithSite showStates render={(site) => <Dashboard site={site} />} />
    </Page>
  );
}

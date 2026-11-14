"use client";

import { Sprout } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { WithSite } from "@/components/layout/WithSite";
import { ComparisonTable } from "@/components/strategies/ComparisonTable";
import { StrategyCards } from "@/components/strategies/StrategyCards";
import type { ClimateSite } from "@/lib/data/climate";

function Plans({ site }: { site: ClimateSite }) {
  return (
    <div className="space-y-8">
      <PageIntro
        icon={Sprout}
        title="Crop plans"
        lead="3 ways to plan the next 3 years on your field. Each one is built from NASA climate data and published farming guidance. You choose."
        site={site.id}
      />
      <section aria-label="The 3 plans" className="space-y-4">
        <StrategyCards site={site} />
      </section>
      <ComparisonTable site={site} />
    </div>
  );
}

export default function StrategiesPage() {
  return <WithSite showStates render={(site) => <Plans site={site} />} />;
}

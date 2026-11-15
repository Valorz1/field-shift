"use client";

import { Columns3, Sprout } from "lucide-react";
import { CropPicker } from "@/components/farm/CropPicker";
import { FarmProfileCard } from "@/components/farm/FarmProfileCard";
import { OutsideUkNote } from "@/components/farm/OutsideUkNote";
import { Page } from "@/components/layout/Page";
import { PageIntro } from "@/components/layout/PageIntro";
import { WithSite } from "@/components/layout/WithSite";
import { StrategyCards } from "@/components/strategies/StrategyCards";
import { ButtonLink } from "@/components/ui/Button";
import type { ClimateSite } from "@/lib/data/climate";
import { farmHref } from "@/lib/navigation";

function Plans({ site }: { site: ClimateSite }) {
  return (
    <Page>
      <PageIntro
        icon={Sprout}
        title="Strategies"
        lead="3 ways to plan the next 3 years on your field. Each one is built from NASA climate data and published farming guidance. You choose."
        actions={
          <ButtonLink href={farmHref("/compare", site)} variant="secondary">
            <Columns3 aria-hidden="true" className="size-5" strokeWidth={1.7} />
            Compare side by side
          </ButtonLink>
        }
      />
      <section aria-label="The 3 plans" className="space-y-4">
        <OutsideUkNote site={site} />
        <CropPicker site={site} />
        <FarmProfileCard compact />
        <StrategyCards site={site} showPicker={false} />
      </section>
    </Page>
  );
}

export default function StrategiesPage() {
  return <WithSite showStates render={(site) => <Plans site={site} />} />;
}

"use client";

import { Columns3, Sprout } from "lucide-react";
import { CropPicker } from "@/components/farm/CropPicker";
import { OutsideUkNote } from "@/components/farm/OutsideUkNote";
import { Page } from "@/components/layout/Page";
import { PageIntro } from "@/components/layout/PageIntro";
import { WithSite } from "@/components/layout/WithSite";
import { ComparisonTable } from "@/components/strategies/ComparisonTable";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/states/ErrorMessage";
import { LoadingSkeleton } from "@/components/ui/states/LoadingSkeleton";
import type { ClimateSite } from "@/lib/data/climate";
import { farmHref } from "@/lib/navigation";
import { useStrategies } from "@/lib/use-strategies";

// The same 3 plans as the Strategies page, one thing per row.
function Compare({ site }: { site: ClimateSite }) {
  const { crop, data, error, retry } = useStrategies(site);
  return (
    <Page>
      <PageIntro
        icon={Columns3}
        title="Compare"
        lead="The 3 plans side by side: what you would grow, what each one aims for, and what to watch."
        actions={
          <ButtonLink href={farmHref("/strategies", site)} variant="secondary">
            <Sprout aria-hidden="true" className="size-5" strokeWidth={1.7} />
            See each plan in full
          </ButtonLink>
        }
      />
      <OutsideUkNote site={site} />
      <CropPicker site={site} />
      {error ? (
        <ErrorMessage message={error} onRetry={retry} />
      ) : !crop ? (
        <Card>
          <p className="text-base text-ink">Choose the crop you grow above to compare the 3 plans.</p>
        </Card>
      ) : !data ? (
        <LoadingSkeleton label="Working out the 3 plans" lines={6} />
      ) : (
        <ComparisonTable site={site} />
      )}
    </Page>
  );
}

export default function ComparePage() {
  return <WithSite showStates render={(site) => <Compare site={site} />} />;
}

"use client";

import { CalendarDays, Droplets, Layers, Satellite, Sprout } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Page } from "@/components/layout/Page";
import { PageIntro } from "@/components/layout/PageIntro";
import { SectionTitle } from "@/components/layout/SectionTitle";
import { WithSite } from "@/components/layout/WithSite";
import { SmapCheck } from "@/components/soil/SmapCheck";
import { SoilChart } from "@/components/soil/SoilChart";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { soilMeaning, soilPercents } from "@/lib/climate-facts";
import type { ClimateSite } from "@/lib/data/climate";
import { kpisFor } from "@/lib/kpis";
import { farmHref } from "@/lib/navigation";

function PlansLink() {
  const site = useSearchParams().get("site");
  return (
    <ButtonLink href={`/strategies${site ? `?site=${encodeURIComponent(site)}` : ""}`} variant="secondary">
      <Sprout aria-hidden="true" className="size-5" strokeWidth={1.8} />
      See the soil plan (Option 3)
    </ButtonLink>
  );
}

function Soil({ site }: { site: ClimateSite }) {
  const soil = soilPercents(site);
  const kpi = kpisFor(site, { crop: "" }).find((k) => k.kind === "soil-wetness")!;
  return (
    <Page>
      <PageIntro
        icon={Layers}
        title="Soil Intelligence"
        lead={soil ? soilMeaning(soil) : "NASA POWER has no soil wetness for this place."}
      />

      <section aria-labelledby="soil-now" className="space-y-4">
        <SectionTitle id="soil-now" icon={Droplets}>
          {`How wet your soil was, ${site.year}`}
        </SectionTitle>
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <KpiCard kpi={kpi} />
          <Card className="space-y-3">
            <h3 className="font-display text-lg font-bold text-forest">What the number means</h3>
            {soil && (
              <div className="space-y-1.5" aria-hidden="true">
                <div className="relative h-4 rounded-full bg-[linear-gradient(90deg,#d8c9a9_0%,#77a86b_50%,#3e82b7_100%)]">
                  <span
                    className="absolute -top-1.5 size-7 -translate-x-1/2 rounded-full border-4 border-white bg-forest shadow"
                    style={{ left: `${soil.recent}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-caption">
                  <span>0% bone dry</span>
                  <span>100% soaked</span>
                </div>
              </div>
            )}
            <p className="text-base text-caption">
              This is the water in the top metre of soil, where most crop roots are. Wetter soil helps crops through dry
              spells; very wet soil can delay field work.
            </p>
          </Card>
        </div>
      </section>

      <section aria-labelledby="soil-months" className="space-y-4">
        <SectionTitle id="soil-months" icon={CalendarDays}>
          Month by month
        </SectionTitle>
        <div className="max-w-2xl">
          <SoilChart site={site} />
        </div>
      </section>

      {site.smap && (
        <section aria-labelledby="soil-satellite" className="space-y-4">
          <SectionTitle id="soil-satellite" icon={Satellite}>
            Checked from space
          </SectionTitle>
          <SmapCheck site={site} />
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {!site.smap && (
          <Card className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-forest">
              <Satellite aria-hidden="true" className="size-5" strokeWidth={1.8} />
              {site.id === "nevada" ? "Checked from space: no usable readings" : "No satellite check for this field"}
            </h3>
            {site.id === "nevada" ? (
              // backend/app/services/smap.py --csv on the AppEEARS point sample, 2016-2025.
              <p className="text-base text-caption">
                We asked NASA for 10 years of SMAP satellite soil moisture here (2016–2025). SMAP got a reading on 1,492 of
                3,571 days, but NASA marked none of them as recommended quality for this spot. So we do not use them, and
                the numbers on this page come from NASA&apos;s weather model only.
              </p>
            ) : (
              <p className="text-base text-caption">
                These numbers come from a NASA weather model. NASA&apos;s SMAP satellite also measures soil moisture from
                space, but we download it farm by farm, so it is only ready for the Norfolk example farm.
              </p>
            )}
            <Link href={farmHref("/guide", site)} className="text-base font-semibold text-primary underline underline-offset-2">
              Satellite, model and ground data: what is the difference?
            </Link>
          </Card>
        )}
        <Card className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-forest">
            <Sprout aria-hidden="true" className="size-5" strokeWidth={1.8} />
            Help your soil
          </h3>
          <p className="text-base text-caption">
            Cover crops protect bare soil between crops, and legumes add nitrogen. Option 3 in your crop plans shows how
            to fit them in.
          </p>
          <div className="mt-auto">
            <PlansLink />
          </div>
        </Card>
      </div>
    </Page>
  );
}

export default function SoilPage() {
  return <WithSite showStates render={(site) => <Soil site={site} />} />;
}

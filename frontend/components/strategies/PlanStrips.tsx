"use client";

import { ArrowRight, Sprout } from "lucide-react";
import Link from "next/link";
import { SectionTitle } from "@/components/layout/SectionTitle";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { ErrorMessage } from "@/components/ui/states/ErrorMessage";
import { LoadingSkeleton } from "@/components/ui/states/LoadingSkeleton";
import { riskLevelText, riskReason } from "@/lib/climate-facts";
import type { Place } from "@/lib/data/climate";
import { bestMatch, planFit, placeText } from "@/lib/farm-profile";
import { farmHref } from "@/lib/navigation";
import { useSession } from "@/lib/session-store";
import { useStrategies } from "@/lib/use-strategies";
import { BestMatchBadge, PlanFitList } from "./PlanFit";
import { aimWatch, changeLabels, kindLabel, shortTitle, YearTiles } from "./StrategyCard";

// The 3 plans in short, so they can be compared at a glance. The full plans, with the evidence, are on Strategies.
export function PlanStrips({ site }: { site: Place }) {
  const { crop, data, error, retry } = useStrategies(site);
  const plansHref = farmHref("/strategies", site);
  const profile = useSession().profile;
  const best = data ? bestMatch(data.strategies, profile, data.risk) : undefined;

  return (
    <section id="plans" aria-labelledby="plans-heading" className="scroll-mt-24 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <SectionTitle id="plans-heading" icon={Sprout}>
            3 plans for the next 3 years
          </SectionTitle>
          {data && (
            <p className="max-w-3xl text-base text-caption">
              Worked out for {data.farm.crop} {placeText(data.farm.name ?? site.name)}.{" "}
              {data.risk.level === "unknown"
                ? "Climate risk: not known."
                : `Climate risk: ${riskLevelText(data.risk.level)}. ${riskReason(data.risk)}`}
            </p>
          )}
        </div>
        <Link
          href={plansHref}
          className="fs-press inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-base font-semibold text-forest transition-colors hover:border-sage hover:bg-green-tint"
        >
          See the full plans
          <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
        </Link>
      </div>

      {data ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            {data.strategies.map((strategy, i) => (
              <Link
                key={strategy.id}
                href={plansHref}
                className="fs-rise fs-lift group flex min-w-0 flex-col gap-3 rounded-card border border-line bg-white p-4"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold tracking-wide text-caption uppercase">
                    Option {strategy.position} · {kindLabel(strategy)}
                  </p>
                  <h3 className="font-display text-lg leading-tight font-extrabold text-forest">{shortTitle(strategy)}</h3>
                </div>
                {best === strategy.id && (
                  <div>
                    <BestMatchBadge />
                  </div>
                )}
                <YearTiles strategy={strategy} compact />
                <p className="line-clamp-2 text-base text-ink">{aimWatch(strategy).aim}</p>
                <PlanFitList fit={planFit(strategy, profile, data.risk)} profile={profile} limit={2} />
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
                  <span className="inline-flex items-center gap-1 text-base font-semibold text-forest group-hover:underline">
                    View the plan
                    <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
                  </span>
                  <span className="rounded-full bg-page px-2.5 py-1 text-sm font-semibold text-caption">
                    {changeLabels[strategy.complexity]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <Disclaimer text={data.disclaimer} />
        </>
      ) : error ? (
        <ErrorMessage message={error} onRetry={retry} />
      ) : !crop ? (
        <p className="rounded-inner border border-line bg-white p-4 text-base text-ink">
          Tap your crop above to see your 3 plans.
        </p>
      ) : (
        <LoadingSkeleton label="Working out your 3 plans" lines={5} />
      )}
    </section>
  );
}

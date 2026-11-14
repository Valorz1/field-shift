"use client";

import { Disclaimer } from "@/components/ui/Disclaimer";
import { EmptyState } from "@/components/ui/states/EmptyState";
import { ErrorMessage } from "@/components/ui/states/ErrorMessage";
import { LoadingSkeleton } from "@/components/ui/states/LoadingSkeleton";
import { getDemoStrategies, getLiveStrategies } from "@/lib/api";
import { type Place, isPin } from "@/lib/data/climate";
import { useSession } from "@/lib/session-store";
import type { Risk } from "@/lib/types";
import { useLoaded } from "@/lib/use-loaded";
import { StrategyCard } from "./StrategyCard";

const riskText = ({ level, drivers }: Risk) => {
  const reasons = [drivers.warming.triggered && "warmer", drivers.drying.triggered && "drier"].filter(Boolean);
  return `Climate risk: ${level}${reasons.length ? ` (recent years were ${reasons.join(" and ")})` : ""}.`;
};

export function StrategyCards({ site }: { site: Place }) {
  const crop = useSession().crop?.trim();
  const pin = isPin(site);
  // A pinned place needs the farmer's crop; the demo farms come with one.
  const key = pin ? (crop ? `strategies:${site.id}:${crop}` : null) : `strategies:${site.id}`;
  const { data, error, retry } = useLoaded(key, () =>
    pin ? getLiveStrategies(site.latitude, site.longitude, crop!) : getDemoStrategies(site.id),
  );

  return (
    <>
      {data ? (
        <>
          <p className="text-base text-caption">
            Worked out for {data.farm.crop} at {data.farm.name ?? site.name}. {riskText(data.risk)}
          </p>
          <div className="grid gap-4 xl:grid-cols-3">
            {data.strategies.map((strategy) => (
              <StrategyCard key={strategy.id} strategy={strategy} />
            ))}
          </div>
        </>
      ) : error ? (
        <ErrorMessage message={error} onRetry={retry} />
      ) : key === null ? (
        <EmptyState message="Tell us which crop you grow to see strategies for this spot." />
      ) : (
        <LoadingSkeleton label="Working out strategies" lines={6} />
      )}
      <Disclaimer text={data?.disclaimer} />
    </>
  );
}

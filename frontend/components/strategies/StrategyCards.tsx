"use client";

import { Button } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { EmptyState } from "@/components/ui/states/EmptyState";
import { ErrorMessage } from "@/components/ui/states/ErrorMessage";
import { LoadingSkeleton } from "@/components/ui/states/LoadingSkeleton";
import { getDemoStrategies, getLiveStrategies } from "@/lib/api";
import { type Place, isPin } from "@/lib/data/climate";
import { updateSession, useSession } from "@/lib/session-store";
import type { Risk } from "@/lib/types";
import { useLoaded } from "@/lib/use-loaded";
import { StrategyCard } from "./StrategyCard";

// Crops the strategy engine has rules for. Any other name still works, with general rules only.
const CROPS = ["wheat", "barley", "oilseed rape", "field beans", "oats", "maize", "alfalfa", "sorghum"];
// What each demo farm grows (the backend's own defaults).
const DEMO_CROPS: Record<string, string> = { norfolk: "wheat", nevada: "alfalfa" };
const OTHER = "other";
const control = "min-h-12 rounded-control border border-line bg-white px-3 text-base font-normal text-ink";

const riskText = ({ level, drivers }: Risk) => {
  const reasons = [drivers.warming.triggered && "warmer", drivers.drying.triggered && "drier"].filter(Boolean);
  return `Climate risk: ${level}${reasons.length ? ` (recent years were ${reasons.join(" and ")})` : ""}.`;
};

export function StrategyCards({ site }: { site: Place }) {
  // Session crop: undefined = not chosen yet, "" = "Other" chosen but nothing typed yet.
  const chosen = useSession().crop;
  const crop = (chosen ?? DEMO_CROPS[site.id] ?? "").trim();
  const other = chosen !== undefined && !CROPS.includes(chosen);
  const pin = isPin(site);
  const { data, error, retry } = useLoaded(crop ? `strategies:${site.id}:${crop}` : null, () =>
    pin ? getLiveStrategies(site.latitude, site.longitude, crop) : getDemoStrategies(site.id, crop),
  );

  return (
    <>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-base font-semibold text-ink">
          What do you grow now?
          <select
            className={control}
            value={other ? OTHER : crop}
            onChange={(event) => updateSession({ crop: event.target.value === OTHER ? "" : event.target.value })}
          >
            {!crop && !other && <option value="">Choose your crop</option>}
            {CROPS.map((name) => (
              <option key={name} value={name}>
                {name[0].toUpperCase() + name.slice(1)}
              </option>
            ))}
            <option value={OTHER}>Other</option>
          </select>
        </label>
        {other && (
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              updateSession({ crop: String(new FormData(event.currentTarget).get("crop")).trim() });
            }}
          >
            <label className="flex flex-col gap-1 text-base font-semibold text-ink">
              Your crop
              <input name="crop" required defaultValue={chosen} className={control} />
            </label>
            <Button type="submit" variant="secondary">
              Show strategies
            </Button>
          </form>
        )}
      </div>
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
      ) : !crop ? (
        <EmptyState message="Choose the crop you grow to see strategies for this spot." />
      ) : (
        <LoadingSkeleton label="Working out strategies" lines={6} />
      )}
      <Disclaimer text={data?.disclaimer} />
    </>
  );
}

"use client";

import { CROPS } from "@/components/farm/CropPicker";
import { Button } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { EmptyState } from "@/components/ui/states/EmptyState";
import { ErrorMessage } from "@/components/ui/states/ErrorMessage";
import { LoadingSkeleton } from "@/components/ui/states/LoadingSkeleton";
import { riskLevelText, riskReason } from "@/lib/climate-facts";
import type { Place } from "@/lib/data/climate";
import { bestMatch, planFit } from "@/lib/farm-profile";
import { updateSession, useSession } from "@/lib/session-store";
import type { Risk } from "@/lib/types";
import { useStrategies } from "@/lib/use-strategies";
import { StrategyCard } from "./StrategyCard";

const OTHER = "other";
const control =
  "min-h-12 rounded-control border border-line bg-white px-3 text-base font-normal text-ink";

const riskText = (risk: Risk) =>
  risk.level === "unknown"
    ? "Climate risk: not known."
    : `Climate risk: ${riskLevelText(risk.level)}. ${riskReason(risk)}`;

// showPicker = false when the page already has the big crop buttons (the dashboard).
export function StrategyCards({
  site,
  showPicker = true,
}: {
  site: Place;
  showPicker?: boolean;
}) {
  const { chosen, crop, data, error, retry } = useStrategies(site);
  const other = chosen !== undefined && !CROPS.includes(chosen);
  const profile = useSession().profile;
  const best = data ? bestMatch(data.strategies, profile, data.risk) : undefined;

  return (
    <>
      {showPicker && (
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-base font-semibold text-ink">
            What do you grow now?
            <select
              className={control}
              value={other ? OTHER : crop}
              onChange={(event) =>
                updateSession({
                  crop: event.target.value === OTHER ? "" : event.target.value,
                })
              }
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
                updateSession({
                  crop: String(
                    new FormData(event.currentTarget).get("crop"),
                  ).trim(),
                });
              }}
            >
              <label className="flex flex-col gap-1 text-base font-semibold text-ink">
                Your crop
                <input
                  name="crop"
                  required
                  defaultValue={chosen}
                  className={control}
                />
              </label>
              <Button type="submit" variant="secondary">
                Show strategies
              </Button>
            </form>
          )}
        </div>
      )}
      {data ? (
        <>
          <p className="text-base text-caption">
            Worked out for {data.farm.crop} at {data.farm.name ?? site.name}.{" "}
            {riskText(data.risk)}
          </p>
          <div className="grid gap-4 xl:grid-cols-3">
            {data.strategies.map((strategy, i) => (
              <div key={strategy.id} className="fs-rise h-full" style={{ animationDelay: `${i * 80}ms` }}>
                <StrategyCard
                  strategy={strategy}
                  fit={planFit(strategy, profile, data.risk)}
                  profile={profile}
                  best={best === strategy.id}
                />
              </div>
            ))}
          </div>
        </>
      ) : error ? (
        <ErrorMessage message={error} onRetry={retry} />
      ) : !crop ? (
        <EmptyState
          message={
            showPicker
              ? "Choose the crop you grow to see strategies for this spot."
              : "Tap your crop near the top of the page to see your 3 plans."
          }
        />
      ) : (
        <LoadingSkeleton label="Working out strategies" lines={6} />
      )}
      <Disclaimer text={data?.disclaimer} />
    </>
  );
}

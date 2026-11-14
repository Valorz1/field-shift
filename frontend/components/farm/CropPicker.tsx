"use client";

import { Check, Sprout } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";
import type { Place } from "@/lib/data/climate";
import { updateSession } from "@/lib/session-store";
import { useStrategies } from "@/lib/use-strategies";

// Crops the strategy engine has rules for. Any other name still works, with general rules only.
export const CROPS = ["wheat", "barley", "oilseed rape", "field beans", "oats", "maize", "alfalfa", "sorghum"];

const label = (name: string) => name[0].toUpperCase() + name.slice(1);

// Step 2, right under the map: big buttons, one tap. The choice is kept in session memory only.
export function CropPicker({ site }: { site: Place }) {
  const { chosen, crop } = useStrategies(site);
  const other = chosen !== undefined && !CROPS.includes(chosen);
  const [typing, setTyping] = useState(other);
  const missing = !crop && !typing;

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("crop")).trim();
    if (value) updateSession({ crop: value });
  };

  return (
    <section
      aria-labelledby="crop-heading"
      className={cx(
        "fs-rise space-y-3 rounded-card border bg-white p-4 sm:p-5",
        missing ? "border-warning ring-2 ring-warning/40" : "border-line",
      )}
    >
      <h2 id="crop-heading" className="flex items-center gap-2 font-display text-lg font-bold text-forest">
        <Sprout aria-hidden="true" className="size-5" strokeWidth={1.8} />
        What do you grow on this field?
      </h2>
      {missing && <p className="text-base text-ink">Tap your crop to see the climate risk and your 3 plans.</p>}
      <ul className="flex flex-wrap gap-2">
        {CROPS.map((name) => {
          const active = crop === name && !typing;
          return (
            <li key={name}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setTyping(false);
                  updateSession({ crop: name });
                }}
                className={cx(
                  "fs-press inline-flex min-h-12 items-center gap-1.5 rounded-full border px-4 text-base font-semibold transition-colors",
                  active ? "border-forest bg-forest text-white" : "border-line bg-white text-forest hover:border-sage hover:bg-green-tint",
                )}
              >
                {active && <Check aria-hidden="true" className="size-4" strokeWidth={2.4} />}
                {label(name)}
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            aria-pressed={typing}
            onClick={() => setTyping(true)}
            className={cx(
              "inline-flex min-h-12 items-center rounded-full border px-4 text-base font-semibold transition-colors",
              typing ? "border-forest bg-forest text-white" : "border-line bg-white text-forest hover:border-sage hover:bg-green-tint",
            )}
          >
            Something else
          </button>
        </li>
      </ul>
      {typing && (
        <form onSubmit={save} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-base font-semibold text-ink">
            Your crop
            <input
              name="crop"
              required
              defaultValue={other ? chosen : ""}
              placeholder="For example potatoes"
              className="min-h-12 rounded-control border border-line bg-white px-3 text-base font-normal text-ink"
            />
          </label>
          <Button type="submit" variant="secondary">
            Show my plans
          </Button>
        </form>
      )}
    </section>
  );
}

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
// variant "plain": just the buttons, for a card that already has its own heading (the dashboard field card).
export function CropPicker({ site, variant = "card" }: { site: Place; variant?: "card" | "plain" }) {
  const { chosen, crop } = useStrategies(site);
  const other = chosen !== undefined && !CROPS.includes(chosen);
  const [typing, setTyping] = useState(other);
  const missing = !crop && !typing;

  const [invalid, setInvalid] = useState(false);
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("crop")).trim().replace(/\s+/g, " ");
    // A crop name: letters (any language), spaces, hyphens and apostrophes, up to 40 characters.
    const ok = /^\p{L}[\p{L} '’-]{0,39}$/u.test(value);
    setInvalid(!ok);
    if (ok) updateSession({ crop: value });
  };

  const plain = variant === "plain";
  return (
    <section
      aria-labelledby="crop-heading"
      className={cx(
        plain ? "space-y-3" : "fs-rise space-y-3 rounded-card border bg-white p-4 sm:p-5",
        !plain && (missing ? "border-warning ring-2 ring-warning/40" : "border-line"),
      )}
    >
      <h2
        id="crop-heading"
        className={cx(
          "flex items-center gap-2 font-display font-bold text-forest",
          plain ? "text-sm tracking-wide text-caption uppercase" : "text-lg",
        )}
      >
        <Sprout aria-hidden="true" className={plain ? "size-4" : "size-5"} strokeWidth={1.8} />
        {plain ? "Crop on this field" : "What do you grow on this field?"}
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
              maxLength={40}
              aria-invalid={invalid}
              aria-describedby={invalid ? "crop-error" : undefined}
              onChange={() => invalid && setInvalid(false)}
              className="min-h-12 rounded-control border border-line bg-white px-3 text-base font-normal text-ink"
            />
            {invalid && (
              <span id="crop-error" role="alert" className="text-sm font-normal text-danger-ink">
                Type a crop name using letters only, up to 40 characters.
              </span>
            )}
          </label>
          <Button type="submit" variant="secondary">
            Show my plans
          </Button>
        </form>
      )}
    </section>
  );
}

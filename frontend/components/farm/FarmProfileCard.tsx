"use client";

import { Check, ClipboardCheck, RotateCcw } from "lucide-react";
import { useId, useState } from "react";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { cx } from "@/lib/cx";
import { hasProfile, KIT_OPTIONS, MARKET_OPTIONS, PRIORITIES, SOIL_OPTIONS, WATER_OPTIONS } from "@/lib/farm-profile";
import { type FarmProfile, type Priority, updateProfile, updateSession, useSession } from "@/lib/session-store";

const chip = (active: boolean) =>
  cx(
    "fs-press inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-base font-semibold transition-colors",
    active ? "border-forest bg-forest text-white" : "border-line bg-white text-forest hover:border-sage hover:bg-green-tint",
  );

// One question with one answer, as a row of buttons. Tapping the chosen answer again clears it.
function Choice<T extends string>({
  question,
  options,
  value,
  onChange,
}: {
  question: string;
  options: { id: T; label: string; hint?: string }[];
  value?: T;
  onChange: (value: T | undefined) => void;
}) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id} className="space-y-2">
      <p id={id} className="text-base font-semibold text-ink">
        {question}
      </p>
      <ul className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.id;
          return (
            <li key={option.id}>
              <button
                type="button"
                aria-pressed={active}
                title={option.hint}
                onClick={() => onChange(active ? undefined : option.id)}
                className={chip(active)}
              >
                {active && <Check aria-hidden="true" className="size-4" strokeWidth={2.4} />}
                {option.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// "About your farm": the farmer's priorities, water, kit, market and soil. The 3 plans use these answers
// to show what fits and what to check. Kept in memory only, like the rest of the session.
export function FarmProfileCard({ compact = false }: { compact?: boolean }) {
  const profile: FarmProfile = useSession().profile ?? {};
  const priorities = profile.priorities ?? [];
  const [open, setOpen] = useState(!compact || !hasProfile(profile));
  const omId = useId();

  const toggle = (priority: Priority) =>
    updateProfile({
      priorities: priorities.includes(priority) ? priorities.filter((p) => p !== priority) : [...priorities, priority],
    });

  const summary = [
    ...priorities.map((p) => PRIORITIES.find((entry) => entry.id === p)?.label),
    WATER_OPTIONS.find((o) => o.id === profile.water)?.label,
    profile.soilType && profile.soilType !== "unsure" ? SOIL_OPTIONS.find((o) => o.id === profile.soilType)?.label : undefined,
  ].filter(Boolean);

  return (
    <section id="farm" aria-labelledby="farm-heading" className="fs-rise scroll-mt-24 space-y-4 rounded-card border border-line bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 id="farm-heading" className="flex items-center gap-2 font-display text-lg font-bold text-forest">
            <ClipboardCheck aria-hidden="true" className="size-5" strokeWidth={1.8} />
            About your farm
          </h2>
          <p className="max-w-3xl text-base text-caption">
            You know your farm best. Tell us what matters and what you have, and each plan shows what fits and what to check
            first. Skip anything you like.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SourceBadge source="Your input" />
          {compact && (
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="min-h-11 rounded-full border border-line px-4 text-base font-semibold text-forest hover:bg-green-tint"
            >
              {open ? "Done" : "Change"}
            </button>
          )}
        </div>
      </div>

      {!open ? (
        <p className="text-base text-ink">{summary.length ? summary.join(" · ") : "Nothing chosen yet."}</p>
      ) : (
        <div className="space-y-5">
          <div role="group" aria-labelledby="priorities-heading" className="space-y-2">
            <p id="priorities-heading" className="text-base font-semibold text-ink">
              What matters most to you? <span className="font-normal text-caption">Pick any</span>
            </p>
            <ul className="flex flex-wrap gap-2">
              {PRIORITIES.map((priority) => {
                const active = priorities.includes(priority.id);
                return (
                  <li key={priority.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      title={priority.hint}
                      onClick={() => toggle(priority.id)}
                      className={chip(active)}
                    >
                      {active && <Check aria-hidden="true" className="size-4" strokeWidth={2.4} />}
                      {priority.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Choice
              question="How do you water this field?"
              options={WATER_OPTIONS}
              value={profile.water}
              onChange={(water) => updateProfile({ water })}
            />
            <Choice
              question="Could you sow and harvest a new crop?"
              options={KIT_OPTIONS}
              value={profile.kit}
              onChange={(kit) => updateProfile({ kit })}
            />
            <Choice
              question="Do you have a buyer for a new crop?"
              options={MARKET_OPTIONS}
              value={profile.market}
              onChange={(market) => updateProfile({ market })}
            />
            <Choice
              question="What is your soil like?"
              options={SOIL_OPTIONS}
              value={profile.soilType}
              onChange={(soilType) => updateProfile({ soilType })}
            />
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4">
            <label htmlFor={omId} className="flex flex-col gap-1 text-base font-semibold text-ink">
              <span>
                Organic matter from a soil test <span className="font-normal text-caption">(optional, %)</span>
              </span>
              <input
                id={omId}
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                step={0.1}
                placeholder="For example 3.2"
                value={profile.organicMatter ?? ""}
                onChange={(event) => {
                  const value = event.target.valueAsNumber;
                  updateProfile({ organicMatter: Number.isFinite(value) && value >= 0 && value <= 100 ? value : undefined });
                }}
                className="min-h-12 w-48 rounded-control border border-line bg-white px-3 text-base font-normal text-ink"
              />
            </label>
            {hasProfile(profile) && (
              <button
                type="button"
                onClick={() => updateSession({ profile: undefined })}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-base font-semibold text-caption hover:text-forest"
              >
                <RotateCcw aria-hidden="true" className="size-4" strokeWidth={2} />
                Clear my answers
              </button>
            )}
          </div>
          <p className="text-sm text-caption">
            Your answers stay in this browser tab and are gone when you close it. We never send them to NASA or the map
            provider.
          </p>
        </div>
      )}
    </section>
  );
}

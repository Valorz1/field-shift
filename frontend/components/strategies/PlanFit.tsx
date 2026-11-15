"use client";

import { AlertCircle, CheckCircle2, Info, Star } from "lucide-react";
import Link from "next/link";
import { cx } from "@/lib/cx";
import { hasProfile, type PlanFit } from "@/lib/farm-profile";
import type { FarmProfile } from "@/lib/session-store";

// "Matches 2 of your 3 priorities". Nothing when the farmer has not picked any.
export const matchText = (fit: PlanFit) =>
  fit.asked ? `Matches ${fit.matches} of your ${fit.asked} ${fit.asked === 1 ? "priority" : "priorities"}` : undefined;

export function BestMatchBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gold-tint px-2.5 py-1 text-sm font-semibold text-forest">
      <Star aria-hidden="true" className="size-4 fill-gold text-gold" strokeWidth={1.8} />
      Best fit for your priorities
    </span>
  );
}

// The farmer's answers checked against one plan. limit: the small plan cards show only the first notes.
export function PlanFitList({
  fit,
  profile,
  limit,
  askHref,
}: {
  fit: PlanFit;
  profile?: FarmProfile;
  limit?: number;
  askHref?: string;
}) {
  if (!hasProfile(profile)) {
    return askHref ? (
      <p className="text-sm text-caption">
        <Link href={askHref} className="font-semibold text-primary underline underline-offset-2">
          Tell us about your farm
        </Link>{" "}
        to see what fits.
      </p>
    ) : null;
  }
  // The small cards show the first thing that fits and the first thing to check, then the rest in order.
  const notes = fit.notes;
  const firsts = (["good", "check"] as const)
    .map((tone) => notes.find((n) => n.tone === tone))
    .filter((n): n is (typeof notes)[number] => Boolean(n));
  const shown = limit ? [...firsts, ...notes.filter((n) => !firsts.includes(n))].slice(0, limit) : notes;
  const hidden = notes.length - shown.length;
  return (
    <div className="space-y-1.5">
      {matchText(fit) && <p className="text-sm font-semibold text-forest">{matchText(fit)}</p>}
      {shown.length === 0 ? (
        <p className="text-sm text-caption">Nothing in your answers changes this plan.</p>
      ) : (
        <ul className="space-y-1.5">
          {shown.map((note) => {
            const Icon = note.tone === "good" ? CheckCircle2 : note.tone === "check" ? AlertCircle : Info;
            return (
              <li key={note.text} className="flex gap-2 text-sm leading-snug text-ink">
                <Icon
                  aria-hidden="true"
                  className={cx(
                    "mt-0.5 size-4 shrink-0",
                    note.tone === "good" ? "text-primary" : note.tone === "check" ? "text-warning-ink" : "text-caption",
                  )}
                  strokeWidth={2}
                />
                <span>
                  <span className="sr-only">{{ good: "Fits: ", check: "Check: ", note: "Note: " }[note.tone]}</span>
                  {note.text}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {hidden > 0 && <p className="text-sm text-caption">+{hidden} more on the full plan</p>}
    </div>
  );
}

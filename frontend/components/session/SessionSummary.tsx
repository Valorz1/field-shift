"use client";

import Link from "next/link";
import { Suspense } from "react";
import { isPin } from "@/lib/data/climate";
import { formatCoordinates } from "@/lib/format";
import { farmHref } from "@/lib/navigation";
import { KIT_OPTIONS, MARKET_OPTIONS, PRIORITIES, SOIL_OPTIONS, WATER_OPTIONS } from "@/lib/farm-profile";
import { DEFAULT_AI_LEVEL, useSession } from "@/lib/session-store";
import { useClimateSite } from "@/lib/use-climate-site";
import { DEMO_CROPS } from "@/lib/use-strategies";
import { AI_LEVELS } from "./AiLevelSelector";

function Summary() {
  const session = useSession();
  const { place } = useClimateSite();
  const level = AI_LEVELS.find((entry) => entry.level === (session.aiLevel ?? DEFAULT_AI_LEVEL));
  const crop = (session.crop ?? DEMO_CROPS[place.id] ?? "").trim();
  const rows = [
    { name: "Field", value: isPin(place) ? "Your field, pinned on the map" : `${place.name}, ${place.region} (example farm)` },
    { name: "Where", value: formatCoordinates(place.latitude, place.longitude) },
    { name: "Crop", value: crop ? crop[0].toUpperCase() + crop.slice(1) : "Not chosen yet" },
    { name: "AI help", value: level ? `Level ${level.level}: ${level.name}` : "" },
  ];
  // The farmer's own answers ("About your farm"), only the ones given.
  const profile = session.profile ?? {};
  const pick = <T extends string>(options: { id: T; label: string }[], id?: T) => options.find((o) => o.id === id)?.label;
  const answers = [
    { name: "Priorities", value: (profile.priorities ?? []).map((p) => pick(PRIORITIES, p)).join(", ") },
    { name: "Water", value: pick(WATER_OPTIONS, profile.water) },
    { name: "Kit for a new crop", value: pick(KIT_OPTIONS, profile.kit) },
    { name: "Buyer for a new crop", value: pick(MARKET_OPTIONS, profile.market) },
    { name: "Soil", value: pick(SOIL_OPTIONS, profile.soilType) },
    { name: "Organic matter", value: profile.organicMatter === undefined ? "" : `${profile.organicMatter}%` },
  ];
  rows.push(...answers.filter((row): row is { name: string; value: string } => Boolean(row.value)));
  return (
    <>
      <dl className="divide-y divide-line">
        {rows.map(({ name, value }) => (
          <div key={name} className="flex justify-between gap-4 py-2.5 text-base">
            <dt className="text-caption">{name}</dt>
            <dd className="text-right font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-base text-caption">
        To change the field or crop, go to the{" "}
        <Link href={farmHref("/dashboard", place)} className="font-semibold text-primary underline underline-offset-2">
          dashboard
        </Link>
        . To change the AI help, go to{" "}
        <Link href={farmHref("/settings", place)} className="font-semibold text-primary underline underline-offset-2">
          Settings
        </Link>
        .
      </p>
    </>
  );
}

// Everything the app is holding about this visit. It lives in this browser tab only.
export function SessionSummary() {
  return (
    <Suspense fallback={null}>
      <Summary />
    </Suspense>
  );
}

"use client";

import { getDemoStrategies, getLiveStrategies } from "./api";
import { type Place, isPin } from "./data/climate";
import { useSession } from "./session-store";
import { useLoaded } from "./use-loaded";

// What each demo farm grows (the backend's own defaults).
const DEMO_CROPS: Record<string, string> = { norfolk: "wheat", nevada: "alfalfa" };

// One request per place and crop, shared by the dashboard cards and the strategy cards.
export function useStrategies(site: Place) {
  // Session crop: undefined = not chosen yet, "" = "Other" chosen but nothing typed yet.
  const chosen = useSession().crop;
  const crop = (chosen ?? DEMO_CROPS[site.id] ?? "").trim();
  const { data, error, retry } = useLoaded(crop ? `strategies:${site.id}:${crop}` : null, () =>
    isPin(site) ? getLiveStrategies(site.latitude, site.longitude, crop) : getDemoStrategies(site.id, crop),
  );
  return { chosen, crop, data, error, retry };
}

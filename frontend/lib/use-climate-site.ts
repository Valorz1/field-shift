"use client";

import { useSearchParams } from "next/navigation";
import { getDemoClimate, getLiveClimate } from "./api";
import { getPlace, isPin, pinPlace, summarise } from "./data/climate";
import { useSession } from "./session-store";
import { useLoaded } from "./use-loaded";

export function useClimateSite() {
  const { latitude, longitude } = useSession();
  const demo = getPlace(useSearchParams().get("site"));
  // A dropped pin wins over the demo farm in the address bar.
  const place = latitude !== undefined && longitude !== undefined ? pinPlace(latitude, longitude) : demo;
  const { data: site, error, retry } = useLoaded(`climate:${place.id}`, () =>
    (isPin(place) ? getLiveClimate(place.latitude, place.longitude) : getDemoClimate(place.id)).then(({ rows }) =>
      summarise(place, rows),
    ),
  );
  return { place, site, error, retry };
}

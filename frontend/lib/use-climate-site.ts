"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDemoClimate, getLiveClimate } from "./api";
import { type ClimateSite, type Place, getPlace, isPin, pinPlace, summarise } from "./data/climate";
import { useSession } from "./session-store";

// One request per place per page load, shared by the sidebar, top bar and dashboard. Memory only.
const cache = new Map<string, Promise<ClimateSite>>();

function loadSite(place: Place) {
  let site = cache.get(place.id);
  if (!site) {
    const climate = isPin(place) ? getLiveClimate(place.latitude, place.longitude) : getDemoClimate(place.id);
    site = climate.then(({ rows }) => summarise(place, rows));
    site.catch(() => cache.delete(place.id)); // a failed request can be tried again
    cache.set(place.id, site);
  }
  return site;
}

type Loaded = { id: string; site?: ClimateSite; error?: string };

export function useClimateSite() {
  const { latitude, longitude } = useSession();
  const demo = getPlace(useSearchParams().get("site"));
  // A dropped pin wins over the demo farm in the address bar.
  const place = latitude !== undefined && longitude !== undefined ? pinPlace(latitude, longitude) : demo;
  const { id } = place;
  const [loaded, setLoaded] = useState<Loaded>({ id });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let stale = false;
    loadSite(place).then(
      (site) => stale || setLoaded({ id, site }),
      (error: Error) => stale || setLoaded({ id, error: error.message }),
    );
    return () => {
      stale = true;
    };
    // place is rebuilt on every render; id says when it really changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, attempt]);

  const current = loaded.id === id ? loaded : { id };
  return {
    place,
    site: current.site,
    error: current.error,
    retry: () => {
      setLoaded({ id });
      setAttempt((n) => n + 1);
    },
  };
}

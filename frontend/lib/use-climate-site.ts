"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDemoClimate } from "./api";
import { type ClimateSite, getPlace, summarise } from "./data/climate";

// One request per place per page load, shared by the sidebar, top bar and dashboard. Memory only.
const cache = new Map<string, Promise<ClimateSite>>();

function loadSite(id: string) {
  let site = cache.get(id);
  if (!site) {
    site = getDemoClimate(id).then(({ rows }) => summarise(getPlace(id), rows));
    site.catch(() => cache.delete(id)); // a failed request can be tried again
    cache.set(id, site);
  }
  return site;
}

type Loaded = { id: string; site?: ClimateSite; error?: string };

export function useClimateSite() {
  const { id } = getPlace(useSearchParams().get("site"));
  const [loaded, setLoaded] = useState<Loaded>({ id });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let stale = false;
    loadSite(id).then(
      (site) => stale || setLoaded({ id, site }),
      (error: Error) => stale || setLoaded({ id, error: error.message }),
    );
    return () => {
      stale = true;
    };
  }, [id, attempt]);

  const current = loaded.id === id ? loaded : { id };
  return {
    site: current.site,
    error: current.error,
    retry: () => {
      setLoaded({ id });
      setAttempt((n) => n + 1);
    },
  };
}

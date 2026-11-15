"use client";

import { MapPin, Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateSession } from "@/lib/session-store";
import { flyToPlace } from "./FarmMap";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
// Leans results towards the UK, where the advice is written for. An address anywhere in the world still works.
const NEAR_UK = "-2.6,54.2";

type Hit = { id: string; name: string; detail: string; latitude: number; longitude: number };

type Feature = {
  id?: string;
  geometry?: { coordinates?: [number, number] };
  properties?: { name?: string; full_address?: string; place_formatted?: string; mapbox_id?: string };
};

const toHit = (feature: Feature, index: number): Hit | undefined => {
  const [longitude, latitude] = feature.geometry?.coordinates ?? [];
  if (typeof latitude !== "number" || typeof longitude !== "number") return undefined;
  const { name, full_address, place_formatted, mapbox_id } = feature.properties ?? {};
  return {
    id: mapbox_id ?? feature.id ?? String(index),
    name: name ?? full_address ?? "Unnamed place",
    detail: place_formatted ?? "",
    latitude,
    longitude,
  };
};

// Type a postcode, village or address and the pin goes there. Needs no map to work, so it is also the
// way in when the map cannot load. What is typed goes to Mapbox to be found and is not kept.
export function AddressSearch() {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  if (!TOKEN) return null;

  const search = async (event: FormEvent) => {
    event.preventDefault();
    const text = query.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(undefined);
    try {
      const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(text)}&limit=5&proximity=${NEAR_UK}&access_token=${TOKEN}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new Error(String(response.status));
      const body = (await response.json()) as { features?: Feature[] };
      setHits((body.features ?? []).map(toHit).filter((hit): hit is Hit => hit !== undefined));
    } catch {
      setHits(null);
      setError("Could not look that up just now. You can tap the map or use an example farm instead.");
    } finally {
      setBusy(false);
    }
  };

  const choose = (hit: Hit) => {
    updateSession({ latitude: hit.latitude, longitude: hit.longitude });
    flyToPlace(hit.latitude, hit.longitude);
    setQuery(hit.name);
    setHits(null);
  };

  return (
    <div className="space-y-2">
      <form onSubmit={search} role="search" className="space-y-1.5">
        <label htmlFor="address-search" className="block text-sm font-semibold tracking-wide text-caption uppercase">
          Find your field
        </label>
        <div className="flex gap-2">
          <input
            id="address-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Postcode, village or address"
            autoComplete="off"
            className="min-h-12 min-w-0 flex-1 rounded-control border border-line bg-white px-3 text-base text-ink placeholder:text-neutral"
          />
          <Button type="submit" disabled={busy || !query.trim()} aria-label="Find this place">
            <Search aria-hidden="true" className="size-5" strokeWidth={1.8} />
            <span className="hidden sm:inline">{busy ? "Looking" : "Find"}</span>
          </Button>
        </div>
      </form>

      <div aria-live="polite">
        {error && <p className="rounded-inner bg-danger-tint p-3 text-base text-danger-ink">{error}</p>}
        {hits && hits.length === 0 && (
          <p className="text-base text-caption">Nothing found. Try a postcode, or the nearest village.</p>
        )}
        {hits && hits.length > 0 && (
          <ul className="divide-y divide-line overflow-hidden rounded-inner border border-line bg-white">
            {hits.map((hit) => (
              <li key={hit.id}>
                <button
                  type="button"
                  onClick={() => choose(hit)}
                  className="flex min-h-12 w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-green-tint"
                >
                  <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" strokeWidth={1.8} />
                  <span className="min-w-0">
                    <span className="block text-base font-semibold text-forest">{hit.name}</span>
                    {hit.detail && <span className="block text-sm text-caption">{hit.detail}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

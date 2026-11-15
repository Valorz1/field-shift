"use client";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/states/ErrorMessage";
import { formatCoordinates } from "@/lib/format";
import { updateSession, useSession } from "@/lib/session-store";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const UK_CENTRE: [number, number] = [-2.6, 54.2];

// The address box asks the map to move to a place it found. A tap on the map does not zoom in, but a search should.
export const flyToPlace = (latitude: number, longitude: number) =>
  window.dispatchEvent(new CustomEvent("fs:flyto", { detail: { latitude, longitude } }));

type Props = {
  // "card": the map with its own heading and notes. "fill": only the map, to fill a space on the dashboard.
  variant?: "card" | "fill";
};

export function FarmMap({ variant = "card" }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [failed, setFailed] = useState(!TOKEN);
  const { latitude, longitude } = useSession();

  useEffect(() => {
    if (!TOKEN || !container.current) return;
    try {
      map.current = new mapboxgl.Map({
        accessToken: TOKEN,
        container: container.current,
        // Vector style: satellite tiles answer 429 (rate limit) for our token.
        style: "mapbox://styles/mapbox/outdoors-v12",
        // Opens on the UK, where the crop advice is written for. A pin anywhere in the world still works.
        center: UK_CENTRE,
        zoom: 4.6,
      });
    } catch {
      setFailed(true); // no WebGL in this browser
      return;
    }
    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
    // The map's box changes height when the panel beside it grows (crop box, Nevada note): redraw to fit.
    const resizer = new ResizeObserver(() => map.current?.resize());
    resizer.observe(container.current);
    // The pin lives in the in-memory session only; nothing is written to storage.
    map.current.on("click", ({ lngLat }) => updateSession({ latitude: lngLat.lat, longitude: lngLat.lng }));
    map.current.on("error", ({ error }) => {
      if ((error as { status?: number }).status === 401) setFailed(true); // token rejected
    });
    const fly = (event: Event) => {
      const { latitude, longitude } = (event as CustomEvent<{ latitude: number; longitude: number }>).detail;
      map.current?.flyTo({ center: [longitude, latitude], zoom: Math.max(map.current.getZoom(), 12) });
    };
    window.addEventListener("fs:flyto", fly);
    // Mapbox keeps an anonymous telemetry id in localStorage. It holds no location, but we promise to store nothing.
    const forget = () =>
      Object.keys(localStorage)
        .filter((key) => key.startsWith("mapbox."))
        .forEach((key) => localStorage.removeItem(key));
    window.addEventListener("pagehide", forget);
    return () => {
      resizer.disconnect();
      window.removeEventListener("pagehide", forget);
      window.removeEventListener("fs:flyto", fly);
      forget();
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
  }, []);

  useEffect(() => {
    marker.current?.remove();
    marker.current = null;
    if (map.current && latitude !== undefined && longitude !== undefined)
      marker.current = new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map.current);
  }, [latitude, longitude]);

  if (variant === "fill") {
    return (
      <div className="relative h-64 overflow-hidden bg-forest sm:h-80 lg:h-full lg:min-h-[420px]">
        {failed ? (
          <div role="alert" className="flex h-full items-center justify-center p-6 text-center">
            <p className="max-w-xs text-base text-on-forest">
              The map could not load. You can still use the Norfolk and Western Nevada examples.
            </p>
          </div>
        ) : (
          <>
            {/* Mapbox sets position: relative on its own container, so the size comes from this wrapper. */}
            <div className="absolute inset-0">
              <div ref={container} className="h-full w-full" />
            </div>
            <p className="pointer-events-none absolute top-3 right-12 left-3 flex items-center gap-2 rounded-control bg-forest-deep/80 px-3 py-2 text-sm text-white backdrop-blur-sm">
              <MapPin aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.8} />
              {latitude !== undefined && longitude !== undefined
                ? `Pin at ${formatCoordinates(latitude, longitude)}. Tap somewhere else to move it.`
                : "Tap the map to drop a pin on your field."}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <Card aria-labelledby="farm-map-title" className="flex flex-col gap-3">
      <h2 id="farm-map-title" className="font-display text-xl font-bold text-forest">
        Where is your field?
      </h2>
      {failed ? (
        <ErrorMessage message="The map could not load. You can still use the Norfolk and Western Nevada examples below." />
      ) : (
        <>
          <p className="text-base text-ink">
            {latitude !== undefined && longitude !== undefined
              ? `Pin at ${formatCoordinates(latitude, longitude)}. Tap somewhere else to move it.`
              : "Tap the map to drop a pin on your field and see NASA data for that spot."}
          </p>
          <div ref={container} className="h-80 overflow-hidden rounded-inner" />
          <p className="text-sm text-caption">
            The place you pick is sent to NASA and the map provider (Mapbox) to load the data and the map. It is not
            stored after you finish.
          </p>
        </>
      )}
    </Card>
  );
}

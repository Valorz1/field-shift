"use client";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/states/ErrorMessage";
import { climateSites } from "@/lib/data/climate";
import { formatCoordinates } from "@/lib/format";
import { updateSession, useSession } from "@/lib/session-store";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function FarmMap() {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [failed, setFailed] = useState(!TOKEN);
  const { latitude, longitude } = useSession();

  useEffect(() => {
    if (!TOKEN || !container.current) return;
    const [{ latitude: lat, longitude: lng }] = climateSites;
    try {
      map.current = new mapboxgl.Map({
        accessToken: TOKEN,
        container: container.current,
        // Vector style: satellite tiles answer 429 (rate limit) for our token.
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [lng, lat],
        zoom: 3,
      });
    } catch {
      setFailed(true); // no WebGL in this browser
      return;
    }
    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
    // The pin lives in the in-memory session only; nothing is written to storage.
    map.current.on("click", ({ lngLat }) => updateSession({ latitude: lngLat.lat, longitude: lngLat.lng }));
    map.current.on("error", ({ error }) => {
      if ((error as { status?: number }).status === 401) setFailed(true); // token rejected
    });
    // Mapbox keeps an anonymous telemetry id in localStorage. It holds no location, but we promise to store nothing.
    const forget = () =>
      Object.keys(localStorage)
        .filter((key) => key.startsWith("mapbox."))
        .forEach((key) => localStorage.removeItem(key));
    window.addEventListener("pagehide", forget);
    return () => {
      window.removeEventListener("pagehide", forget);
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

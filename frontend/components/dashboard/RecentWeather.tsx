"use client";

import { CalendarClock, CloudRain, Snowflake, Thermometer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { type ClimateSite, isPin } from "@/lib/data/climate";
import { formatSigned } from "@/lib/format";
import { getRecentWeather } from "@/lib/api";
import { useLoaded } from "@/lib/use-loaded";

const day = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function Figure({ icon: Icon, label, value, note }: { icon: typeof CloudRain; label: string; value: string; note: string }) {
  return (
    <div className="flex items-start gap-3 rounded-inner bg-page p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-water-tint text-water-ink">
        <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
      </span>
      <span>
        <span className="block text-sm text-caption">{label}</span>
        <span className="block font-display text-2xl font-extrabold text-forest tabular-nums">{value}</span>
        <span className="block text-sm text-caption">{note}</span>
      </span>
    </div>
  );
}

// The last 30 days on this field, from NASA POWER daily data. Shown on its own, so a slow NASA reply
// never holds up the rest of the page.
export function RecentWeather({ site }: { site: ClimateSite }) {
  const farm = isPin(site) ? undefined : site.id;
  const { data, error } = useLoaded(`recent:${site.latitude},${site.longitude}`, () =>
    getRecentWeather(site.latitude, site.longitude, farm),
  );

  const title = (
    <h3 className="flex items-center gap-2 font-display text-lg font-bold text-forest">
      <CalendarClock aria-hidden="true" className="size-5" strokeWidth={1.8} />
      The last 30 days on your field
    </h3>
  );

  if (error)
    return (
      <Card className="space-y-2">
        {title}
        <p className="text-base text-caption">NASA did not send the latest daily data just now. The rest of the page is not affected.</p>
      </Card>
    );
  if (!data)
    return (
      <Card className="space-y-2" aria-busy="true">
        {title}
        <p className="text-base text-caption">Getting the latest daily data from NASA…</p>
      </Card>
    );

  // No Fine / Act now tag here: 30 days of weather swing a lot, so the colours stay for the 5-year picture.
  const change = data.rain.change_pct;
  return (
    <Card className="space-y-4">
      <div>
        {title}
        <p className="text-sm text-caption">
          {day(data.period.start)} to {day(data.period.end)}. NASA&apos;s daily data runs a few days behind today.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Figure
          icon={CloudRain}
          label="Rain"
          value={`${Math.round(data.rain.recent_mm)} mm`}
          note={
            change === null
              ? `Usual: about ${Math.round(data.rain.usual_mm)} mm`
              : `${formatSigned(change, 0)}% vs usual (${Math.round(data.rain.usual_mm)} mm)`
          }
        />
        <Figure
          icon={Thermometer}
          label="Average temperature"
          value={`${data.temperature.recent_c.toFixed(1)} °C`}
          note={`${formatSigned(data.temperature.change_c)} °C vs usual`}
        />
        <Figure
          icon={Snowflake}
          label="Frost nights (below 0 °C)"
          value={String(data.frost_nights)}
          note={`Coldest: ${data.coldest.min_c.toFixed(1)} °C on ${day(data.coldest.date)}`}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-caption">
        <SourceBadge source="NASA POWER" />
        Usual = the 2001–2020 average for these months. This is what has happened, not a forecast.
      </div>
    </Card>
  );
}

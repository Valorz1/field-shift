"use client";

import { CloudRainWind, Droplets, type LucideIcon, Snowflake, Sun, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { SectionTitle } from "@/components/layout/SectionTitle";
import { Card } from "@/components/ui/Card";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { StatusTag } from "@/components/ui/StatusTag";
import { getRecentWeather } from "@/lib/api";
import { rainStatus, seasonInsights, usualYears } from "@/lib/climate-facts";
import { type ClimateSite, isPin } from "@/lib/data/climate";
import { farmHref } from "@/lib/navigation";
import { useLoaded } from "@/lib/use-loaded";
import type { Status } from "@/lib/view-models";

// The same thresholds as backend/app/services/recent_weather.py. Written out in the guide (/guide).
export const RISK_RULES = { frostBelowC: 0, heatFromC: 30, heavyRainFromMm: 20 } as const;
const SUMMER = [6, 7, 8];

const day = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function Count({ icon: Icon, label, value, note }: { icon: LucideIcon; label: string; value: string; note: string }) {
  return (
    <div className="flex items-start gap-3 rounded-inner bg-page p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-earth-tint text-earth-ink">
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

// Plant water stress in summer, from the NASA POWER model: root-zone soil wetness and summer rain,
// recent years against the usual years. A model of the soil, not a measurement of the crop.
export function summerWaterStress(site: ClimateSite): { status: Status; text: string } | undefined {
  const summer = seasonInsights(site).find((season) => season.name === "Summer");
  const months = site.soilMonths?.filter((month) => SUMMER.includes(month.month));
  const soil =
    months && months.length === SUMMER.length
      ? {
          recent: Math.round((months.reduce((s, m) => s + m.recent, 0) / months.length) * 100),
          usual: Math.round((months.reduce((s, m) => s + m.usual, 0) / months.length) * 100),
        }
      : undefined;
  if (!summer && !soil) return undefined;
  const rain = summer ? rainStatus(summer.percent) : "fine";
  const drierSoil = soil ? soil.usual - soil.recent : 0;
  const status: Status = rain === "act" && drierSoil >= 2 ? "act" : rain !== "fine" || drierSoil >= 2 ? "watch" : "fine";
  const parts = [
    soil && `The top metre of soil was ${soil.recent}% wet in summer (usual ${soil.usual}%).`,
    summer && `Summer rain was ${Math.abs(summer.percent)}% ${summer.percent < 0 ? "below" : "above"} usual.`,
  ].filter(Boolean);
  const verdict =
    status === "fine"
      ? "Crops are not more likely to run short of water than usual."
      : status === "watch"
        ? "Crops may run short of water in summer more often than before."
        : "Crops are more likely to run short of water in summer. Plan for dry spells.";
  return { status, text: `${parts.join(" ")} ${verdict}` };
}

// Frost, heat stress and heavy rain in the last 30 days (NASA POWER daily), and plant water stress in summer
// over recent years (NASA POWER monthly). No NDVI: we do not have crop greenness for this field yet.
export function FieldRisks({ site }: { site: ClimateSite }) {
  const farm = isPin(site) ? undefined : site.id;
  const { data, error } = useLoaded(`recent:${site.latitude},${site.longitude}`, () =>
    getRecentWeather(site.latitude, site.longitude, farm),
  );
  const stress = summerWaterStress(site);

  return (
    <section id="risks" aria-labelledby="risks-heading" className="scroll-mt-24 space-y-4">
      <SectionTitle id="risks-heading" icon={TriangleAlert}>
        Field risks to watch
      </SectionTitle>
      <div className="grid gap-4 2xl:grid-cols-[3fr_2fr]">
        <Card className="space-y-3">
          <h3 className="font-display text-lg font-bold text-forest">Frost, heat and heavy rain: the last 30 days</h3>
          {error ? (
            <p className="text-base text-caption">NASA did not send the latest daily data just now.</p>
          ) : !data ? (
            <p className="text-base text-caption" aria-busy="true">
              Counting the days from NASA&apos;s daily data…
            </p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <Count
                  icon={Snowflake}
                  label="Frost nights"
                  value={String(data.frost_nights)}
                  note={`Below ${RISK_RULES.frostBelowC} °C. Coldest ${data.coldest.min_c.toFixed(1)} °C on ${day(data.coldest.date)}`}
                />
                {data.heat_days !== undefined && (
                  <Count
                    icon={Sun}
                    label="Heat-stress days"
                    value={String(data.heat_days)}
                    note={`${RISK_RULES.heatFromC} °C or more. Hottest ${data.hottest.max_c.toFixed(1)} °C on ${day(data.hottest.date)}`}
                  />
                )}
                {data.heavy_rain_days !== undefined && (
                  <Count
                    icon={CloudRainWind}
                    label="Heavy rain days"
                    value={String(data.heavy_rain_days)}
                    note={`${RISK_RULES.heavyRainFromMm} mm or more in a day.${data.wettest ? ` Wettest ${Math.round(data.wettest.mm)} mm on ${day(data.wettest.date)}` : ""}`}
                  />
                )}
              </div>
              <p className="flex flex-wrap items-center gap-2 text-sm text-caption">
                <SourceBadge source="NASA POWER" />
                {day(data.period.start)} to {day(data.period.end)}. Counts of what has happened, not a forecast.
              </p>
            </>
          )}
        </Card>

        <Card className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-forest">
              <Droplets aria-hidden="true" className="size-5" strokeWidth={1.8} />
              Plant water stress in summer
            </h3>
            {stress && <StatusTag status={stress.status} />}
          </div>
          <p className="text-base text-ink">
            {stress ? stress.text : "NASA POWER has no soil wetness for this place, so we cannot say."}
          </p>
          <p className="flex flex-wrap items-center gap-2 text-sm text-caption">
            <SourceBadge source="NASA POWER (MERRA-2 model)" />
            {site.year} against {usualYears(site)}. Worked out from modelled soil wetness and rain, not measured on your crop,
            and it does not know about irrigation.
          </p>
        </Card>
      </div>
      <p className="text-base text-caption">
        Crop greenness from satellites (NDVI) is not in the app yet.{" "}
        <Link href={farmHref("/guide", site)} className="font-semibold text-primary underline underline-offset-2">
          What these words mean
        </Link>
      </p>
    </section>
  );
}

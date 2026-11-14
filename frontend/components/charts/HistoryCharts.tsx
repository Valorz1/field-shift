"use client";

import Chart from "chart.js/auto";
import type { ChartConfiguration } from "chart.js";
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { SourceBadge } from "@/components/ui/SourceBadge";
import type { ClimateSite } from "@/lib/data/climate";
import { formatYears } from "@/lib/format";
import type { ClimateRow } from "@/lib/types";
import type { DataLabel } from "@/lib/view-models";

// The API labels each row "nasa" (straight from NASA) or "calculated" (worked out by us).
const badgeFor = ({ label, source }: ClimateRow): DataLabel =>
  label === "calculated" ? "Calculated" : source === "GPM IMERG" ? "GPM IMERG" : "NASA POWER";

const unitOf = ({ unit }: ClimateRow) => (unit === "C" ? "°C" : unit);

type Series = { name: string; rows: ClimateRow[]; type: "line" | "bar"; color: string };

function HistoryChart({ id, title, axis, series }: { id: string; title: string; axis: string; series: Series[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const unit = unitOf(series[0].rows[0]);
  const dates = series[0].rows.map((row) => row.date);
  const badges = [...new Set(series.map(({ rows }) => badgeFor(rows[0])))];

  useEffect(() => {
    if (!canvas.current) return;
    const color = (name: string) => getComputedStyle(canvas.current!).getPropertyValue(`--color-${name}`).trim();
    const config: ChartConfiguration = {
      type: "bar",
      data: {
        labels: dates,
        datasets: series.map(({ name, rows, type, color: tone }) => {
          const byDate = new Map(rows.map((row) => [row.date, row.value]));
          return {
            type,
            label: `${name} (${unit})`,
            data: dates.map((date) => byDate.get(date) ?? null),
            borderColor: color(tone),
            backgroundColor: color(tone),
            borderWidth: type === "line" ? 1.5 : 0,
            pointRadius: 0,
            order: type === "line" ? 0 : 1,
          };
        }),
      },
      options: {
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { title: { display: true, text: "Month" }, ticks: { maxTicksLimit: 9 }, grid: { display: false } },
          y: { title: { display: true, text: `${axis} (${unit})` } },
        },
      },
    };
    const chart = new Chart(canvas.current, config);
    return () => chart.destroy();
    // series is rebuilt on every render; the chart only needs redrawing when the place changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const range = formatYears(Number(dates[0].slice(0, 4)), Number(dates.at(-1)!.slice(0, 4)));
  return (
    <Card aria-labelledby={`${id}-title`} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 id={`${id}-title`} className="font-display text-lg leading-snug font-bold text-forest">
          {title}, {range}
        </h3>
        {badges.map((badge) => (
          <SourceBadge key={badge} source={badge} />
        ))}
      </div>
      <div className="h-64">
        <canvas ref={canvas} role="img" aria-label={`${title}, ${range}, in ${unit}. One value for each month.`} />
      </div>
    </Card>
  );
}

export function HistoryCharts({ site }: { site: ClimateSite }) {
  const { temperature, rain, satelliteRain } = site.history;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <HistoryChart
        id={`temperature-history-${site.id}`}
        title="Temperature each month"
        axis="Temperature"
        series={[{ name: "Temperature", rows: temperature, type: "line", color: "primary" }]}
      />
      <HistoryChart
        id={`rain-history-${site.id}`}
        title="Rain each month"
        axis="Rain"
        series={[
          { name: "Rain", rows: rain, type: "bar", color: "water" },
          ...(satelliteRain.length
            ? [{ name: "Rain seen by satellite", rows: satelliteRain, type: "line" as const, color: "earth" }]
            : []),
        ]}
      />
    </div>
  );
}

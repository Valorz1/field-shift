import { Satellite } from "lucide-react";
import { ClimateChart } from "@/components/charts/ClimateChart";
import { Card } from "@/components/ui/Card";
import { SourceBadge } from "@/components/ui/SourceBadge";
import type { ClimateSite } from "@/lib/data/climate";

const pct = (v: number) => Math.round(v * 1000) / 10;

// The satellite check: NASA SMAP soil moisture next to the NASA POWER model numbers.
// SMAP reads the top ~5 cm as water per volume of soil; POWER gives the top metre as % of saturated.
// The units differ, so we compare the pattern, never the values.
export function SmapCheck({ site }: { site: ClimateSite }) {
  const smap = site.smap!;
  const change = Math.round((smap.summer.recent / smap.summer.earlier - 1) * 100);
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-forest">
          <Satellite aria-hidden="true" className="size-5" strokeWidth={1.8} />
          Satellite check: NASA SMAP
        </h3>
        <SourceBadge source="NASA SMAP" />
      </div>
      <p className="text-base text-ink">
        The SMAP satellite measured the top 5 cm of soil on {smap.days.toLocaleString("en-GB")} days from 2016 to 2025.
        It agrees with the numbers above: soil is wettest in winter and driest in late summer.
        {change < 0 && ` It also shows summers getting drier: the topsoil in summer 2021–2025 held about ${Math.abs(change)}% less water than in 2016–2020.`}
      </p>
      <div className="max-w-2xl">
        <ClimateChart
          id={`smap-${site.id}`}
          title="Topsoil water each month, from the SMAP satellite"
          definition="Water in the top 5 cm of soil, as a share of the soil's volume. SMAP started in 2015, so 'usual' here is 2016–2020."
          mark="line"
          unit="%"
          digits={0}
          tickStep={10}
          fromZero
          points={smap.months.map((m) => ({ value: pct(m.recent), usual: pct(m.usual), low: pct(m.low), high: pct(m.high) }))}
          year="2021–2025"
          usualYears="2016–2020"
          source="NASA SMAP SPL3SMP_E version 006, morning pass, via NASA AppEEARS"
          note="3 × 3 grid cells (about 27 km) around the farm, recommended-quality readings only. Satellite and model use different units, so compare the shape, not the numbers."
        />
      </div>
    </Card>
  );
}

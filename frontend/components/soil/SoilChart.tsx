import { ClimateChart } from "@/components/charts/ClimateChart";
import { usualYears } from "@/lib/climate-facts";
import type { ClimateSite } from "@/lib/data/climate";

const pct = (fraction: number) => Math.round(fraction * 1000) / 10;

// Soil wetness each month as "% wet", drawn like the temperature chart: recent line, usual line, usual range.
export function SoilChart({ site }: { site: ClimateSite }) {
  if (!site.soilMonths) return null;
  return (
    <ClimateChart
      id={`soil-${site.id}`}
      title={`Soil wetness each month in ${site.year}`}
      definition="How wet the top metre of soil was, from 0% (dry) to 100% (soaked)."
      mark="line"
      unit="%"
      digits={0}
      tickStep={20}
      fromZero
      points={site.soilMonths.map((m) => ({ value: pct(m.recent), usual: pct(m.usual), low: pct(m.low), high: pct(m.high) }))}
      year={site.year}
      usualYears={usualYears(site)}
      source="GWETROOT"
      note="From the NASA POWER MERRA-2 model, not from a satellite."
    />
  );
}

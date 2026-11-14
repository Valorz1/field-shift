import { usualYears } from "@/lib/climate-facts";
import type { ClimateSite } from "@/lib/data/climate";
import { ClimateChart } from "./ClimateChart";

export function RainfallChart({ site }: { site: ClimateSite }) {
  const wettest = Math.max(...site.months.flatMap((m) => [m.rainfallMm, m.baselineRainfallMaxMm]));
  return (
    <ClimateChart
      id={`rain-${site.id}`}
      title={`Rain each month in ${site.year}`}
      definition="All rain and snow, as water, that fell in each month, in millimetres."
      mark="bars"
      unit="mm"
      digits={0}
      tickStep={wettest > 100 ? 50 : 25}
      fromZero
      points={site.months.map((m) => ({
        value: m.rainfallMm,
        usual: m.baselineRainfallMm,
        low: m.baselineRainfallMinMm,
        high: m.baselineRainfallMaxMm,
      }))}
      year={site.year}
      usualYears={usualYears(site)}
      source={`${site.source.precipitation.parameter} (rain), API ${site.source.apiVersion}`}
      note="Monthly rain is the daily rate multiplied by the days in the month."
    />
  );
}

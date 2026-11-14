import { usualYears } from "@/lib/climate-facts";
import type { ClimateSite } from "@/lib/data/climate";
import { ClimateChart } from "./ClimateChart";

export function TemperatureChart({ site }: { site: ClimateSite }) {
  const range = site.months.flatMap((m) => [m.temperatureC, m.baselineTemperatureMinC, m.baselineTemperatureMaxC]);
  return (
    <ClimateChart
      id={`temperature-${site.id}`}
      title={`Temperature each month in ${site.year}`}
      definition="Average air temperature 2 metres above the ground, in °C."
      mark="line"
      unit="°C"
      digits={1}
      tickStep={Math.max(...range) - Math.min(...range) > 20 ? 10 : 5}
      points={site.months.map((m) => ({
        value: m.temperatureC,
        usual: m.baselineTemperatureC,
        low: m.baselineTemperatureMinC,
        high: m.baselineTemperatureMaxC,
      }))}
      year={site.year}
      usualYears={usualYears(site)}
      source={site.source.temperature.parameter}
    />
  );
}

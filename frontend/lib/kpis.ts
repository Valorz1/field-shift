import type { ClimateSite } from "./data/climate";
import { formatSigned, formatYears } from "./format";
import type { KpiView } from "./view-models";

export const kpisFor = ({ year, baseline, annual, source }: ClimateSite): KpiView[] => {
  const baselineYears = formatYears(baseline.start, baseline.end);
  const rainfallChange = Math.round(Math.abs(annual.rainfallChangePct));
  return [
    {
      kind: "temperature",
      label: "Average Temperature",
      value: annual.temperatureC.toFixed(1),
      unit: "°C",
      source: "Calculated",
      change: `${formatSigned(annual.temperatureChangeC)} °C against the ${baselineYears} average of ${annual.baselineTemperatureC.toFixed(1)} °C`,
      changeTone: annual.temperatureChangeC >= 0.5 ? "warning" : "neutral",
      footnote: `Jan – Dec ${year} · mean of NASA POWER monthly ${source.temperature.parameter}`,
    },
    {
      kind: "precipitation",
      label: "Total Precipitation",
      value: String(Math.round(annual.rainfallMm)),
      unit: "mm",
      source: "Calculated",
      change:
        rainfallChange < 2
          ? `About the same as the ${baselineYears} average of ${Math.round(annual.baselineRainfallMm)} mm`
          : `${rainfallChange}% ${annual.rainfallChangePct > 0 ? "above" : "below"} the ${baselineYears} average of ${Math.round(annual.baselineRainfallMm)} mm`,
      changeTone: rainfallChange >= 10 ? "warning" : "neutral",
      footnote: `Jan – Dec ${year} · sum of NASA POWER monthly ${source.precipitation.parameter} · GPM IMERG not connected yet`,
    },
    {
      kind: "soil-moisture",
      label: "Soil Moisture",
      value: "No data",
      source: "Missing",
      change: "Not connected yet",
      changeTone: "neutral",
      footnote: "Will come from NASA SMAP L3",
    },
    {
      kind: "risk",
      label: "Environmental Risk",
      value: "No data",
      source: "Missing",
      change: "Not calculated yet",
      changeTone: "neutral",
      footnote: "Needs the team's risk model and soil moisture data",
    },
  ];
};

import { rainChange, rainMeaning, rainStatus, temperatureChange, temperatureMeaning, temperatureStatus } from "./climate-facts";
import type { ClimateSite } from "./data/climate";
import { formatSigned } from "./format";
import type { KpiView } from "./view-models";

export const kpisFor = (site: ClimateSite): KpiView[] => {
  const t = temperatureChange(site);
  const r = rainChange(site);
  return [
    {
      kind: "temperature",
      label: `Temperature in ${site.year} vs usual`,
      value: formatSigned(t),
      unit: "°C",
      source: "Calculated",
      status: temperatureStatus(t),
      meaning: temperatureMeaning(t),
    },
    {
      kind: "rain",
      label: `Rain in ${site.year} vs usual`,
      value: formatSigned(r, 0),
      unit: "%",
      source: "Calculated",
      status: rainStatus(r),
      meaning: rainMeaning(r),
    },
    {
      kind: "soil-wetness",
      label: "Soil wetness",
      value: "No data",
      source: "Missing",
      meaning: "Not connected yet. It will come from NASA SMAP.",
    },
    {
      kind: "risk",
      label: "Climate risk",
      value: "No data",
      source: "Missing",
      meaning: "Not worked out yet. It needs soil wetness data first.",
    },
  ];
};

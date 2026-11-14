import {
  rainChange,
  rainMeaning,
  rainStatus,
  riskLevelText,
  riskReason,
  riskStatus,
  soilMeaning,
  soilPercents,
  temperatureChange,
  temperatureMeaning,
  temperatureStatus,
} from "./climate-facts";
import type { ClimateSite } from "./data/climate";
import { formatSigned } from "./format";
import type { Risk } from "./types";
import type { KpiView } from "./view-models";

// Where the strategies request is: no crop chosen yet, on its way, failed, or arrived.
export type RiskState = { crop: string; risk?: Risk; error?: string };

const soilKpi = (site: ClimateSite): KpiView => {
  const soil = soilPercents(site);
  if (!soil)
    return {
      kind: "soil-wetness",
      label: `Soil wetness in ${site.year}`,
      value: "No data",
      source: "Missing",
      meaning: "NASA POWER has no root-zone soil wetness for this place. NASA SMAP satellite soil data is still coming.",
    };
  return {
    kind: "soil-wetness",
    label: `Soil wetness in ${site.year}${soil.usual === undefined ? "" : " vs usual"}`,
    value: String(soil.recent),
    unit: "% wet",
    source: "NASA POWER (MERRA-2 model)",
    meaning: soilMeaning(soil),
  };
};

const riskKpi = ({ crop, risk, error }: RiskState): KpiView => {
  const label = "Climate risk";
  if (error || risk?.level === "unknown")
    return {
      kind: "risk",
      label,
      value: "No data",
      source: "Missing",
      meaning: error ? "The climate risk could not be loaded." : "The climate risk could not be worked out for this place.",
    };
  if (!risk)
    return {
      kind: "risk",
      label,
      value: crop ? "Working it out" : "Not yet",
      source: "Calculated",
      waiting: true,
      meaning: crop ? "This comes with the plans below." : "Choose the crop you grow below to work it out.",
    };
  return {
    kind: "risk",
    label,
    value: riskLevelText(risk.level),
    source: "Calculated",
    status: riskStatus(risk.level),
    meaning: `${riskReason(risk)} The plans below are based on this.`,
  };
};

export const kpisFor = (site: ClimateSite, risk: RiskState): KpiView[] => {
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
    soilKpi(site),
    riskKpi(risk),
  ];
};

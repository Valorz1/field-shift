import type { Strategy } from "./types";

export type DataLabel =
  | "NASA POWER"
  | "GPM IMERG"
  | "NASA SMAP"
  | "Calculated"
  | "Your input"
  | "AI"
  | "General agronomy"
  | "Sample data"
  | "Missing";

export type ConnectionStatus = "connected" | "available" | "loading" | "unavailable";

export type StrategyKind = "baseline" | "climate-adaptive" | "soil-restoration";

export type StrategyView = Omit<Strategy, "sources"> & {
  sources: DataLabel[];
  kind: StrategyKind;
  position: 1 | 2 | 3;
  rotation: readonly [string, string, string];
};

export type KpiKind = "temperature" | "precipitation" | "soil-moisture" | "risk";

export type KpiView = {
  kind: KpiKind;
  label: string;
  value: string;
  unit?: string;
  source: DataLabel;
  change: string;
  changeTone: "neutral" | "warning";
  footnote: string;
};

export type FarmSummary = {
  name: string;
  locationLabel: string;
  coordinates: string;
  areaHectares: number;
  crop: string;
  irrigation: string;
  period: string;
  historyRange: string;
};

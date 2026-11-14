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

export type Level = "low" | "medium" | "high";

export type StrategyId = "baseline" | "water_efficient" | "soil_restoration";

export type StrategyKind = "baseline" | "climate-adaptive" | "soil-restoration";

export type RotationStep = {
  year: 1 | 2 | 3;
  crop: string;
  role: string;
  alternatives?: string[];
};

export type EvidenceSource = { id: string; citation: string; url: string };

export type Evidence =
  | { type: "climate_data"; statement: string; label: string; source: string }
  | { type: "agronomy_rule"; rule_id: string; statement: string; sources: EvidenceSource[] };

export type Strategy = {
  id: StrategyId;
  title: string;
  rotation: RotationStep[];
  why: string;
  evidence: Evidence[];
  benefits: string[];
  risks: string[];
  gaps: string[];
  water_need: string;
  complexity: Level;
  confidence: Level;
  kind: StrategyKind;
  position: 1 | 2 | 3;
  summary: string;
  rotation_crops: string[];
  sources: DataLabel[];
};

export type Status = "fine" | "watch" | "act";

export type KpiKind = "temperature" | "rain" | "soil-wetness" | "risk";

export type KpiView = {
  kind: KpiKind;
  label: string;
  value: string;
  unit?: string;
  source: DataLabel;
  status?: Status;
  meaning: string;
};

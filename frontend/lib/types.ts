export type RiskCategory = "low" | "moderate" | "high" | "unknown";
export type Indicator = { name: string; value: number | null; unit: string; risk: RiskCategory; source: string };
export type Strategy = { id: string; title: string; summary: string; sources: string[] };

// Climate API. schemas.py has no model for these yet, so they mirror what backend/app/routers/climate.py returns.
export type ClimateRow = { date: string; parameter: string; value: number; unit: string; source: string; label: string };
export type LiveClimateResponse = { latitude: number; longitude: number; source: string; rows: ClimateRow[] };
export type DemoClimateResponse = { farm: string; source: string; rows: ClimateRow[] };

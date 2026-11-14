import type { Strategy } from "./view-models";

export type RiskCategory = "low" | "moderate" | "high" | "unknown";
export type Indicator = { name: string; value: number | null; unit: string; risk: RiskCategory; source: string };

// Climate API. schemas.py has no model for these yet, so they mirror what backend/app/routers/climate.py returns.
export type ClimateRow = { date: string; parameter: string; value: number; unit: string; source: string; label: string };
export type LiveClimateResponse = { latitude: number; longitude: number; source: string; rows: ClimateRow[] };
export type DemoClimateResponse = { farm: string; source: string; rows: ClimateRow[] };

// Strategies API. schemas.py has no model for these either: they mirror backend/app/routers/strategies.py,
// services/indicators.py (climate, risk) and services/strategy_engine.py (Strategy, in view-models.ts).
export type Measure = { value: number; unit: string; label: string; source: string };
type YearsUsed = { baseline: Measure; recent: Measure };
type RainSummary = { baseline: Measure; recent: Measure; change_pct: Measure; years_used: YearsUsed };
export type ClimateSummary = {
  periods: { baseline: string; recent: string };
  temperature: { baseline: Measure; recent: Measure; change: Measure; years_used: YearsUsed };
  rainfall: RainSummary;
  summer_rainfall: RainSummary;
};
type RiskDriver = { triggered: boolean; points: Measure };
export type Risk = { level: RiskCategory; points: Measure; drivers: { warming: RiskDriver; drying: RiskDriver } };
export type StrategyFarm = { name?: string | null; latitude: number; longitude: number; crop: string };
export type StrategiesResponse = {
  farm: StrategyFarm;
  climate: ClimateSummary;
  risk: Risk;
  strategies: Strategy[];
  disclaimer: string;
};

// GET /climate/recent: the last 30 days from NASA POWER daily data (backend/app/services/recent_weather.py).
export type RecentWeather = {
  latitude: number;
  longitude: number;
  period: { start: string; end: string; days: number };
  rain: { recent_mm: number; usual_mm: number; change_pct: number | null };
  temperature: { recent_c: number; usual_c: number; change_c: number };
  frost_nights: number;
  hottest: { date: string; max_c: number };
  coldest: { date: string; min_c: number };
  source: string;
  usual: string;
};

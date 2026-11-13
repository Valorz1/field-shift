export type RiskCategory = "low" | "moderate" | "high" | "unknown";
export type Indicator = { name: string; value: number | null; unit: string; risk: RiskCategory; source: string };
export type Strategy = { id: string; title: string; summary: string; sources: string[] };

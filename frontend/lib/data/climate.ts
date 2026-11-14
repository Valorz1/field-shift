import summaries from "./power-summary.json";

export type ClimateSite = (typeof summaries)[number];
export type MonthSummary = ClimateSite["months"][number];

export const climateSites: ClimateSite[] = summaries;

export const getSite = (id?: string | null): ClimateSite => climateSites.find((site) => site.id === id) ?? climateSites[0];

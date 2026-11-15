import type { ClimateSite, MonthSummary } from "./data/climate";
import { formatSigned, formatYears } from "./format";
import type { Risk, RiskCategory } from "./types";
import type { Status } from "./view-models";

export const usualYears = ({ baseline }: ClimateSite) => formatYears(baseline.start, baseline.end);

export const temperatureChange = ({ annual }: ClimateSite) => Number(annual.temperatureChangeC.toFixed(1));

const roundPercent = (percent: number) => {
  const rounded = Math.round(percent);
  return Math.abs(rounded) < 2 ? 0 : rounded;
};

export const rainChange = ({ annual }: ClimateSite) => roundPercent(annual.rainfallChangePct);

export const STATUS_RULES = {
  temperature: { watchFromC: 0.5, actFromC: 1.5 },
  rain: { watchBelowPct: -5, actBelowPct: -25, watchAbovePct: 25 },
} as const;

export const temperatureStatus = (change: number): Status => {
  const { watchFromC, actFromC } = STATUS_RULES.temperature;
  if (change >= actFromC) return "act";
  if (change >= watchFromC) return "watch";
  return "fine";
};

export const rainStatus = (percent: number): Status => {
  const { watchBelowPct, actBelowPct, watchAbovePct } = STATUS_RULES.rain;
  if (percent <= actBelowPct) return "act";
  if (percent <= watchBelowPct || percent >= watchAbovePct) return "watch";
  return "fine";
};

export const statusRuleText = () => {
  const { temperature: t, rain: r } = STATUS_RULES;
  const c = (value: number) => `${formatSigned(value)} °C`;
  const pct = (value: number) => `${formatSigned(value, 0)}%`;
  return [
    "Green means Fine, amber means Keep an eye on it, red means Act now.",
    `Temperature change: under ${c(t.watchFromC)} is Fine, ${c(t.watchFromC)} to under ${c(t.actFromC)} is Keep an eye on it, ${c(t.actFromC)} or more is Act now.`,
    `Rain change: above ${pct(r.watchBelowPct)} is Fine, ${pct(r.watchBelowPct)} to above ${pct(r.actBelowPct)} is Keep an eye on it, ${pct(r.actBelowPct)} or less is Act now. ${pct(r.watchAbovePct)} or more (much wetter) is Keep an eye on it. The same rain rule is used for each season.`,
  ];
};

export const temperatureMeaning = (change: number) => {
  const status = temperatureStatus(change);
  if (status === "act") return "Much warmer than usual – crops may need more water and suffer in hot spells.";
  if (status === "watch") return "Warmer than usual – crops may need more water and ripen earlier.";
  if (change > 0) return "A little warmer than usual – no change needed.";
  if (change < 0) return "Cooler than usual – crops may grow a little more slowly.";
  return "About as warm as usual.";
};

export const rainMeaning = (percent: number) => {
  const status = rainStatus(percent);
  if (status === "act") return "Much drier than usual – your crops may run short of water.";
  if (status === "watch")
    return percent < 0
      ? "Drier than usual – check how wet your soil stays before sowing."
      : "Much wetter than usual – wet ground can delay field work.";
  if (percent > 0) return "A little wetter than usual – no change needed.";
  if (percent < 0) return "A little drier than usual – no change needed.";
  return "About as much rain as usual.";
};

const SEASONS = [
  {
    name: "Spring",
    months: [3, 4, 5],
    span: "March to May",
    dry: "your crops may need more water early in the season",
    wet: "wet ground can delay sowing and field work",
  },
  {
    name: "Summer",
    months: [6, 7, 8],
    span: "June to August",
    dry: "your crops may need more water while they fill grain and fruit",
    wet: "wet weather can delay harvest",
  },
] as const;

export type SeasonInsight = { name: string; span: string; status: Status; text: string; rain: number; usual: number; percent: number };

const total = (months: MonthSummary[], pick: (month: MonthSummary) => number) =>
  months.reduce((sum, month) => sum + pick(month), 0);

const seasonRain = (site: ClimateSite, season: (typeof SEASONS)[number]) => {
  const months = site.months.filter((m) => (season.months as readonly number[]).includes(m.month));
  const rain = Math.round(total(months, (m) => m.rainfallMm));
  const usual = Math.round(total(months, (m) => m.baselineRainfallMm));
  const percent = roundPercent((rain / usual - 1) * 100);
  return { rain, usual, percent, status: rainStatus(percent) };
};

export const seasonInsights = (site: ClimateSite): SeasonInsight[] =>
  SEASONS.map((season) => {
    const { rain, usual, percent, status } = seasonRain(site, season);
    const figures = `(${rain} mm vs ${usual} mm usual)`;
    const direction = percent < 0 ? "drier" : "wetter";
    const strength = status === "fine" ? "a little " : status === "act" || percent > 0 ? "much " : "";
    const effect = status === "fine" ? "" : ` – ${percent < 0 ? season.dry : season.wet}`;
    const start = `${season.name} ${site.year} was`;
    const text =
      percent === 0
        ? `${start} about as wet as usual ${figures}.`
        : `${start} ${strength}${direction} than usual ${figures}${effect}.`;
    return { name: season.name, span: season.span, status, text, rain, usual, percent };
  });

const warmth = (change: number) => `${Math.abs(change).toFixed(1)} °C ${change > 0 ? "warmer" : "cooler"}`;

export const yearSummary = (site: ClimateSite) => {
  const t = temperatureChange(site);
  const r = rainChange(site);
  const rain = `${Math.abs(r)}% ${r > 0 ? "wetter" : "drier"}`;
  const start = `In ${site.year} your field was`;
  if (t === 0 && r === 0) return `${start} about as warm and as wet as usual.`;
  if (t === 0) return `${start} about as warm as usual and ${rain} than usual.`;
  if (r === 0) return `${start} ${warmth(t)} than usual, with about the usual amount of rain.`;
  return `${start} ${warmth(t)} and ${rain} than usual.`;
};

// The headline leads with summer rain when summers changed more than the whole year did:
// in Norfolk the year was only 2% drier, but summers were about 30% drier.
export const headline = (site: ClimateSite) => {
  const summer = seasonRain(site, SEASONS[1]);
  if (summer.status === "fine" || summer.status === rainStatus(rainChange(site))) return yearSummary(site);
  const t = temperatureChange(site);
  const summers = `summers were about ${Math.abs(summer.percent)}% ${summer.percent < 0 ? "drier" : "wetter"}`;
  return t === 0
    ? `In ${site.year} your field was about as warm as usual, but ${summers} than usual.`
    : `In ${site.year} your field was ${warmth(t)}, and ${summers} than usual.`;
};

// The worst of the three signals the banner talks about, so its tag matches the sentence under it.
const severity: Record<Status, number> = { fine: 0, watch: 1, act: 2 };

export const headlineStatus = (site: ClimateSite): Status =>
  [temperatureStatus(temperatureChange(site)), rainStatus(rainChange(site)), seasonRain(site, SEASONS[1]).status].reduce(
    (worst, status) => (severity[status] > severity[worst] ? status : worst),
  );

const percentWet = (fraction: number) => Math.round(fraction * 100);

// Whole percents, so "drier" or "wetter" is only said when the figures shown differ.
export const soilPercents = ({ soil }: ClimateSite) =>
  soil && { recent: percentWet(soil.recent), usual: soil.baseline === undefined ? undefined : percentWet(soil.baseline) };

export const soilMeaning = ({ recent, usual }: { recent: number; usual?: number }) => {
  const start = `The top metre of soil was ${recent}% wet`;
  if (usual === undefined) return `${start}, on average.`;
  if (recent === usual) return `${start}, about as wet as usual.`;
  return `${start}, a little ${recent < usual ? "drier" : "wetter"} than usual (usual ${usual}% wet).`;
};

// Display only: the strategy engine decides the level; this just picks the matching tag.
const riskStatuses: Record<RiskCategory, Status | undefined> = {
  low: "fine",
  moderate: "watch",
  high: "act",
  unknown: undefined,
};

export const riskStatus = (level: RiskCategory) => riskStatuses[level];

export const riskLevelText = (level: RiskCategory) => level[0].toUpperCase() + level.slice(1);

export const riskReason = ({ drivers }: Risk) => {
  const changes = [drivers.warming.triggered && "warmer", drivers.drying.triggered && "drier"].filter(Boolean);
  return changes.length
    ? `Recent years were ${changes.join(" and ")} than usual.`
    : "Recent years were not much warmer or drier than usual.";
};

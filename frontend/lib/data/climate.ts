import { formatYears } from "../format";
import type { ClimateRow } from "../types";

export type Place = { id: string; name: string; region: string; latitude: number; longitude: number; elevationM?: number };

export type MonthSummary = {
  month: number;
  temperatureC: number;
  rainfallMm: number;
  baselineTemperatureC: number;
  baselineTemperatureMinC: number;
  baselineTemperatureMaxC: number;
  baselineRainfallMm: number;
  baselineRainfallMinMm: number;
  baselineRainfallMaxMm: number;
};

export type ClimateSite = Place & {
  source: {
    firstYear: number;
    lastYear: number;
    temperature: { parameter: string };
    precipitation: { parameter: string };
  };
  // The recent years shown, as a label ("2021–2025"). Every figure is the average over those years.
  year: string;
  baseline: { start: number; end: number };
  months: MonthSummary[];
  annual: {
    temperatureC: number;
    rainfallMm: number;
    baselineTemperatureC: number;
    baselineRainfallMm: number;
    temperatureChangeC: number;
    rainfallChangePct: number;
  };
  // Root-zone soil wetness as a fraction (0–1), averaged like temperature. Absent when NASA POWER has no recent GWETROOT.
  soil?: { recent: number; baseline?: number };
  // Soil wetness for each calendar month (0–1): the recent average, and the usual average, lowest and highest.
  soilMonths?: { month: number; recent: number; usual: number; low: number; high: number }[];
  // NASA SMAP satellite soil moisture (top ~5 cm, cm3/cm3), when it has been downloaded for this farm.
  // SMAP only starts in 2015, so it compares 2021-2025 with 2016-2020, not with 2001-2020.
  smap?: {
    months: { month: number; recent: number; usual: number; low: number; high: number }[];
    summer: { earlier: number; recent: number };
    days: number;
  };
  // Every month the API returned, for the history charts. satelliteRain is empty when the API has no IMERG rows.
  history: { temperature: ClimateRow[]; rain: ClimateRow[]; satelliteRain: ClimateRow[] };
};

// The two demo farms served by GET /climate/demo/{id}.
export const climateSites: Place[] = [
  { id: "norfolk", name: "Norfolk", region: "England, UK", latitude: 52.65, longitude: 0.9, elevationM: 32 },
  { id: "nevada", name: "Western Nevada", region: "USA", latitude: 39.47, longitude: -118.78, elevationM: 1269 },
];

// A place the farmer pinned on the map. Two decimals (about 1 km) matches what the backend sends to NASA.
export const pinPlace = (latitude: number, longitude: number): Place => ({
  id: `pin:${latitude.toFixed(2)},${longitude.toFixed(2)}`,
  name: "Your field",
  region: "pinned on the map",
  latitude: Number(latitude.toFixed(2)),
  longitude: Number(longitude.toFixed(2)),
});

// A rough box around Great Britain and Northern Ireland. Good enough to say "this looks like the UK";
// it also catches a strip of Ireland and the French coast, so the wording stays soft.
export const isInUk = (place: Place) =>
  place.latitude >= 49.8 && place.latitude <= 60.9 && place.longitude >= -8.7 && place.longitude <= 1.8;

export const isPin = (place: Place) => place.id.startsWith("pin:");

export const getPlace = (id?: string | null): Place => climateSites.find((site) => site.id === id) ?? climateSites[0];

const BASELINE = { start: 2001, end: 2020 };
const RECENT = { start: 2021, end: 2025 };
const TEMPERATURE = "T2M";
const RAIN_TOTAL = "PRECTOTCORR_MONTH_TOTAL";
const SATELLITE_RAIN_TOTAL = "IMERG_PRECIP_MONTH_TOTAL";
const SOIL_WETNESS = "GWETROOT";
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

const round = (value: number, digits: number) => Number(value.toFixed(digits));
const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
const key = (year: number, month: number) => `${year}-${String(month).padStart(2, "0")}`;

type Period = { start: number; end: number };

// Mean of the yearly averages over the years in the period that have all 12 months; undefined when there are none.
function periodMean(series: ClimateRow[], { start, end }: Period) {
  const byYear = new Map<number, number[]>();
  for (const row of series) {
    const year = Number(row.date.slice(0, 4));
    if (year >= start && year <= end) byYear.set(year, [...(byYear.get(year) ?? []), row.value]);
  }
  const yearly = [...byYear.values()].filter((values) => values.length === MONTHS.length).map(mean);
  return yearly.length ? mean(yearly) : undefined;
}

function soilWetness(series: ClimateRow[]): ClimateSite["soil"] {
  const recent = periodMean(series, RECENT);
  if (recent === undefined) return undefined;
  const baseline = periodMean(series, BASELINE);
  return { recent: round(recent, 4), ...(baseline !== undefined && { baseline: round(baseline, 4) }) };
}

function soilByMonth(series: ClimateRow[]): ClimateSite["soilMonths"] {
  const value = new Map(series.map((row) => [row.date, row.value]));
  const pick = (period: Period, month: number) =>
    Array.from({ length: period.end - period.start + 1 }, (_, i) => value.get(key(period.start + i, month))).filter(
      (v): v is number => v !== undefined,
    );
  const months = MONTHS.map((month) => {
    const recent = pick(RECENT, month);
    const usual = pick(BASELINE, month);
    if (!recent.length || !usual.length) return undefined;
    return {
      month,
      recent: round(mean(recent), 3),
      usual: round(mean(usual), 3),
      low: round(Math.min(...usual), 3),
      high: round(Math.max(...usual), 3),
    };
  });
  return months.every(Boolean) ? (months as NonNullable<ClimateSite["soilMonths"]>) : undefined;
}

const SMAP_EARLIER = { start: 2016, end: 2020 };

function smapSummary(series: ClimateRow[], dayRows: ClimateRow[]): ClimateSite["smap"] {
  if (!series.length) return undefined;
  const value = new Map(series.map((row) => [row.date, row.value]));
  const pick = (period: Period, months: readonly number[]) =>
    months.flatMap((month) =>
      Array.from({ length: period.end - period.start + 1 }, (_, i) => value.get(key(period.start + i, month))),
    ).filter((v): v is number => v !== undefined);
  const months = MONTHS.map((month) => {
    const recent = pick(RECENT, [month]);
    const earlier = pick(SMAP_EARLIER, [month]);
    if (!recent.length || !earlier.length) return undefined;
    return {
      month,
      recent: round(mean(recent), 3),
      usual: round(mean(earlier), 3),
      low: round(Math.min(...earlier), 3),
      high: round(Math.max(...earlier), 3),
    };
  });
  if (!months.every(Boolean)) return undefined;
  const summer = [6, 7, 8] as const;
  return {
    months: months as NonNullable<ClimateSite["smap"]>["months"],
    summer: { earlier: round(mean(pick(SMAP_EARLIER, summer)), 3), recent: round(mean(pick(RECENT, summer)), 3) },
    days: Math.round(dayRows.reduce((sum, row) => sum + row.value, 0)),
  };
}

export function summarise(place: Place, rows: ClimateRow[]): ClimateSite {
  const only = (parameter: string) => rows.filter((row) => row.parameter === parameter);
  const history = { temperature: only(TEMPERATURE), rain: only(RAIN_TOTAL), satelliteRain: only(SATELLITE_RAIN_TOTAL) };
  const byDate = (series: ClimateRow[]) => new Map(series.map((row) => [row.date, row.value]));
  const temperature = byDate(history.temperature);
  const rain = byDate(history.rain);

  // The API leaves out months NASA has no value for, so a year counts only when all 12 months are there.
  const complete = (year: number) => MONTHS.every((m) => temperature.has(key(year, m)) && rain.has(key(year, m)));
  const years = [...new Set([...temperature.keys()].map((date) => Number(date.slice(0, 4))))].sort((a, b) => a - b);
  const fullYearsIn = ({ start, end }: Period) => years.filter((year) => year >= start && year <= end && complete(year));
  const baselineYears = fullYearsIn(BASELINE);
  const recentYears = fullYearsIn(RECENT);
  if (!baselineYears.length || !recentYears.length) throw new Error("NASA POWER has too little data for this place.");

  const monthlyTemperature = (year: number, month: number) => temperature.get(key(year, month))!;
  const monthlyRainfall = (year: number, month: number) => rain.get(key(year, month))!;
  const annualTemperature = (year: number) => mean(MONTHS.map((month) => monthlyTemperature(year, month)));
  const annualRainfall = (year: number) => MONTHS.reduce((sum, month) => sum + monthlyRainfall(year, month), 0);

  // Same sums and rounding as backend/app/services/indicators.py, so these match the strategies API and the slides.
  const temperatureC = round(mean(recentYears.map(annualTemperature)), 2);
  const rainfallMm = round(mean(recentYears.map(annualRainfall)), 2);
  const baselineTemperatureC = round(mean(baselineYears.map(annualTemperature)), 2);
  const baselineRainfallMm = round(mean(baselineYears.map(annualRainfall)), 2);

  return {
    ...place,
    source: {
      firstYear: years[0],
      lastYear: years.at(-1)!,
      temperature: { parameter: TEMPERATURE },
      precipitation: { parameter: "PRECTOTCORR" },
    },
    year: formatYears(RECENT.start, RECENT.end),
    baseline: BASELINE,
    months: MONTHS.map((month) => {
      const temperatures = baselineYears.map((year) => monthlyTemperature(year, month));
      const rainfall = baselineYears.map((year) => monthlyRainfall(year, month));
      return {
        month,
        temperatureC: round(mean(recentYears.map((year) => monthlyTemperature(year, month))), 2),
        rainfallMm: round(mean(recentYears.map((year) => monthlyRainfall(year, month))), 1),
        baselineTemperatureC: round(mean(temperatures), 2),
        baselineTemperatureMinC: round(Math.min(...temperatures), 2),
        baselineTemperatureMaxC: round(Math.max(...temperatures), 2),
        baselineRainfallMm: round(mean(rainfall), 1),
        baselineRainfallMinMm: round(Math.min(...rainfall), 1),
        baselineRainfallMaxMm: round(Math.max(...rainfall), 1),
      };
    }),
    annual: {
      temperatureC,
      rainfallMm,
      baselineTemperatureC,
      baselineRainfallMm,
      temperatureChangeC: round(temperatureC - baselineTemperatureC, 2),
      rainfallChangePct: round(((rainfallMm - baselineRainfallMm) / baselineRainfallMm) * 100, 2),
    },
    soil: soilWetness(only(SOIL_WETNESS)),
    soilMonths: soilByMonth(only(SOIL_WETNESS)),
    smap: smapSummary(only("SMAP_SOIL_MOISTURE_AM"), only("SMAP_DAYS")),
    history,
  };
}

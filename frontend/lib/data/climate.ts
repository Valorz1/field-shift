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
  year: number;
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

export const isPin = (place: Place) => place.id.startsWith("pin:");

export const getPlace = (id?: string | null): Place => climateSites.find((site) => site.id === id) ?? climateSites[0];

const BASELINE = { start: 2001, end: 2020 };
const TEMPERATURE = "T2M";
const RAIN_TOTAL = "PRECTOTCORR_MONTH_TOTAL";
const SATELLITE_RAIN_TOTAL = "IMERG_PRECIP_MONTH_TOTAL";
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

const round = (value: number, digits: number) => Number(value.toFixed(digits));
const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
const key = (year: number, month: number) => `${year}-${String(month).padStart(2, "0")}`;

export function summarise(place: Place, rows: ClimateRow[]): ClimateSite {
  const only = (parameter: string) => rows.filter((row) => row.parameter === parameter);
  const history = { temperature: only(TEMPERATURE), rain: only(RAIN_TOTAL), satelliteRain: only(SATELLITE_RAIN_TOTAL) };
  const byDate = (series: ClimateRow[]) => new Map(series.map((row) => [row.date, row.value]));
  const temperature = byDate(history.temperature);
  const rain = byDate(history.rain);

  // The API leaves out months NASA has no value for, so a year counts only when all 12 months are there.
  const complete = (year: number) => MONTHS.every((m) => temperature.has(key(year, m)) && rain.has(key(year, m)));
  const years = [...new Set([...temperature.keys()].map((date) => Number(date.slice(0, 4))))].sort((a, b) => a - b);
  const fullYears = years.filter(complete);
  const latest = fullYears.at(-1);
  if (latest === undefined || fullYears.length < 2) throw new Error("NASA POWER has too little data for this place.");

  const coversBaseline = Array.from({ length: BASELINE.end - BASELINE.start + 1 }, (_, i) => BASELINE.start + i).every(complete);
  const baseline = coversBaseline ? BASELINE : { start: fullYears[0], end: fullYears.at(-2)! };
  const baselineYears = fullYears.filter((year) => year >= baseline.start && year <= baseline.end);

  const monthlyTemperature = (year: number, month: number) => temperature.get(key(year, month))!;
  const monthlyRainfall = (year: number, month: number) => rain.get(key(year, month))!;
  const annualTemperature = (year: number) => mean(MONTHS.map((month) => monthlyTemperature(year, month)));
  const annualRainfall = (year: number) => MONTHS.reduce((sum, month) => sum + monthlyRainfall(year, month), 0);

  const temperatureC = annualTemperature(latest);
  const rainfallMm = annualRainfall(latest);
  const baselineTemperatureC = mean(baselineYears.map(annualTemperature));
  const baselineRainfallMm = mean(baselineYears.map(annualRainfall));

  return {
    ...place,
    source: {
      firstYear: years[0],
      lastYear: years.at(-1)!,
      temperature: { parameter: TEMPERATURE },
      precipitation: { parameter: "PRECTOTCORR" },
    },
    year: latest,
    baseline,
    months: MONTHS.map((month) => {
      const temperatures = baselineYears.map((year) => monthlyTemperature(year, month));
      const rainfall = baselineYears.map((year) => monthlyRainfall(year, month));
      return {
        month,
        temperatureC: monthlyTemperature(latest, month),
        rainfallMm: round(monthlyRainfall(latest, month), 1),
        baselineTemperatureC: round(mean(temperatures), 2),
        baselineTemperatureMinC: round(Math.min(...temperatures), 2),
        baselineTemperatureMaxC: round(Math.max(...temperatures), 2),
        baselineRainfallMm: round(mean(rainfall), 1),
        baselineRainfallMinMm: round(Math.min(...rainfall), 1),
        baselineRainfallMaxMm: round(Math.max(...rainfall), 1),
      };
    }),
    annual: {
      temperatureC: round(temperatureC, 2),
      rainfallMm: round(rainfallMm, 1),
      baselineTemperatureC: round(baselineTemperatureC, 2),
      baselineRainfallMm: round(baselineRainfallMm, 1),
      temperatureChangeC: round(temperatureC - baselineTemperatureC, 2),
      rainfallChangePct: round(((rainfallMm - baselineRainfallMm) / baselineRainfallMm) * 100, 1),
    },
    history,
  };
}

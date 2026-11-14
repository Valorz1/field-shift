/**
 * Builds lib/data/power-summary.json from the NASA POWER monthly downloads in data/raw.
 * Run from the frontend folder: npm run data:power
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

type PowerSeries = Record<string, number>;

type PowerResponse = {
  geometry: { coordinates: [number, number, number] };
  header: { title: string; api: { version: string }; sources: string[]; fill_value: number; start: string; end: string };
  parameters: Record<string, { units: string; longname: string }>;
  properties: { parameter: Record<string, PowerSeries> };
};

const SITES = [
  { id: "norfolk", name: "Norfolk", region: "England, UK" },
  { id: "nevada", name: "Western Nevada", region: "USA" },
];

const BASELINE = { start: 2001, end: 2020 };
const TEMPERATURE = "T2M";
const PRECIPITATION = "PRECTOTCORR";
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

const rawDir = new URL("../../data/raw/", import.meta.url);
const outFile = new URL("../lib/data/power-summary.json", import.meta.url);

const round = (value: number, digits: number) => Number(value.toFixed(digits));
const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, index) => start + index);
const key = (year: number, month: number) => `${year}${String(month).padStart(2, "0")}`;
const daysIn = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();

function summarise(site: (typeof SITES)[number]) {
  const raw: PowerResponse = JSON.parse(readFileSync(new URL(`power_${site.id}_raw.json`, rawDir), "utf8"));
  const { fill_value: fill } = raw.header;
  const series = (name: string) => {
    const values = raw.properties.parameter[name];
    if (!values) throw new Error(`${site.id}: ${name} is missing from the POWER response`);
    return values;
  };
  const temperature = series(TEMPERATURE);
  const precipitation = series(PRECIPITATION);
  const has = (values: PowerSeries, year: number, month: number) => {
    const value = values[key(year, month)];
    return value !== undefined && value !== fill;
  };
  const complete = (year: number) => MONTHS.every((m) => has(temperature, year, m) && has(precipitation, year, m));

  const firstYear = Number(raw.header.start.slice(0, 4));
  const lastYear = Number(raw.header.end.slice(0, 4));
  const fullYears = range(firstYear, lastYear).filter(complete);
  const latest = fullYears.at(-1);
  if (latest === undefined) throw new Error(`${site.id}: no complete year of data`);

  const coversBaseline = range(BASELINE.start, BASELINE.end).every(complete);
  const baseline = coversBaseline ? BASELINE : { start: fullYears[0], end: latest - 1 };
  const baselineYears = fullYears.filter((year) => year >= baseline.start && year <= baseline.end);

  const monthlyTemperature = (year: number, month: number) => temperature[key(year, month)];
  const monthlyRainfall = (year: number, month: number) => precipitation[key(year, month)] * daysIn(year, month);
  const annualRainfall = (year: number) => MONTHS.reduce((sum, month) => sum + monthlyRainfall(year, month), 0);
  const annualTemperature = (year: number) => mean(MONTHS.map((month) => monthlyTemperature(year, month)));

  const temperatureC = annualTemperature(latest);
  const rainfallMm = annualRainfall(latest);
  const baselineTemperatureC = mean(baselineYears.map(annualTemperature));
  const baselineRainfallMm = mean(baselineYears.map(annualRainfall));
  const [longitude, latitude, elevationM] = raw.geometry.coordinates;

  return {
    id: site.id,
    name: site.name,
    region: site.region,
    latitude,
    longitude,
    elevationM: Math.round(elevationM),
    source: {
      title: raw.header.title,
      apiVersion: raw.header.api.version,
      inputs: raw.header.sources,
      firstYear,
      lastYear,
      temperature: { parameter: TEMPERATURE, name: raw.parameters[TEMPERATURE].longname },
      precipitation: { parameter: PRECIPITATION, name: raw.parameters[PRECIPITATION].longname },
    },
    year: latest,
    baseline: { start: baseline.start, end: baseline.end },
    months: MONTHS.map((month) => ({
      month,
      temperatureC: monthlyTemperature(latest, month),
      rainfallMm: round(monthlyRainfall(latest, month), 1),
      baselineTemperatureC: round(mean(baselineYears.map((year) => monthlyTemperature(year, month))), 2),
      baselineRainfallMm: round(mean(baselineYears.map((year) => monthlyRainfall(year, month))), 1),
    })),
    annual: {
      temperatureC: round(temperatureC, 2),
      rainfallMm: round(rainfallMm, 1),
      baselineTemperatureC: round(baselineTemperatureC, 2),
      baselineRainfallMm: round(baselineRainfallMm, 1),
      temperatureChangeC: round(temperatureC - baselineTemperatureC, 2),
      rainfallChangePct: round(((rainfallMm - baselineRainfallMm) / baselineRainfallMm) * 100, 1),
    },
  };
}

writeFileSync(outFile, `${JSON.stringify(SITES.map(summarise), null, 2)}\n`);
console.log(`Wrote ${fileURLToPath(outFile)}`);

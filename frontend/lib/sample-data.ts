import type { FarmSummary, KpiView, StrategyView } from "./view-models";

export const demoFarm: FarmSummary = {
  name: "Demo Farm",
  locationLabel: "Sample location",
  coordinates: "1.52° S, 37.26° E",
  areaHectares: 12,
  crop: "Maize",
  irrigation: "Rain-fed",
  period: "Jan – Dec 2025",
  historyRange: "2001 – 2025",
};

export const demoKpis: KpiView[] = [
  {
    kind: "temperature",
    label: "Average Temperature",
    value: "21.1",
    unit: "°C",
    source: "Sample data",
    change: "+0.6 °C above the 2001 – 2020 average",
    changeTone: "warning",
    footnote: "Jan – Dec 2025 · live source: NASA POWER",
  },
  {
    kind: "precipitation",
    label: "Total Precipitation",
    value: "796",
    unit: "mm",
    source: "Sample data",
    change: "7% below the 2001 – 2020 average",
    changeTone: "warning",
    footnote: "Jan – Dec 2025 · live source: GPM IMERG",
  },
  {
    kind: "soil-moisture",
    label: "Soil Moisture",
    value: "0.21",
    unit: "m³/m³",
    source: "Sample data",
    change: "Surface layer, top 5 cm",
    changeTone: "neutral",
    footnote: "Live source: NASA SMAP L3",
  },
  {
    kind: "risk",
    label: "Environmental Risk",
    value: "Moderate",
    source: "Calculated",
    change: "Warmer and drier than the baseline period",
    changeTone: "warning",
    footnote: "From temperature, rainfall and soil moisture, Jan – Dec 2025",
  },
];

export const demoStrategies: StrategyView[] = [
  {
    id: "baseline",
    kind: "baseline",
    position: 1,
    title: "Continue current rotation",
    summary: "Keep farming as you do now. The reference for the other two.",
    rotation: ["Maize", "Maize", "Maize"],
    sources: ["General agronomy"],
  },
  {
    id: "climate-adaptive",
    kind: "climate-adaptive",
    position: 2,
    title: "Water-efficient rotation",
    summary: "Keep maize, and add crops that usually need less water.",
    rotation: ["Maize", "Sorghum", "Cowpea"],
    sources: ["NASA POWER", "GPM IMERG", "NASA SMAP", "General agronomy"],
  },
  {
    id: "soil-restoration",
    kind: "soil-restoration",
    position: 3,
    title: "Soil-restoration rotation",
    summary: "Add legumes, cover crops and deep-rooted crops.",
    rotation: ["Maize + cover crop", "Pigeon pea", "Maize"],
    sources: ["NASA SMAP", "General agronomy"],
  },
];

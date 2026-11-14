import { climateEvidence } from "./climate-facts";
import type { ClimateSite } from "./data/climate";
import type { DataLabel, Level, RotationStep, Strategy, StrategyId, StrategyKind } from "./view-models";

export const strategiesAreIllustrative = true;

const ORDER: Record<StrategyId, { kind: StrategyKind; position: Strategy["position"] }> = {
  baseline: { kind: "baseline", position: 1 },
  water_efficient: { kind: "climate-adaptive", position: 2 },
  soil_restoration: { kind: "soil-restoration", position: 3 },
};

const COMMON_GAPS = [
  "No yield, price, soil or irrigation data was used.",
  "Sowing windows, markets and equipment were not checked; confirm with a local agronomist.",
];

const SOURCES: DataLabel[] = ["General agronomy", "NASA POWER"];

type Draft = {
  id: StrategyId;
  title: string;
  rotation: Array<[crop: string, role: string]>;
  why: string;
  benefits: string[];
  risks: string[];
  gaps?: string[];
  water_need: string;
  complexity: Level;
  confidence: Level;
};

const drafts: Record<string, Draft[]> = {
  norfolk: [
    {
      id: "baseline",
      title: "Wheat, beet and barley",
      rotation: [
        ["Winter wheat", "main crop"],
        ["Sugar beet", "break crop"],
        ["Spring barley", "main crop"],
      ],
      why: "A rotation many Norfolk arable farms already run. The other two are measured against it.",
      benefits: [
        "No change to your machinery, workload or buyers.",
        "Beet and barley break up the wheat years, which helps keep wheat diseases down.",
      ],
      risks: [
        "Sugar beet and spring barley rely on spring and summer rain, so a dry spring hits them hardest.",
        "Does not adapt to warmer or drier years.",
      ],
      water_need: "Same as now",
      complexity: "low",
      confidence: "medium",
    },
    {
      id: "water_efficient",
      title: "More autumn-sown crops",
      rotation: [
        ["Winter wheat", "main crop"],
        ["Oilseed rape", "autumn-sown break crop"],
        ["Winter barley", "autumn-sown crop"],
      ],
      why: "Crops sown in autumn root over winter and are usually harvested before late-summer dry spells, so they depend less on spring rain.",
      benefits: [
        "Roots are already deep when spring turns dry.",
        "Harvest comes earlier, before the driest part of summer.",
      ],
      risks: [
        "Oilseed rape can be hard to establish in a dry autumn and is open to pest damage.",
        "More of the year's work falls in autumn, which is already busy.",
      ],
      water_need: "Less summer water; most growth is done by early summer",
      complexity: "medium",
      confidence: "medium",
    },
    {
      id: "soil_restoration",
      title: "Beans and a cover crop",
      rotation: [
        ["Winter wheat", "main crop"],
        ["Field beans", "nitrogen-fixing crop"],
        ["Spring barley + cover crop", "main crop, then winter cover"],
      ],
      why: "Field beans fix their own nitrogen, and a cover crop after barley keeps the ground covered through winter.",
      benefits: [
        "Beans add nitrogen, so the next wheat crop may need less fertiliser.",
        "A winter cover crop protects the soil from heavy rain and adds organic matter.",
      ],
      risks: [
        "Bean yields can vary a lot from one year to the next.",
        "The cover crop needs seed, sowing and ending at the right time.",
      ],
      water_need: "About the same; the cover crop uses some soil water over winter",
      complexity: "medium",
      confidence: "medium",
    },
  ],
  nevada: [
    {
      id: "baseline",
      title: "Irrigated alfalfa",
      rotation: [
        ["Alfalfa", "hay crop"],
        ["Alfalfa", "hay crop"],
        ["Alfalfa", "hay crop"],
      ],
      why: "Alfalfa hay is the main irrigated crop in western Nevada's valleys. The other two are measured against it.",
      benefits: [
        "No change to your equipment, irrigation set-up or hay buyers.",
        "Alfalfa is a legume, so it adds nitrogen to the soil.",
      ],
      risks: [
        "Alfalfa needs irrigation over a long season, so a short water year hits it hard.",
        "Does not adapt to warmer or drier years.",
      ],
      water_need: "High; needs irrigation all season",
      complexity: "low",
      confidence: "medium",
    },
    {
      id: "water_efficient",
      title: "Shorter-season crops",
      rotation: [
        ["Alfalfa", "hay crop"],
        ["Winter wheat", "cool-season grain"],
        ["Teff", "summer hay crop"],
      ],
      why: "Winter wheat grows through the cooler months, and teff is a summer hay crop that usually needs less water than alfalfa.",
      benefits: [
        "Winter wheat uses winter and spring moisture, when less water is lost to the air.",
        "Teff can be cut for hay within one summer.",
      ],
      risks: [
        "Teff has a smaller hay market than alfalfa.",
        "Wheat and teff need different seeding and harvest timing from alfalfa.",
      ],
      gaps: ["How well teff yields on your ground was not checked."],
      water_need: "Lower than alfalfa every year",
      complexity: "high",
      confidence: "low",
    },
    {
      id: "soil_restoration",
      title: "Cover the ground",
      rotation: [
        ["Winter wheat + cover crop", "grain, then soil cover"],
        ["Alfalfa", "nitrogen-fixing hay crop"],
        ["Alfalfa", "nitrogen-fixing hay crop"],
      ],
      why: "A cover crop after wheat keeps dry soil from blowing away, and alfalfa, a legume, puts nitrogen back.",
      benefits: [
        "Cover holds dry soil in place when the wind blows.",
        "Alfalfa adds nitrogen back for the next wheat crop.",
      ],
      risks: [
        "The cover crop uses water, which is scarce here.",
        "The cover crop needs seed, sowing and ending at the right time.",
      ],
      water_need: "Some extra water to start the cover crop",
      complexity: "medium",
      confidence: "medium",
    },
  ],
};

const toStrategy = (draft: Draft, site: ClimateSite): Strategy => {
  const { rotation, gaps = [], ...rest } = draft;
  const steps: RotationStep[] = rotation.map(([crop, role], index) => ({
    year: (index + 1) as RotationStep["year"],
    crop,
    role,
  }));
  return {
    ...rest,
    ...ORDER[draft.id],
    rotation: steps,
    evidence: climateEvidence(site).map((statement) => ({
      type: "climate_data",
      statement,
      label: "Calculated",
      source: "NASA POWER",
    })),
    gaps: [...COMMON_GAPS, ...gaps],
    summary: draft.why,
    rotation_crops: steps.map((step) => step.crop),
    sources: SOURCES,
  };
};

export const strategiesFor = (site: ClimateSite): Strategy[] =>
  (drafts[site.id] ?? []).map((draft) => toStrategy(draft, site));

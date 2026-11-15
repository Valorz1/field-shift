import type { FarmProfile, KitAccess, MarketAccess, Priority, SoilType, WaterAccess } from "./session-store";
import { summerOnlyDrying } from "./climate-facts";
import type { Risk } from "./types";
import type { Strategy } from "./view-models";

// The farmer's answers about the farm, and how each of the 3 plans fits them.
// No AI and no scoring model: plain rules over what the plan already says (its crops, its water need and
// how big a change it is). The rules are written out below so a judge or a farmer can check every one.

export const PRIORITIES: { id: Priority; label: string; hint: string }[] = [
  { id: "water", label: "Use less water", hint: "Crops that need less water" },
  { id: "organic-matter", label: "Build organic matter", hint: "More roots and residue in the soil" },
  { id: "nitrogen", label: "Add nitrogen naturally", hint: "Legumes that fix nitrogen from the air" },
  { id: "erosion", label: "Stop soil washing away", hint: "Keep the ground covered" },
  { id: "pests", label: "Fewer pests and diseases", hint: "Break the cycle with a different crop" },
  { id: "forage", label: "Feed for livestock", hint: "Crops you can graze or cut" },
  { id: "market", label: "Easy to sell", hint: "Crops you already have a market for" },
  { id: "small-change", label: "Keep changes small", hint: "Little new kit or know-how" },
];

export const WATER_OPTIONS: { id: WaterAccess; label: string }[] = [
  { id: "rain-only", label: "Rain only" },
  { id: "some", label: "Some irrigation" },
  { id: "full", label: "Full irrigation" },
];

export const KIT_OPTIONS: { id: KitAccess; label: string }[] = [
  { id: "own", label: "Yes, my own kit" },
  { id: "contractor", label: "With a contractor" },
  { id: "none", label: "Not yet" },
];

export const MARKET_OPTIONS: { id: MarketAccess; label: string }[] = [
  { id: "yes", label: "Yes" },
  { id: "unsure", label: "Not sure" },
  { id: "no", label: "No" },
];

export const SOIL_OPTIONS: { id: SoilType; label: string; hint: string }[] = [
  { id: "sandy", label: "Sandy / light", hint: "Gritty, drains fast" },
  { id: "loam", label: "Loam / medium", hint: "Crumbly, a bit of both" },
  { id: "clay", label: "Clay / heavy", hint: "Sticky when wet, cracks when dry" },
  { id: "unsure", label: "Not sure", hint: "We will not use it" },
];

export const LEGUMES = ["bean", "pea", "chickpea", "cowpea", "lentil", "alfalfa", "lucerne", "clover", "vetch", "soy"];
// Crops that are often grazed or cut for feed. Wording in the app says "often" and "check the variety".
const FORAGE = ["alfalfa", "lucerne", "clover", "vetch", "sorghum", "ryegrass", "rye", "oats", "cowpea"];

const has = (list: string[], crop: string) => list.some((word) => crop.toLowerCase().includes(word));
const isCover = (crop: string) => crop.toLowerCase().includes("cover");
// "legume cover crop (hairy vetch or red clover)" -> "legume cover crop". species: "hairy vetch or red clover".
const plain = (crop: string) => crop.replace(/\s*\(.*\)\s*$/, "").trim();
const species = (crop: string) => crop.match(/\((.*)\)/)?.[1] ?? plain(crop);
const join = (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0]);
const list = (crops: string[]) => join(crops.map(plain));

export type PlanTraits = {
  newCrops: string[];
  coverCrops: string[];
  cashCrops: string[];
  legumes: string[];
  forage: string[];
  savesWater: boolean;
};

export function planTraits(strategy: Strategy): PlanTraits {
  const current = strategy.rotation[0]?.crop ?? "";
  const newCrops = [...new Set(strategy.rotation.map((step) => step.crop))].filter((crop) => crop !== current);
  return {
    newCrops,
    coverCrops: newCrops.filter(isCover),
    cashCrops: newCrops.filter((crop) => !isCover(crop)),
    legumes: newCrops.filter((crop) => has(LEGUMES, crop)),
    forage: newCrops.filter((crop) => has(FORAGE, crop)),
    // Same rule as the plan card: "uses less water" only when the engine's rules back it up.
    savesWater: strategy.water_need.startsWith("Lower"),
  };
}

// "at Norfolk demo farm", but "on your field" for a dropped pin.
export const placeText = (name: string) => (name.toLowerCase() === "your field" ? "on your field" : `at ${name}`);

// good: fits a priority or a condition. check: sort this out first. note: worth knowing, neither for nor against.
export type FitNote = { tone: "good" | "check" | "note"; text: string };
export type PlanFit = { notes: FitNote[]; matches: number; asked: number };

export const hasProfile = (profile?: FarmProfile) =>
  Boolean(
    profile &&
      ((profile.priorities?.length ?? 0) > 0 ||
        profile.water ||
        profile.kit ||
        profile.market ||
        (profile.soilType && profile.soilType !== "unsure") ||
        profile.organicMatter !== undefined),
  );

// How one plan fits the farmer's answers. "good" = it matches a priority or suits a condition;
// "check" = something the farmer should sort out or look at before choosing it.
export function planFit(strategy: Strategy, profile: FarmProfile | undefined, risk?: Risk): PlanFit {
  const notes: FitNote[] = [];
  const t = planTraits(strategy);
  const current = plain(strategy.rotation[0]?.crop ?? "your crop");
  const priorities = profile?.priorities ?? [];
  const good = (text: string) => notes.push({ tone: "good", text });
  const check = (text: string) => notes.push({ tone: "check", text });
  const note = (text: string) => notes.push({ tone: "note", text });

  for (const priority of priorities) {
    if (priority === "water") {
      if (t.savesWater) good("Uses less water: the rules list these crops as lower-water.");
      else if (t.coverCrops.length) check("A cover crop uses some soil water between your main crops.");
      else if (strategy.kind === "baseline") note("Same water use as now.");
      // Cool-climate rules (e.g. Norfolk) give no water figures, so we say so rather than guess.
      else note("The rules have no water-use figures for these crops, so we cannot say if this plan uses less water.");
    }
    if (priority === "organic-matter" && t.coverCrops.length)
      good("Adds organic matter: the cover crop puts roots and residue back into the soil.");
    if (priority === "nitrogen" && t.legumes.length)
      good(`Adds nitrogen: the legumes in this plan (${join(t.legumes.map(species))}) take nitrogen from the air and leave some for the next crop.`);
    if (priority === "erosion" && t.coverCrops.length)
      good("Keeps the ground covered between crops, which cuts soil loss from wind and rain.");
    if (priority === "pests") {
      // A different main crop is not a host for most of the current crop's pests and diseases.
      if (t.cashCrops.length) good(`Breaks the pest and disease cycle: ${list(t.cashCrops)} between your ${current}.`);
      else if (strategy.kind === "baseline" && !strategy.current_crop_is_perennial)
        check(`Same crop every year: ${current} pests and diseases can build up.`);
    }
    if (priority === "forage" && t.forage.length)
      good(`Feed for livestock: ${join(t.forage.map(species))} can often be grazed or cut (check the variety).`);
    if (priority === "market") {
      if (t.cashCrops.length === 0) good("No new crop to sell: you keep your current market.");
      else if (profile?.market !== "yes") check(`New crops to sell: ${list(t.cashCrops)}. Check there is a buyer near you.`);
    }
    if (priority === "small-change") {
      if (strategy.complexity === "low") good("A small change to how you farm now.");
      else if (strategy.complexity === "high") check("A big change: new crops, kit and know-how.");
    }
  }

  // How many of the farmer's priorities this plan meets (each priority adds at most one "good" note).
  const matches = notes.filter((note) => note.tone === "good").length;

  // Constraints: water, kit and market.
  if (profile?.market && profile.market !== "yes" && t.cashCrops.length && !priorities.includes("market"))
    check(`You said you ${profile.market === "no" ? "have no" : "are not sure of a"} buyer for new crops: ${list(t.cashCrops)}. Find one first.`);
  const jobs = [
    t.cashCrops.length ? `sow and harvest ${list(t.cashCrops)}` : "",
    t.coverCrops.length ? "sow and end the cover crop" : "",
  ].filter(Boolean);
  if (profile?.kit === "none" && jobs.length) check(`You would need new kit or a contractor to ${join(jobs)}.`);
  if (profile?.kit === "contractor" && jobs.length) note(`Book a contractor early to ${join(jobs)}.`);
  if (profile?.water === "rain-only") {
    if (t.savesWater) good("Suits a field with no irrigation.");
    else if (strategy.kind === "baseline" && risk?.drivers.drying.triggered)
      check(`You have no irrigation, and ${risk && summerOnlyDrying(risk) ? "summers here are" : "rain here is"} getting drier.`);
  }
  if (profile?.water === "full" && t.savesWater) good("Could cut your irrigation water in some years.");

  // Soil type, from the farmer. General agronomy, not a measurement.
  if (profile?.soilType === "sandy") {
    if (t.coverCrops.length) good("On sandy soil, a cover crop helps hold water and nutrients.");
    else if (strategy.kind === "baseline" && risk?.drivers.drying.triggered)
      check("Sandy soil dries out fast in a dry summer.");
  }
  if (profile?.soilType === "clay" && t.coverCrops.length)
    check("On clay, check you can get onto the land to sow and end the cover crop in time.");
  if (profile?.organicMatter !== undefined && strategy.kind === "soil-restoration")
    note(`Your soil test says ${profile.organicMatter}% organic matter. Test again in 3 years to see if this plan is working.`);

  return { notes, matches, asked: priorities.length };
}

// The plan that matches the most priorities, if one clearly does. Ties give none: we do not pick for the farmer.
export function bestMatch(strategies: Strategy[], profile: FarmProfile | undefined, risk?: Risk) {
  if (!profile?.priorities?.length) return undefined;
  // Ranked by how many of the farmer's priorities a plan meets, then by fewer things to check.
  // Other notes (soil, water) never decide it. A plan that meets none is never the best fit, and ties give none.
  const ranked = strategies
    .map((strategy) => {
      const fit = planFit(strategy, profile, risk);
      return { id: strategy.id, matches: fit.matches, checks: fit.notes.filter((note) => note.tone === "check").length };
    })
    .sort((a, b) => b.matches - a.matches || a.checks - b.checks);
  const [first, second] = ranked;
  if (!first || first.matches === 0) return undefined;
  if (second && second.matches === first.matches && second.checks === first.checks) return undefined;
  return first.id;
}

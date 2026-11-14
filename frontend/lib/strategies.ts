import type { ClimateSite } from "./data/climate";
import type { StrategyView } from "./view-models";

const rotations: Record<string, StrategyView[]> = {
  norfolk: [
    {
      id: "baseline",
      kind: "baseline",
      position: 1,
      title: "Wheat, beet and barley",
      summary: "A rotation many Norfolk arable farms already run. The other two are measured against it.",
      rotation: ["Winter wheat", "Sugar beet", "Spring barley"],
      sources: ["General agronomy"],
    },
    {
      id: "climate-adaptive",
      kind: "climate-adaptive",
      position: 2,
      title: "More autumn-sown crops",
      summary:
        "Crops sown in autumn root over winter and are usually harvested before late-summer dry spells, so they depend less on spring rain.",
      rotation: ["Winter wheat", "Oilseed rape", "Winter barley"],
      sources: ["General agronomy"],
    },
    {
      id: "soil-restoration",
      kind: "soil-restoration",
      position: 3,
      title: "Beans and a cover crop",
      summary:
        "Field beans fix their own nitrogen, and a cover crop after barley keeps the ground covered through winter.",
      rotation: ["Winter wheat", "Field beans", "Spring barley + cover crop"],
      sources: ["General agronomy"],
    },
  ],
  nevada: [
    {
      id: "baseline",
      kind: "baseline",
      position: 1,
      title: "Irrigated alfalfa",
      summary: "Alfalfa hay is the main irrigated crop in western Nevada's valleys. The other two are measured against it.",
      rotation: ["Alfalfa", "Alfalfa", "Alfalfa"],
      sources: ["General agronomy"],
    },
    {
      id: "climate-adaptive",
      kind: "climate-adaptive",
      position: 2,
      title: "Shorter-season crops",
      summary:
        "Winter wheat grows through the cooler months, and teff is a summer hay crop that usually needs less water than alfalfa.",
      rotation: ["Alfalfa", "Winter wheat", "Teff"],
      sources: ["General agronomy"],
    },
    {
      id: "soil-restoration",
      kind: "soil-restoration",
      position: 3,
      title: "Cover the ground",
      summary:
        "A cover crop after wheat keeps dry soil from blowing away, and alfalfa, a legume, puts nitrogen back.",
      rotation: ["Winter wheat + cover crop", "Alfalfa", "Alfalfa"],
      sources: ["General agronomy"],
    },
  ],
};

export const strategiesFor = (site: ClimateSite): StrategyView[] => rotations[site.id] ?? [];

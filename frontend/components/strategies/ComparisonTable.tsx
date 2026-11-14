"use client";

import { Columns3, Droplets, Repeat, Sprout } from "lucide-react";
import { SectionTitle } from "@/components/layout/SectionTitle";
import { cx } from "@/lib/cx";
import type { Place } from "@/lib/data/climate";
import { useStrategies } from "@/lib/use-strategies";
import type { Level, Strategy, StrategyKind } from "@/lib/view-models";
import { aimWatch, kindLabel, shortTitle } from "./StrategyCard";

const icons: Record<StrategyKind, typeof Repeat> = {
  baseline: Repeat,
  "climate-adaptive": Droplets,
  "soil-restoration": Sprout,
};
const tiles: Record<StrategyKind, string> = {
  baseline: "bg-green-tint text-green-ink",
  "climate-adaptive": "bg-water-tint text-water-ink",
  "soil-restoration": "bg-earth-tint text-earth-ink",
};
const steps: Record<Level, number> = { low: 1, medium: 2, high: 3 };
const words: Record<Level, string> = { low: "Low", medium: "Medium", high: "High" };
const change: Record<Level, string> = { low: "Small", medium: "Some", high: "Big" };

// The engine's water sentence, shortened. The full sentence is on each plan card.
const water = (s: Strategy) => {
  if (s.kind === "baseline") return "Same as now";
  if (s.water_need.startsWith("Lower")) return "Lower in some years";
  if (s.water_need.startsWith("Not compared")) return "Not compared (no figures)";
  return "Cover crop uses some soil water";
};

function Meter({ level, text }: { level: Level; text: string }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden="true" className="flex gap-1">
        {[1, 2, 3].map((n) => (
          <span key={n} className={cx("h-2 w-5 rounded-full", n <= steps[level] ? "bg-forest" : "bg-neutral-tint")} />
        ))}
      </span>
      {text}
    </span>
  );
}

const ROWS: { label: string; cell: (s: Strategy) => React.ReactNode }[] = [
  { label: "Next 3 years", cell: (s) => s.rotation.map((step) => step.crop.replace(/\s*\(.*\)/, "")).join(" → ") },
  { label: "Aim", cell: (s) => aimWatch(s).aim },
  { label: "Watch", cell: (s) => aimWatch(s).watch },
  { label: "Water", cell: water },
  { label: "Change", cell: (s) => <Meter level={s.complexity} text={change[s.complexity]} /> },
  { label: "Confidence", cell: (s) => <Meter level={s.confidence} text={words[s.confidence]} /> },
];

// The 3 plans side by side, one thing per row, so a farmer can compare at a glance.
export function ComparisonTable({ site }: { site: Place }) {
  const { data } = useStrategies(site);
  if (!data) return null;
  return (
    <section aria-labelledby="compare-heading" className="space-y-4">
      <SectionTitle id="compare-heading" icon={Columns3}>
        Compare the 3 plans
      </SectionTitle>
      <div className="fs-rise overflow-x-auto rounded-card border border-line bg-white">
        <table className="w-full min-w-[680px] border-collapse text-left text-base">
          <thead>
            <tr>
              <th scope="col" className="w-36 p-4">
                <span className="sr-only">Compare</span>
              </th>
              {data.strategies.map((s) => {
                const Icon = icons[s.kind];
                return (
                  <th key={s.id} scope="col" className="p-4 align-top">
                    <span className={cx("mb-2 grid size-10 place-items-center rounded-xl", tiles[s.kind])}>
                      <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
                    </span>
                    <span className="block text-xs font-semibold tracking-wide text-caption uppercase">
                      Option {s.position} · {kindLabel(s)}
                    </span>
                    <span className="block font-display text-lg leading-tight font-extrabold text-forest">
                      {shortTitle(s)}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(({ label, cell }) => (
              <tr key={label} className="border-t border-line even:bg-page/60">
                <th scope="row" className="p-4 align-top text-xs font-semibold tracking-wide text-caption uppercase">
                  {label}
                </th>
                {data.strategies.map((s) => (
                  <td key={s.id} className="p-4 align-top text-ink">
                    {cell(s)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

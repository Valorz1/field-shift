"use client";

import { Columns3 } from "lucide-react";
import { SectionTitle } from "@/components/layout/SectionTitle";
import type { Place } from "@/lib/data/climate";
import { useStrategies } from "@/lib/use-strategies";
import type { Level, Strategy } from "@/lib/view-models";
import { aimWatch, kindLabel } from "./StrategyCard";

const levels: Record<Level, string> = { low: "Low", medium: "Medium", high: "High" };
const change: Record<Level, string> = { low: "Small", medium: "Some", high: "Big" };

const ROWS: { label: string; value: (s: Strategy) => string }[] = [
  { label: "Next 3 years", value: (s) => s.rotation.map((step) => step.crop).join(" → ") },
  { label: "Aim", value: (s) => aimWatch(s).aim },
  { label: "Watch", value: (s) => aimWatch(s).watch },
  { label: "Water need", value: (s) => s.water_need },
  { label: "How much change", value: (s) => change[s.complexity] },
  { label: "How sure we are", value: (s) => levels[s.confidence] },
];

// The 3 plans side by side, row by row, so a farmer can compare one thing at a time.
export function ComparisonTable({ site }: { site: Place }) {
  const { data } = useStrategies(site);
  if (!data) return null;
  return (
    <section aria-labelledby="compare-heading" className="space-y-4">
      <SectionTitle id="compare-heading" icon={Columns3}>
        Compare the 3 plans
      </SectionTitle>
      <div className="overflow-x-auto rounded-card border border-line bg-white">
        <table className="w-full min-w-[640px] border-collapse text-left text-base">
          <thead>
            <tr className="bg-page">
              <th scope="col" className="w-40 p-3 text-sm font-semibold text-caption">
                <span className="sr-only">Compare</span>
              </th>
              {data.strategies.map((s) => (
                <th key={s.id} scope="col" className="p-3 align-bottom">
                  <span className="block text-sm font-semibold text-caption">
                    Option {s.position} · {kindLabel(s)}
                  </span>
                  <span className="block font-display text-lg font-bold text-forest">{s.title}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(({ label, value }) => (
              <tr key={label} className="border-t border-line">
                <th scope="row" className="p-3 align-top text-sm font-semibold text-caption">
                  {label}
                </th>
                {data.strategies.map((s) => (
                  <td key={s.id} className="p-3 align-top text-ink">
                    {value(s)}
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

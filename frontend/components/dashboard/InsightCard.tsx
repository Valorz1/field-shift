import { Flower2, Sun } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusTag } from "@/components/ui/StatusTag";
import type { SeasonInsight } from "@/lib/climate-facts";
import { cx } from "@/lib/cx";
import type { Status } from "@/lib/view-models";

const edges: Record<Status, string> = {
  fine: "border-l-success",
  watch: "border-l-warning",
  act: "border-l-danger",
};

export function InsightCard({ insight }: { insight: SeasonInsight }) {
  const Icon = insight.name === "Summer" ? Sun : Flower2;
  return (
    <Card as="article" className={cx("flex flex-col gap-3 border-l-[6px]", edges[insight.status])}>
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-water-tint text-water-ink">
          <Icon aria-hidden="true" className="size-6" strokeWidth={1.8} />
        </span>
        <div>
          <h3 className="font-display text-lg font-bold text-forest">{insight.name} rain</h3>
          <p className="text-base text-caption">{insight.span}</p>
        </div>
      </div>
      <StatusTag status={insight.status} className="self-start" />
      <p className="text-base text-ink">{insight.text}</p>
    </Card>
  );
}

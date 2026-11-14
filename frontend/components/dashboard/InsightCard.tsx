import { Card } from "@/components/ui/Card";
import { StatusTag } from "@/components/ui/StatusTag";
import type { SeasonInsight } from "@/lib/climate-facts";

export function InsightCard({ insight }: { insight: SeasonInsight }) {
  return (
    <Card as="article" className="flex flex-col gap-3">
      <div>
        <h3 className="font-display text-lg font-bold text-forest">{insight.name} rain</h3>
        <p className="text-base text-caption">{insight.span}</p>
      </div>
      <StatusTag status={insight.status} className="self-start" />
      <p className="text-base text-ink">{insight.text}</p>
    </Card>
  );
}

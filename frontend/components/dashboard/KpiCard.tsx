import { Droplet, Layers, type LucideIcon, Thermometer, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { cx } from "@/lib/cx";
import type { KpiKind, KpiView } from "@/lib/view-models";

const icons: Record<KpiKind, { icon: LucideIcon; tone: string }> = {
  temperature: { icon: Thermometer, tone: "bg-green-tint text-green-ink" },
  precipitation: { icon: Droplet, tone: "bg-water-tint text-water-ink" },
  "soil-moisture": { icon: Layers, tone: "bg-earth-tint text-earth-ink" },
  risk: { icon: TriangleAlert, tone: "bg-warning-tint text-warning-ink" },
};

export function KpiCard({ kpi }: { kpi: KpiView }) {
  const { icon: Icon, tone } = icons[kpi.kind];

  return (
    <Card as="article" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <span aria-hidden="true" className={cx("grid size-9 shrink-0 place-items-center rounded-inner", tone)}>
          <Icon className="size-5" strokeWidth={1.6} />
        </span>
        <SourceBadge source={kpi.source} />
      </div>
      <h3 className="text-sm font-semibold text-ink">{kpi.label}</h3>
      <p className="font-display text-[32px] leading-none font-extrabold text-forest tabular-nums">
        {kpi.value}
        {kpi.unit && <span className="ml-1.5 font-sans text-sm font-semibold text-ink">{kpi.unit}</span>}
      </p>
      <p className={cx("text-sm font-semibold", kpi.changeTone === "warning" ? "text-warning-ink" : "text-ink")}>
        {kpi.change}
      </p>
      <p className="mt-auto text-xs text-caption">{kpi.footnote}</p>
    </Card>
  );
}

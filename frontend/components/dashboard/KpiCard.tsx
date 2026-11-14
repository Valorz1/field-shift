import { Card } from "@/components/ui/Card";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { StatusTag } from "@/components/ui/StatusTag";
import { cx } from "@/lib/cx";
import type { KpiView } from "@/lib/view-models";

export function KpiCard({ kpi }: { kpi: KpiView }) {
  const muted = kpi.source === "Missing" || kpi.waiting;

  return (
    <Card as="article" className="flex flex-col gap-3">
      <div className="flex flex-col items-start gap-1.5">
        <h3 className="text-base font-semibold text-ink">{kpi.label}</h3>
        <SourceBadge source={kpi.source} />
      </div>
      <p
        className={cx(
          "font-display leading-none font-extrabold tabular-nums",
          muted ? "text-2xl text-neutral-ink" : "text-[40px] text-forest",
        )}
      >
        {kpi.value}
        {kpi.unit && <span className="ml-1 font-sans text-xl font-semibold text-ink">{kpi.unit}</span>}
      </p>
      {kpi.status && <StatusTag status={kpi.status} className="self-start" />}
      <p className="text-base text-caption">{kpi.meaning}</p>
    </Card>
  );
}

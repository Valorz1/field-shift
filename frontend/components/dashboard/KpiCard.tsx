import { CloudRain, Droplets, type LucideIcon, ShieldAlert, Thermometer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { StatusTag } from "@/components/ui/StatusTag";
import { cx } from "@/lib/cx";
import type { KpiKind, KpiView, Status } from "@/lib/view-models";

const icons: Record<KpiKind, LucideIcon> = {
  temperature: Thermometer,
  rain: CloudRain,
  "soil-wetness": Droplets,
  risk: ShieldAlert,
};

// The icon tile takes the colour of the status, so a farmer sees what needs attention before reading.
const tiles: Record<Status | "none", string> = {
  fine: "bg-green-tint text-green-ink",
  watch: "bg-warning-tint text-warning-ink",
  act: "bg-danger-tint text-danger-ink",
  none: "bg-water-tint text-water-ink",
};

export function KpiCard({ kpi }: { kpi: KpiView }) {
  const muted = kpi.source === "Missing" || kpi.waiting;
  const Icon = icons[kpi.kind];

  return (
    <Card as="article" className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className={cx("grid size-11 shrink-0 place-items-center rounded-xl", tiles[kpi.status ?? "none"])}>
          <Icon aria-hidden="true" className="size-6" strokeWidth={1.8} />
        </span>
        <h3 className="pt-0.5 text-base leading-snug font-semibold text-ink">{kpi.label}</h3>
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
      <SourceBadge source={kpi.source} className="mt-auto self-start" />
    </Card>
  );
}

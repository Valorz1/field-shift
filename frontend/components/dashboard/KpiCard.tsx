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

type Compare = NonNullable<KpiView["compare"]>;

// Two bars from zero, the usual figure and the recent one. The numbers are written on them, so the bars
// never have to carry the meaning alone.
function CompareBars({ usualLabel, recentLabel, usual, recent, unit, digits }: Compare) {
  const max = Math.max(usual, recent) * 1.12 || 1;
  const rows = [
    { label: usualLabel, value: usual, bar: "bg-sage/50", text: "text-caption" },
    { label: recentLabel, value: recent, bar: "bg-forest", text: "font-semibold text-forest" },
  ];
  return (
    <ul className="space-y-1.5" aria-label={`${recentLabel} compared with ${usualLabel}`}>
      {rows.map((row) => (
        <li key={row.label} className="flex items-center gap-2 text-sm">
          <span className={cx("w-[88px] shrink-0 whitespace-nowrap", row.text)}>{row.label}</span>
          <span aria-hidden="true" className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-tint">
            <span className={cx("block h-full rounded-full", row.bar)} style={{ width: `${Math.max((row.value / max) * 100, 3)}%` }} />
          </span>
          <span className={cx("w-[62px] shrink-0 text-right tabular-nums", row.text)}>
            {row.value.toFixed(digits)} {unit}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function KpiCard({ kpi, index = 0 }: { kpi: KpiView; index?: number }) {
  const muted = kpi.source === "Missing" || kpi.waiting;
  const Icon = icons[kpi.kind];

  return (
    <Card as="article" className="fs-rise fs-lift flex flex-col gap-3" style={{ animationDelay: `${index * 70}ms` }}>
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
      {kpi.compare && !muted && <CompareBars {...kpi.compare} />}
      <p className={cx("text-base text-caption", kpi.compare && !muted && "border-t border-line pt-3")}>{kpi.meaning}</p>
      <SourceBadge source={kpi.source} className="mt-auto self-start" />
    </Card>
  );
}

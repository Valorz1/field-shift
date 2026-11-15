import { Flower2, Sun } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusTag } from "@/components/ui/StatusTag";
import { seasonInsights, usualYears } from "@/lib/climate-facts";
import type { ClimateSite } from "@/lib/data/climate";
import { formatSigned } from "@/lib/format";
import { cx } from "@/lib/cx";

function Bar({ label, value, max, recent }: { label: string; value: number; max: number; recent?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={cx("w-[88px] shrink-0 whitespace-nowrap", recent ? "font-semibold text-forest" : "text-caption")}>{label}</span>
      <span aria-hidden="true" className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-tint">
        <span
          className={cx("block h-full rounded-full", recent ? "bg-forest" : "bg-sage/50")}
          style={{ width: `${Math.max((value / max) * 100, 3)}%` }}
        />
      </span>
      <span className={cx("w-[58px] shrink-0 text-right tabular-nums", recent ? "font-semibold text-forest" : "text-caption")}>
        {value} mm
      </span>
    </div>
  );
}

// Spring and summer rain, recent years against usual. One card, so the two seasons read side by side.
export function SeasonalRain({ site }: { site: ClimateSite }) {
  const seasons = seasonInsights(site);
  const max = Math.max(...seasons.flatMap((season) => [season.rain, season.usual])) * 1.12;
  return (
    <Card className="fs-rise grid gap-6 md:grid-cols-2 md:gap-0 md:divide-x md:divide-line">
      {seasons.map((season, index) => {
        const Icon = season.name === "Summer" ? Sun : Flower2;
        return (
          <article key={season.name} className={cx("space-y-3", index === 1 && "md:pl-6", index === 0 && "md:pr-6")}>
            <header className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-water-tint text-water-ink">
                <Icon aria-hidden="true" className="size-6" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-bold text-forest">{season.name} rain</h3>
                <p className="text-base text-caption">{season.span}</p>
              </div>
              <span className="font-display text-xl font-extrabold text-forest tabular-nums">
                {formatSigned(season.percent, 0)}%
              </span>
            </header>
            <div className="space-y-1.5" role="img" aria-label={`${season.name} rain: ${season.rain} mm in ${site.year}, ${season.usual} mm usual`}>
              <Bar label={site.year} value={season.rain} max={max} recent />
              <Bar label={usualYears(site)} value={season.usual} max={max} />
            </div>
            <StatusTag status={season.status} className="self-start" />
            <p className="text-base text-ink">{season.text}</p>
          </article>
        );
      })}
    </Card>
  );
}

import { Droplet, type LucideIcon, Scale, Sprout } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { cx } from "@/lib/cx";
import type { StrategyKind, StrategyView } from "@/lib/view-models";

const accents: Record<StrategyKind, { label: string; icon: LucideIcon; bar: string; iconTone: string; year: string }> =
  {
    baseline: {
      label: "Baseline",
      icon: Scale,
      bar: "border-t-fresh",
      iconTone: "text-green-ink",
      year: "bg-green-tint",
    },
    "climate-adaptive": {
      label: "Climate-adaptive",
      icon: Droplet,
      bar: "border-t-water",
      iconTone: "text-water-ink",
      year: "bg-water-tint",
    },
    "soil-restoration": {
      label: "Soil-restoration",
      icon: Sprout,
      bar: "border-t-earth",
      iconTone: "text-earth-ink",
      year: "bg-earth-tint",
    },
  };

export function StrategyCard({ strategy }: { strategy: StrategyView }) {
  const accent = accents[strategy.kind];
  const Icon = accent.icon;
  const titleId = `strategy-${strategy.id}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className={cx("flex flex-col gap-4 rounded-card border border-t-4 border-line bg-white p-5", accent.bar)}
    >
      <div className="space-y-2">
        <Icon aria-hidden="true" className={cx("size-5", accent.iconTone)} strokeWidth={1.6} />
        <p className="text-xs font-medium tracking-wider text-caption uppercase">
          Strategy {strategy.position} · {accent.label}
        </p>
        <h3 id={titleId} className="font-display text-lg font-bold text-forest">
          {strategy.title}
        </h3>
        <p className="text-sm text-caption">{strategy.summary}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-semibold text-ink">Proposed rotation</h4>
          <SourceBadge source="Sample data" />
        </div>
        <ol className="grid grid-cols-3 gap-2">
          {strategy.rotation.map((crop, index) => (
            <li key={index} className={cx("rounded-inner px-3 py-2", accent.year)}>
              <span className="block text-xs text-caption">Year {index + 1}</span>
              <span className="block text-sm font-semibold text-ink">{crop}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-caption">Based on</span>
        {strategy.sources.map((source) => (
          <SourceBadge key={source} source={source} />
        ))}
      </div>

      <ButtonLink
        href={`/strategies/${strategy.id}`}
        variant="secondary"
        className="mt-auto w-full"
        aria-label={`Explore Strategy ${strategy.position}: ${strategy.title}`}
      >
        Explore Strategy
      </ButtonLink>
    </article>
  );
}

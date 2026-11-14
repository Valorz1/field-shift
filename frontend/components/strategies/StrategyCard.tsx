import { ArrowRight, ChevronDown, Droplets, type LucideIcon, Repeat, Sprout } from "lucide-react";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { cx } from "@/lib/cx";
import type { Evidence, Level, Strategy, StrategyKind } from "@/lib/view-models";

// "Uses less water" only when the rules back it up: the water need then starts with "Lower".
// In a cool climate like Norfolk the rules give no water figures, so the plan is about suiting the climate.
export const kindLabel = (strategy: Strategy) => {
  if (strategy.kind === "baseline") return "What you do now";
  if (strategy.kind === "soil-restoration") return "Builds up the soil";
  return strategy.water_need.startsWith("Lower") ? "Uses less water" : "Crops suited to your climate";
};

const kindStyles: Record<StrategyKind, { border: string; tile: string; chip: string; icon: LucideIcon }> = {
  baseline: { border: "border-t-fresh", tile: "bg-green-tint text-green-ink", chip: "bg-green-tint text-green-ink", icon: Repeat },
  "climate-adaptive": { border: "border-t-water", tile: "bg-water-tint text-water-ink", chip: "bg-water-tint text-water-ink", icon: Droplets },
  "soil-restoration": { border: "border-t-earth", tile: "bg-earth-tint text-earth-ink", chip: "bg-earth-tint text-earth-ink", icon: Sprout },
};

// Two short lines, like our design: what the plan is for, and what to watch out for.
export const aimWatch = (strategy: Strategy): { aim: string; watch: string } => {
  if (strategy.kind === "baseline") return { aim: "Keep farming as you do now", watch: "Water if summers get drier" };
  if (strategy.kind === "soil-restoration")
    return { aim: "Stronger soil over time", watch: "Benefits take a few seasons; cover crops use some soil water" };
  return strategy.water_need.startsWith("Lower")
    ? { aim: "Use less water in some years", watch: "New seed, kit and a buyer for the new crop" }
    : { aim: "Spread your risk with crops that suit your climate", watch: "New seed, kit and a buyer for the new crop" };
};

const changeLabels: Record<Level, string> = {
  low: "Small change",
  medium: "Some change",
  high: "Big change",
};

const levelSteps: Record<Level, number> = { low: 1, medium: 2, high: 3 };

const confidenceLabels: Record<Level, string> = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
};

function LevelMeter({ level }: { level: Level }) {
  return (
    <span className="flex items-center gap-3">
      <span aria-hidden="true" className="flex gap-1">
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            className={cx(
              "h-2.5 w-6 rounded-full",
              step <= levelSteps[level] ? "bg-forest" : "border border-sage bg-neutral-tint",
            )}
          />
        ))}
      </span>
      {changeLabels[level]}
    </span>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <h4 className="font-semibold text-ink">{title}</h4>
      <ul className="list-disc space-y-1 pl-5 marker:text-sage">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function EvidenceItem({ evidence }: { evidence: Evidence }) {
  if (evidence.type === "climate_data") {
    return (
      <li>
        {evidence.statement}
        <span className="block text-sm text-caption">
          {evidence.label} from {evidence.source}
        </span>
      </li>
    );
  }
  return (
    <li>
      {evidence.statement}
      {evidence.sources.map((source) => (
        <a
          key={source.id}
          href={source.url}
          className="flex min-h-12 items-center text-caption underline underline-offset-2 hover:text-forest"
        >
          {source.citation}
        </a>
      ))}
    </li>
  );
}

type StrategyCardProps = { strategy: Strategy; illustrative?: boolean };

export function StrategyCard({ strategy, illustrative = false }: StrategyCardProps) {
  const titleId = `strategy-${strategy.id}-title`;
  const style = kindStyles[strategy.kind];
  const Icon = style.icon;
  const { aim, watch } = aimWatch(strategy);

  return (
    <article
      aria-labelledby={titleId}
      className={cx(
        "flex flex-col gap-4 rounded-card border border-t-[6px] border-line bg-white p-4 text-base sm:p-5",
        style.border,
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cx("grid size-12 shrink-0 place-items-center rounded-xl", style.tile)}>
          <Icon aria-hidden="true" className="size-6" strokeWidth={1.8} />
        </span>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-caption">
            Option {strategy.position} · {kindLabel(strategy)}
            {illustrative && <span className="sr-only">: a sample plan, not yet worked out for your farm</span>}
          </p>
          <h3 id={titleId} className="font-display text-xl leading-snug font-bold text-forest">
            {strategy.title}
          </h3>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-caption">Your next 3 years</h4>
        <ol className="flex flex-wrap items-center gap-1.5">
          {strategy.rotation.map((step, i) => (
            <li key={step.year} className="flex items-center gap-1.5">
              {i > 0 && <ArrowRight aria-hidden="true" className="size-4 text-caption" strokeWidth={2} />}
              <span className={cx("rounded-full px-3 py-1.5 text-base font-semibold", style.chip)}>
                <span className="sr-only">Year {step.year}: </span>
                {step.crop}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <dl className="space-y-1.5">
        <div>
          <dt className="inline font-semibold text-ink">Aim: </dt>
          <dd className="inline text-ink">{aim}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-ink">Watch: </dt>
          <dd className="inline text-ink">{watch}</dd>
        </div>
      </dl>

      <dl className="space-y-2 rounded-inner bg-page p-3">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <dt className="text-sm font-semibold text-caption">How much change</dt>
          <dd className="text-ink">
            <LevelMeter level={strategy.complexity} />
          </dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <dt className="text-sm font-semibold text-caption">How sure we are</dt>
          <dd className="text-ink">{confidenceLabels[strategy.confidence]}</dd>
        </div>
      </dl>

      <details className="group rounded-inner border border-line">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 rounded-inner px-4 font-semibold text-forest [&::-webkit-details-marker]:hidden">
          Why we suggest this
          <ChevronDown
            aria-hidden="true"
            className="size-5 shrink-0 transition-transform group-open:rotate-180"
            strokeWidth={1.6}
          />
        </summary>
        <div className="space-y-4 border-t border-line p-4">
          <p className="text-ink">{strategy.why}</p>
          <div className="space-y-1">
            <h4 className="font-semibold text-ink">Water need</h4>
            <p>{strategy.water_need}</p>
          </div>
          <ListSection title="What could go well" items={strategy.benefits} />
          <ListSection title="What could go wrong" items={strategy.risks} />
          <ListSection title="What we did not check" items={strategy.gaps} />
          {strategy.evidence.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="font-semibold text-ink">What this is based on</h4>
              <ul className="space-y-2">
                {strategy.evidence.map((item) => (
                  <EvidenceItem key={item.statement} evidence={item} />
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm text-caption">Sources</span>
            {strategy.sources.map((source) => (
              <SourceBadge key={source} source={source} />
            ))}
          </div>
        </div>
      </details>

    </article>
  );
}

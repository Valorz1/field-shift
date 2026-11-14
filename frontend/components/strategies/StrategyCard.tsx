import { ChevronDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { cx } from "@/lib/cx";
import type { Evidence, Level, Strategy, StrategyKind } from "@/lib/view-models";

const kindLabels: Record<StrategyKind, string> = {
  baseline: "What you do now",
  "climate-adaptive": "Uses less water",
  "soil-restoration": "Builds up the soil",
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

function OptionBadge({ position, illustrative }: { position: number; illustrative: boolean }) {
  return (
    <p className="self-start rounded-full bg-forest px-3 py-1 text-base font-semibold text-white">
      Option {position}
      {illustrative && <span className="sr-only">: a sample plan, not yet worked out for your farm</span>}
    </p>
  );
}

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

  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col gap-5 rounded-card border border-line bg-white p-4 text-base sm:p-5"
    >
      <OptionBadge position={strategy.position} illustrative={illustrative} />

      <div className="space-y-1">
        <p className="text-sm font-medium text-caption">
          Option {strategy.position} of 3 · {kindLabels[strategy.kind]}
        </p>
        <h3 id={titleId} className="font-display text-xl font-bold text-forest">
          {strategy.title}
        </h3>
      </div>

      <div className="space-y-1">
        <p className="text-base font-semibold text-caption">What this means for your field</p>
        <p className="text-ink">{strategy.why}</p>
      </div>

      <div className="space-y-1">
        <h4 className="text-base font-semibold text-caption">Your next 3 years</h4>
        <ol className="divide-y divide-line">
          {strategy.rotation.map((step) => (
            <li key={step.year} className="flex gap-3 py-2.5">
              <span className="w-16 shrink-0 pt-0.5 text-base font-semibold text-caption">Year {step.year}</span>
              <span>
                <span className="block text-lg leading-snug font-semibold text-ink">{step.crop}</span>
                <span className="block text-base text-caption">{step.role}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <dl className="space-y-3 rounded-inner bg-page p-4">
        <div>
          <dt className="text-base font-semibold text-caption">Water need</dt>
          <dd className="text-ink">{strategy.water_need}</dd>
        </div>
        <div>
          <dt className="text-base font-semibold text-caption">How much change</dt>
          <dd className="text-ink">
            <LevelMeter level={strategy.complexity} />
          </dd>
        </div>
        <div>
          <dt className="text-base font-semibold text-caption">How sure we are</dt>
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

      <ButtonLink
        href={`/strategies/${strategy.id}`}
        variant="secondary"
        className="mt-auto w-full"
        aria-label={`See the full plan for option ${strategy.position}: ${strategy.title}`}
      >
        See the full plan
      </ButtonLink>
    </article>
  );
}

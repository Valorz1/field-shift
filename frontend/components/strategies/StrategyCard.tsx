import { Bean, ChevronDown, Droplets, Leaf, type LucideIcon, Repeat, Sprout, Wheat } from "lucide-react";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { BestMatchBadge, PlanFitList } from "./PlanFit";
import { cx } from "@/lib/cx";
import { LEGUMES, type PlanFit } from "@/lib/farm-profile";
import type { FarmProfile } from "@/lib/session-store";
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

// Short titles a farmer can scan. The engine's full title stays in "Why we suggest this".
export const shortTitle = (strategy: Strategy) => {
  const crop = strategy.rotation[0]?.crop ?? "your crop";
  if (strategy.kind === "baseline") return `Keep growing ${crop}`;
  if (strategy.kind === "soil-restoration")
    return strategy.title.toLowerCase().includes("non-legume") ? "Add a cover crop" : "Add a legume cover crop";
  return strategy.water_need.startsWith("Lower") ? "Add lower-water crops" : "Mix in crops that suit your climate";
};



// "legume cover crop (hairy vetch or red clover)" -> name "Legume cover crop", detail "hairy vetch or red clover".
const splitCrop = (crop: string) => {
  const match = crop.match(/^(.*?)\s*\((.*)\)\s*$/);
  const name = (match ? match[1] : crop).trim();
  return { name: name[0].toUpperCase() + name.slice(1), detail: match?.[2] };
};

const cropIcon = (crop: string): LucideIcon => {
  const text = crop.toLowerCase();
  if (text.includes("cover")) return Leaf;
  return LEGUMES.some((legume) => text.includes(legume)) ? Bean : Wheat;
};

export const changeLabels: Record<Level, string> = {
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

function LevelMeter({ level, label }: { level: Level; label?: string }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden="true" className="flex gap-1">
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            className={cx(
              "h-2 w-4 rounded-full",
              step <= levelSteps[level] ? "bg-forest" : "border border-sage bg-neutral-tint",
            )}
          />
        ))}
      </span>
      {(label ?? changeLabels[level]).replace(" confidence", "").replace(" change", "")}
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

// The 3 years side by side. compact: for the small plan cards, where the crop's detail would not fit.
export function YearTiles({ strategy, compact = false }: { strategy: Strategy; compact?: boolean }) {
  const style = kindStyles[strategy.kind];
  return (
    <ol aria-label="Your next 3 years" className="grid grid-cols-3 gap-2">
      {strategy.rotation.map((step) => {
        const { name, detail } = splitCrop(step.crop);
        const CropIcon = cropIcon(step.crop);
        const same = step.crop === strategy.rotation[0]?.crop;
        return (
          <li
            key={step.year}
            className={cx(
              "flex flex-col items-center gap-1 rounded-inner px-2 text-center",
              compact ? "py-2.5" : "py-3",
              same ? "bg-page" : style.chip,
            )}
          >
            <span className="text-xs font-semibold tracking-wide text-caption uppercase">Year {step.year}</span>
            <CropIcon aria-hidden="true" className={compact ? "size-5" : "size-6"} strokeWidth={1.8} />
            <span className="text-sm leading-tight font-bold">{name}</span>
            {detail && !compact && <span className="text-xs leading-tight text-caption">{detail}</span>}
          </li>
        );
      })}
    </ol>
  );
}

type StrategyCardProps = {
  strategy: Strategy;
  illustrative?: boolean;
  // The farmer's answers checked against this plan (lib/farm-profile.ts). Absent on sample plans.
  fit?: PlanFit;
  profile?: FarmProfile;
  best?: boolean;
};

export function StrategyCard({ strategy, illustrative = false, fit, profile, best = false }: StrategyCardProps) {
  const titleId = `strategy-${strategy.id}-title`;
  const style = kindStyles[strategy.kind];
  const Icon = style.icon;
  const { aim, watch } = aimWatch(strategy);

  return (
    <article
      aria-labelledby={titleId}
      className={cx(
        "fs-lift flex h-full flex-col gap-5 rounded-card border border-t-[6px] border-line bg-white p-5 text-base",
        style.border,
      )}
    >
      <header className="flex items-start gap-3">
        <span className={cx("grid size-12 shrink-0 place-items-center rounded-xl", style.tile)}>
          <Icon aria-hidden="true" className="size-6" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-semibold tracking-wide text-caption uppercase">
            Option {strategy.position} · {kindLabel(strategy)}
            {illustrative && <span className="sr-only">: a sample plan, not yet worked out for your farm</span>}
          </p>
          <h3 id={titleId} className="font-display text-[22px] leading-tight font-extrabold text-forest">
            {shortTitle(strategy)}
          </h3>
        </div>
      </header>

      {best && (
        <div>
          <BestMatchBadge />
        </div>
      )}

      <YearTiles strategy={strategy} />

      <dl className="space-y-2 text-base">
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 font-semibold text-forest">Aim</dt>
          <dd className="text-ink">{aim}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 font-semibold text-forest">Watch</dt>
          <dd className="text-ink">{watch}</dd>
        </div>
      </dl>

      {fit && (
        <div className="space-y-2 rounded-inner bg-page p-3">
          <h4 className="flex items-center justify-between gap-2 text-xs font-semibold tracking-wide text-caption uppercase">
            For your farm
            <SourceBadge source="Your input" className="normal-case tracking-normal" />
          </h4>
          <PlanFitList fit={fit} profile={profile} askHref="#farm" />
        </div>
      )}

      <dl className="mt-auto grid grid-cols-2 gap-2 border-t border-line pt-4">
        <div>
          <dt className="text-xs font-semibold tracking-wide text-caption uppercase">Change</dt>
          <dd className="mt-1 text-sm text-ink">
            <LevelMeter level={strategy.complexity} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-caption uppercase">Confidence</dt>
          <dd className="mt-1 text-sm text-ink">
            <LevelMeter level={strategy.confidence} label={confidenceLabels[strategy.confidence]} />
          </dd>
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
          <p className="font-semibold text-ink">{strategy.title}</p>
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

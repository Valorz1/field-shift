import { cx } from "@/lib/cx";
import type { DataLabel } from "@/lib/view-models";

const tones: Record<DataLabel, string> = {
  "NASA POWER": "bg-water-tint text-water-ink",
  "GPM IMERG": "bg-water-tint text-water-ink",
  "NASA SMAP": "bg-water-tint text-water-ink",
  Calculated: "bg-neutral-tint text-neutral-ink",
  "Your input": "bg-green-tint text-green-ink",
  AI: "border border-neutral-ink bg-white text-neutral-ink",
  "General agronomy": "bg-earth-tint text-earth-ink",
  "Sample data": "bg-warning-tint text-warning-ink",
  Missing: "border border-dashed border-neutral-ink bg-neutral-tint text-neutral-ink",
};

export function SourceBadge({ source, className }: { source: DataLabel; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-sm font-medium whitespace-nowrap",
        tones[source],
        className,
      )}
    >
      {source}
    </span>
  );
}

import { SourceBadge } from "@/components/ui/SourceBadge";
import type { DataLabel } from "@/lib/view-models";

// What each data source gives today. Kept honest: SMAP is shown as coming, not as connected.
const SOURCES: { source: DataLabel; text: string }[] = [
  { source: "NASA POWER", text: "Temperature, rain and soil wetness for any spot on Earth, monthly since 2001." },
  { source: "GPM IMERG", text: "Satellite rain for the two example farms, to check the NASA POWER rain." },
  { source: "NASA SMAP", text: "Satellite soil moisture. Coming next: not used in the plans yet." },
  { source: "AI", text: "Gemma 4, running on this computer. It explains the plans in 1 or 2 lines. It does not make them." },
];

export function DataSourceStatus() {
  return (
    <ul className="space-y-3">
      {SOURCES.map(({ source, text }) => (
        <li key={source} className="flex flex-col items-start gap-1">
          <SourceBadge source={source} />
          <span className="text-base text-ink">{text}</span>
        </li>
      ))}
    </ul>
  );
}

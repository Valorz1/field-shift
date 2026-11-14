import { Lock } from "lucide-react";
import type { FarmSummary } from "@/lib/view-models";
import { Logo } from "./Logo";

export function TopBar({ farm }: { farm: FarmSummary }) {
  return (
    <header className="sticky top-0 z-10">
      <div className="flex min-h-14 items-center bg-forest px-4 lg:hidden">
        <Logo />
      </div>
      <div className="hidden min-h-16 items-center justify-between gap-4 border-b border-line bg-white px-6 lg:flex">
        <dl className="flex items-center gap-2 text-sm text-ink">
          <div className="rounded-control border border-line px-3 py-2">
            <dt className="sr-only">Farm</dt>
            <dd className="font-medium">{farm.name}</dd>
          </div>
          <div className="rounded-control border border-line px-3 py-2">
            <dt className="sr-only">Period</dt>
            <dd className="font-medium">{farm.period}</dd>
          </div>
        </dl>
        <p className="inline-flex items-center gap-2 rounded-full bg-green-tint px-3 py-1.5 text-xs font-medium text-green-ink">
          <Lock aria-hidden="true" className="size-4" strokeWidth={1.6} />
          Session only · cleared when you finish
        </p>
      </div>
    </header>
  );
}

import type { FarmSummary } from "@/lib/view-models";

export function SessionCard({ farm }: { farm: FarmSummary }) {
  return (
    <section aria-labelledby="session-card-title" className="rounded-inner bg-white/8 p-4 text-on-forest">
      <p className="text-xs font-medium tracking-wider text-on-forest-muted uppercase">This session</p>
      <h2 id="session-card-title" className="mt-1 font-display text-base font-bold text-white">
        {farm.name}
      </h2>
      <p className="mt-1 text-xs">
        {farm.locationLabel} · {farm.coordinates}
      </p>
      <p className="mt-1 text-xs">
        {farm.areaHectares} ha · {farm.crop} · {farm.irrigation}
      </p>
    </section>
  );
}

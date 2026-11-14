import type { LucideIcon } from "lucide-react";

export function SectionTitle({ id, icon: Icon, children }: { id: string; icon: LucideIcon; children: string }) {
  return (
    <h2 id={id} className="flex items-center gap-3 font-display text-xl font-bold text-forest">
      <span className="grid size-9 place-items-center rounded-lg bg-green-tint text-primary">
        <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
      </span>
      {children}
    </h2>
  );
}

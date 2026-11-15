import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = { icon: LucideIcon; title: string; lead: ReactNode; actions?: ReactNode };

// The header of an inner page: icon, title, one or two lines, and room for a button on the right.
// The farm is chosen in the top bar, so it is not repeated here.
export function PageIntro({ icon: Icon, title, lead, actions }: Props) {
  return (
    <header className="fs-rise flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest text-gold">
            <Icon aria-hidden="true" className="size-5.5" strokeWidth={1.8} />
          </span>
          <h1 className="font-display text-[28px] leading-tight font-extrabold tracking-tight text-forest sm:text-[34px]">
            {title}
          </h1>
        </div>
        <p className="max-w-3xl text-lg leading-relaxed text-ink">{lead}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

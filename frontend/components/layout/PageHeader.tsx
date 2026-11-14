import type { ReactNode } from "react";

export function PageHeader({ title, lead, children }: { title: string; lead: string; children?: ReactNode }) {
  return (
    <header className="space-y-2">
      <h1 className="font-display text-[28px] leading-tight font-extrabold text-forest sm:text-[32px]">{title}</h1>
      <p className="text-base text-ink">{lead}</p>
      {children}
    </header>
  );
}

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SiteSwitcher } from "@/components/dashboard/SiteSwitcher";
import { FieldIllustration } from "@/components/landing/FieldIllustration";

type Props = { icon: LucideIcon; title: string; lead: ReactNode; site?: string };

// The green banner at the top of each page: what the page is about, and (with site) which farm is shown.
export function PageIntro({ icon: Icon, title, lead, site }: Props) {
  return (
    <header className="relative overflow-hidden rounded-card bg-forest text-white">
      <FieldIllustration className="absolute inset-0 size-full" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,61,50,0.97)_0%,rgba(22,61,50,0.9)_60%,rgba(22,61,50,0.6)_100%)]"
      />
      <div className="relative space-y-3 p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-white/15">
            <Icon aria-hidden="true" className="size-6" strokeWidth={1.8} />
          </span>
          <h1 className="font-display text-[26px] leading-tight font-extrabold sm:text-[32px]">{title}</h1>
        </div>
        <p className="max-w-3xl text-lg text-on-forest">{lead}</p>
        {site && <SiteSwitcher current={site} onDark />}
      </div>
    </header>
  );
}

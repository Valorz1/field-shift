import { FieldIllustration } from "@/components/landing/FieldIllustration";
import { StatusTag } from "@/components/ui/StatusTag";
import {
  headline,
  headlineStatus,
  rainChange,
  seasonChangeLabel,
  seasonInsights,
  temperatureChange,
  usualYears,
} from "@/lib/climate-facts";
import type { ClimateSite } from "@/lib/data/climate";
import { formatSigned } from "@/lib/format";

// The green banner: the one-sentence answer, how serious it is, and the three numbers behind it.
export function DashboardHero({ site }: { site: ClimateSite }) {
  const summer = seasonInsights(site).find((season) => season.name === "Summer");
  const figures = [
    { value: `${formatSigned(temperatureChange(site))} °C`, label: "temperature" },
    { value: `${formatSigned(rainChange(site), 0)}%`, label: "rain over the year" },
    ...(summer ? [{ value: seasonChangeLabel(summer), label: "summer rain" }] : []),
  ];

  return (
    <header className="fs-rise relative overflow-hidden rounded-card bg-forest text-white">
      <FieldIllustration className="absolute inset-0 size-full" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,61,50,0.97)_0%,rgba(22,61,50,0.88)_60%,rgba(22,61,50,0.55)_100%)]"
      />
      <div className="relative space-y-4 p-5 sm:p-7">
        <p className="text-sm font-semibold tracking-wide text-gold uppercase">What is happening on this field</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <StatusTag status={headlineStatus(site)} onDark />
          <span className="text-base text-on-forest-muted">Compared with {usualYears(site)}</span>
        </div>
        <h2 className="max-w-3xl font-display text-[26px] leading-tight font-extrabold sm:text-[34px]">{headline(site)}</h2>
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-base text-on-forest">
          {figures.map((figure) => (
            <div key={figure.label} className="flex items-baseline gap-2">
              <dd className="order-1 font-display text-xl font-extrabold text-white tabular-nums">{figure.value}</dd>
              <dt className="order-2">{figure.label}</dt>
            </div>
          ))}
        </dl>
        <p className="text-sm text-on-forest-muted">Data: NASA POWER.</p>
      </div>
    </header>
  );
}

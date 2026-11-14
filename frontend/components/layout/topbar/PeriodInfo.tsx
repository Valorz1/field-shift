"use client";

import { CalendarRange, ChevronDown } from "lucide-react";
import type { ClimateSite } from "@/lib/data/climate";
import { formatYears } from "@/lib/format";
import { Popover } from "../Popover";

// The years every number on the page compares. They are fixed, so this explains them; it does not change them.
export function PeriodInfo({ site }: { site: ClimateSite }) {
  const usual = formatYears(site.baseline.start, site.baseline.end);
  const rows = [
    { name: "Recent years", value: site.year, text: "The average of these years is what the pages call “your field”." },
    { name: "Usual", value: usual, text: "The 20 years everything is compared with." },
    { name: "Right now", value: "Last 30 days", text: "Daily NASA POWER data, on the dashboard and Climate page." },
    {
      name: "Full record",
      value: formatYears(site.source.firstYear, site.source.lastYear),
      text: "Every month NASA POWER has for this place.",
    },
  ];
  return (
    <Popover
      label={`Dates shown: ${site.year} compared with ${usual}. About these dates`}
      align="end"
      button={
        <>
          <CalendarRange aria-hidden="true" className="size-4 shrink-0 text-forest" strokeWidth={1.8} />
          <span className="whitespace-nowrap">
            {site.year} <span className="text-caption">vs</span> {usual}
          </span>
          <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-caption" strokeWidth={1.8} />
        </>
      }
    >
      <div className="p-2">
        <p className="font-display text-base font-bold text-forest">The dates behind the numbers</p>
        <dl className="mt-3 space-y-3">
          {rows.map(({ name, value, text }) => (
            <div key={name}>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-sm font-semibold text-ink">{name}</dt>
                <dd className="text-sm font-semibold text-forest tabular-nums">{value}</dd>
              </div>
              <dd className="text-sm text-caption">{text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 border-t border-line pt-3 text-sm text-caption">
          The dates are the same on every page, so the numbers can be compared fairly.
        </p>
      </div>
    </Popover>
  );
}

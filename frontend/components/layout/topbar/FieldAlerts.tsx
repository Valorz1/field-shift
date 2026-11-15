"use client";

import { ArrowRight, Bell } from "lucide-react";
import Link from "next/link";
import { seasonInsights } from "@/lib/climate-facts";
import { cx } from "@/lib/cx";
import type { ClimateSite } from "@/lib/data/climate";
import { formatYears } from "@/lib/format";
import { kpisFor } from "@/lib/kpis";
import { farmHref } from "@/lib/navigation";
import type { Status } from "@/lib/view-models";
import { Popover } from "../Popover";

type Alert = { key: string; title: string; text: string; status: Status };

const titles: Record<string, string> = { temperature: "Temperature", rain: "Rain over the whole year" };
const dots: Record<Status, string> = { fine: "bg-success", watch: "bg-warning", act: "bg-danger" };
const words: Record<Status, string> = { fine: "Fine", watch: "Keep an eye on it", act: "Act now" };

// Not messages from anyone: these are the climate numbers for this field that are off their usual level.
// They use the same rules as the coloured tags on the Climate page.
export const alertsFor = (site: ClimateSite): Alert[] =>
  [
    ...kpisFor(site, { crop: "" })
      .filter((kpi) => kpi.kind in titles)
      .map((kpi) => ({ key: kpi.kind, title: titles[kpi.kind], text: kpi.meaning, status: kpi.status ?? "fine" })),
    ...seasonInsights(site).map((insight) => ({
      key: insight.name,
      title: `${insight.name} rain`,
      text: insight.text,
      status: insight.status,
    })),
  ]
    .filter((alert) => alert.status !== "fine")
    .sort((a, b) => Number(b.status === "act") - Number(a.status === "act"));

export function FieldAlerts({ site }: { site: ClimateSite }) {
  const alerts = alertsFor(site);
  const count = alerts.length;
  const climate = farmHref("/climate", site);
  return (
    <Popover
      label={count ? `${count} thing${count === 1 ? "" : "s"} to look at on this field` : "Nothing to flag on this field"}
      align="end"
      buttonClass="relative w-11 justify-center md:w-10"
      panelClass="sm:w-96"
      button={
        <>
          <Bell aria-hidden="true" className="size-5 text-forest" strokeWidth={1.8} />
          {count > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-1 right-1 grid min-w-4.5 place-items-center rounded-full bg-gold px-1 text-[11px] leading-[18px] font-bold text-forest"
            >
              {count}
            </span>
          )}
        </>
      }
    >
      <div className="p-2">
        <p className="font-display text-base font-bold text-forest">Worth a look on this field</p>
        <p className="text-sm text-caption">
          {site.year} compared with {formatYears(site.baseline.start, site.baseline.end)}. Data: NASA POWER.
        </p>
      </div>
      {count === 0 ? (
        <p className="p-2 text-base text-ink">Nothing to flag. Temperature and rain are close to usual.</p>
      ) : (
        <ul>
          {alerts.map((alert) => (
            <li key={alert.key}>
              <Link href={climate} className="flex gap-3 rounded-control p-2 transition-colors hover:bg-page">
                <span aria-hidden="true" className={cx("mt-1.5 size-2.5 shrink-0 rounded-full", dots[alert.status])} />
                <span>
                  <span className="block font-semibold text-ink">
                    {alert.title} <span className="font-normal text-caption">· {words[alert.status]}</span>
                  </span>
                  <span className="block text-sm text-caption">{alert.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 border-t border-line pt-2">
        <Link
          href={climate}
          className="flex min-h-11 items-center justify-between rounded-control px-2 font-medium text-forest transition-colors hover:bg-page"
        >
          Open the Climate page
          <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
        </Link>
      </div>
    </Popover>
  );
}

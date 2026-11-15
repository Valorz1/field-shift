"use client";

import { Check, ChevronsUpDown, MapPin, MapPinned } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import { type Place, climateSites, isPin } from "@/lib/data/climate";
import { formatCoordinates } from "@/lib/format";
import { farmHref } from "@/lib/navigation";
import { updateSession } from "@/lib/session-store";
import { Popover } from "../Popover";

const heading = "px-2 pt-1.5 pb-1 text-[11px] font-semibold tracking-[0.08em] text-caption uppercase";
const option = "flex min-h-12 items-center justify-between gap-3 rounded-control px-2 transition-colors hover:bg-page";

// Which farm the whole app is showing: an example farm, or the field pinned on the map.
export function FarmSelector({ place }: { place: Place }) {
  const pathname = usePathname();
  const pinned = isPin(place);
  return (
    <Popover
      label={`Farm: ${place.name}. Change farm`}
      buttonClass="max-w-full px-2.5"
      button={
        <>
          <MapPin aria-hidden="true" className="size-4 shrink-0 text-forest" strokeWidth={2} />
          <span className="truncate font-semibold text-forest">{place.name}</span>
          <span className="hidden truncate text-caption xl:inline">{place.region}</span>
          <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-caption" strokeWidth={1.8} />
        </>
      }
    >
      {pinned && (
        <>
          <p className={heading}>Your field</p>
          <p className={cx(option, "bg-green-tint hover:bg-green-tint")}>
            <span>
              <span className="block font-semibold text-forest">Pinned on the map</span>
              <span className="block text-sm text-caption">{formatCoordinates(place.latitude, place.longitude)}</span>
            </span>
            <Check aria-hidden="true" className="size-5 shrink-0 text-primary" strokeWidth={2} />
          </p>
        </>
      )}
      <p className={heading}>Example farms</p>
      <ul>
        {climateSites.map((site) => {
          const active = site.id === place.id;
          return (
            <li key={site.id}>
              <Link
                href={`${pathname}?site=${site.id}`}
                // choosing an example farm drops the pinned place and goes back to that farm's own crop
                onClick={() => updateSession({ latitude: undefined, longitude: undefined, crop: undefined })}
                aria-current={active ? "true" : undefined}
                className={cx(option, active && "bg-green-tint hover:bg-green-tint")}
              >
                <span>
                  <span className="block font-semibold text-forest">{site.name}</span>
                  <span className="block text-sm text-caption">{site.region}</span>
                </span>
                {active && <Check aria-hidden="true" className="size-5 shrink-0 text-primary" strokeWidth={2} />}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 border-t border-line pt-2">
        <Link href={farmHref("/dashboard", place)} className={cx(option, "justify-start font-medium text-forest")}>
          <MapPinned aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.7} />
          Find your own field on the map
        </Link>
      </div>
    </Popover>
  );
}

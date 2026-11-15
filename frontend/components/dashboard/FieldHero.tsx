"use client";

import { MapPin } from "lucide-react";
import { CropPicker } from "@/components/farm/CropPicker";
import { OutsideUkNote } from "@/components/farm/OutsideUkNote";
import { AddressSearch } from "@/components/map/AddressSearch";
import { FarmMap } from "@/components/map/FarmMap";
import { isPin } from "@/lib/data/climate";
import { formatCoordinates } from "@/lib/format";
import { useClimateSite } from "@/lib/use-climate-site";
import { useStrategies } from "@/lib/use-strategies";
import { SiteSwitcher } from "./SiteSwitcher";

// The field comes first: the map on one side, which field and which crop on the other.
// It only needs the place (not the NASA data), so it stays on screen while the numbers load and
// the map is never rebuilt when the pin moves.
export function FieldHero() {
  const { place } = useClimateSite();
  const { crop } = useStrategies(place);

  return (
    <section
      aria-labelledby="field-heading"
      className="fs-rise overflow-hidden rounded-card border border-line bg-white lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
    >
      <FarmMap variant="fill" />
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-primary uppercase">
            <MapPin aria-hidden="true" className="size-4" strokeWidth={1.8} />
            {isPin(place) ? "Pinned on the map" : `${place.name}, ${place.region}`}
          </p>
          <h1 id="field-heading" className="font-display text-[26px] leading-tight font-extrabold text-forest sm:text-[30px]">
            {crop ? `Your field, growing ${crop}` : "Your field"}
          </h1>
          <p className="text-base text-caption">{formatCoordinates(place.latitude, place.longitude)}</p>
        </div>

        <AddressSearch />
        <SiteSwitcher current={place.id} />
        <OutsideUkNote site={place} />
        <CropPicker site={place} variant="plain" />

        <p className="mt-auto text-sm text-caption">
          A pinned place, or an address you type, is sent to NASA and the map provider (Mapbox) to find it and load the
          data. Nothing is stored after you finish.
        </p>
      </div>
    </section>
  );
}

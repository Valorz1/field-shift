import { Globe } from "lucide-react";
import { type Place, isInUk, isPin } from "@/lib/data/climate";

// Rotara is built for UK farms first. Elsewhere the NASA climate numbers are still real,
// but the crop suggestions were written with UK farming in mind, so say so plainly.
export function OutsideUkNote({ site }: { site: Place }) {
  if (isInUk(site)) return null;
  return (
    <p className="fs-rise flex items-start gap-3 rounded-inner border border-line bg-gold-tint p-3 text-base text-ink">
      <Globe aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-earth-ink" strokeWidth={1.8} />
      <span>
        <span className="font-semibold">{isPin(site) ? "This looks like it is outside the UK." : `${site.name} is an example from outside the UK.`}</span>{" "}
        The climate numbers are real NASA data for this place. The crop suggestions are written with UK farming in
        mind, so check them against local advice.
      </span>
    </p>
  );
}

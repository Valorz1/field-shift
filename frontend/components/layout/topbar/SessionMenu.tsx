"use client";

import { ClipboardList, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { AI_LEVELS } from "@/components/session/AiLevelSelector";
import { useEndSession } from "@/components/session/EndSessionButton";
import { type Place, isPin } from "@/lib/data/climate";
import { formatCoordinates } from "@/lib/format";
import { farmHref } from "@/lib/navigation";
import { DEFAULT_AI_LEVEL, useSession } from "@/lib/session-store";
import { DEMO_CROPS } from "@/lib/use-strategies";
import { Popover } from "../Popover";

const item = "flex min-h-11 w-full items-center gap-3 rounded-control px-2 text-left font-medium text-forest transition-colors hover:bg-page";

// There are no accounts, so this is the guest's session: what is held in this tab, and how to clear it.
export function SessionMenu({ place }: { place: Place }) {
  const session = useSession();
  const endSession = useEndSession();
  const level = AI_LEVELS.find((entry) => entry.level === (session.aiLevel ?? DEFAULT_AI_LEVEL));
  const crop = (session.crop ?? DEMO_CROPS[place.id] ?? "").trim();
  const facts = [
    { name: "Field", value: isPin(place) ? formatCoordinates(place.latitude, place.longitude) : `${place.name} (example)` },
    { name: "Crop", value: crop ? crop[0].toUpperCase() + crop.slice(1) : "Not chosen yet" },
    { name: "AI help", value: level ? `${level.level} · ${level.name}` : "" },
  ];
  return (
    <Popover
      label="Your session"
      align="end"
      buttonClass="w-11 justify-center md:w-10"
      button={
        <span className="grid size-8 place-items-center rounded-full bg-forest text-white">
          <User aria-hidden="true" className="size-4.5" strokeWidth={1.8} />
        </span>
      }
    >
      <div className="p-2">
        <p className="font-display text-base font-bold text-forest">Guest session</p>
        <p className="text-sm text-caption">No account. Nothing is saved when you finish.</p>
        <dl className="mt-3 space-y-1.5 rounded-inner bg-page p-3 text-sm">
          {facts.map(({ name, value }) => (
            <div key={name} className="flex justify-between gap-3">
              <dt className="text-caption">{name}</dt>
              <dd className="text-right font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <ul>
        <li>
          <Link href={farmHref("/session", place)} className={item}>
            <ClipboardList aria-hidden="true" className="size-5" strokeWidth={1.7} />
            Farm session
          </Link>
        </li>
        <li>
          <Link href={farmHref("/settings", place)} className={item}>
            <Settings aria-hidden="true" className="size-5" strokeWidth={1.7} />
            Settings
          </Link>
        </li>
      </ul>
      <div className="mt-2 border-t border-line pt-2">
        <button type="button" data-close onClick={endSession} className={`${item} text-danger-ink`}>
          <LogOut aria-hidden="true" className="size-5" strokeWidth={1.7} />
          End session and clear data
        </button>
      </div>
    </Popover>
  );
}

import { Info } from "lucide-react";

export function Disclaimer() {
  return (
    <aside
      aria-label="About these strategies"
      className="flex gap-3 rounded-inner border border-line bg-white p-4 text-base text-ink"
    >
      <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-forest" strokeWidth={1.6} />
      <p>
        <strong className="font-semibold">These strategies are estimates, not professional advice.</strong> They are
        built from NASA Earth observation data and general agronomy, not from measurements taken on your farm. Field
        Shift supports, and does not replace, your own judgement and local agricultural expertise.
      </p>
    </aside>
  );
}

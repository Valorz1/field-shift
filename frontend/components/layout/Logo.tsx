import Link from "next/link";
import { cx } from "@/lib/cx";

// One leaf, pointing up, drawn around the origin. The mark turns it three times around the sun.
const LEAF = "M0 0C12-5 17-26 3.5-40C-11-28-13-7 0 0Z";
const LEAVES = [
  { angle: 24, fill: "#1f5f3d" },
  { angle: 144, fill: "#4b9b54" },
  { angle: 264, fill: "#a8d45a" },
];

// The mark: three leaves, one for each plan, turning around the sun. The colours are the logo's own,
// so it sits on a white tile and looks the same on the dark sidebar and the light pages.
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx("grid size-10 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-line", className)}
    >
      <svg viewBox="-50 -50 100 100" className="size-8">
        {LEAVES.map(({ angle, fill }) => (
          <path key={angle} d={LEAF} fill={fill} transform={`rotate(${angle}) translate(0 -8)`} />
        ))}
        <circle r="8" fill="#f2b53a" />
      </svg>
    </span>
  );
}

// fades: the name fades away when the sidebar is a narrow rail (the link keeps its spoken name).
export function Logo({ className, fades = false }: { className?: string; fades?: boolean }) {
  return (
    <Link
      href="/dashboard"
      aria-label="Rotara, go to the dashboard"
      className={cx(
        "inline-flex min-h-11 items-center gap-3 overflow-hidden rounded-control focus-visible:outline-white",
        className,
      )}
    >
      <LogoMark />
      <span className={cx("font-display text-[20px] font-extrabold tracking-tight text-white", fades && "fs-nav-label")}>
        Rotara
      </span>
    </Link>
  );
}

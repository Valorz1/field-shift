import Link from "next/link";
import { cx } from "@/lib/cx";

// The mark: three furrows bending across a field. Gold tile for dark backgrounds, forest tile for light ones.
export function LogoMark({ tone = "gold" }: { tone?: "gold" | "forest" }) {
  return (
    <span
      aria-hidden="true"
      className={cx("grid size-8 shrink-0 place-items-center rounded-lg", tone === "gold" ? "bg-gold" : "bg-forest")}
    >
      <svg
        viewBox="0 0 20 20"
        className={cx("size-5", tone === "gold" ? "stroke-forest" : "stroke-gold")}
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M4 15c2-3 3-6 3-10" />
        <path d="M8.5 15c2-3 3-6 3-10" />
        <path d="M13 15c2-3 3-6 3-10" />
      </svg>
    </span>
  );
}

// fades: the name fades away when the sidebar is a narrow rail (the link keeps its spoken name).
export function Logo({ className, fades = false }: { className?: string; fades?: boolean }) {
  return (
    <Link
      href="/dashboard"
      aria-label="Field Shift, go to the dashboard"
      className={cx(
        "inline-flex min-h-11 items-center gap-3 overflow-hidden rounded-control focus-visible:outline-white",
        className,
      )}
    >
      <LogoMark />
      <span className={cx("font-display text-[17px] font-extrabold tracking-tight text-white", fades && "fs-nav-label")}>
        Field Shift
      </span>
    </Link>
  );
}

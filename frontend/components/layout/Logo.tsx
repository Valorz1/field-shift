import Link from "next/link";
import { cx } from "@/lib/cx";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={cx("inline-flex min-h-11 items-center gap-2.5 rounded-control focus-visible:outline-white", className)}
    >
      <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg bg-primary">
        <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round">
          <path d="M4 15c2-3 3-6 3-10" />
          <path d="M8.5 15c2-3 3-6 3-10" />
          <path d="M13 15c2-3 3-6 3-10" />
        </svg>
      </span>
      <span className="font-display text-base font-extrabold tracking-[0.12em] text-white">FIELD SHIFT</span>
    </Link>
  );
}

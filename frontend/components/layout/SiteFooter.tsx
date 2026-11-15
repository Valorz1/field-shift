import Link from "next/link";
import { cx } from "@/lib/cx";

const REPO = "https://github.com/Valorz1/field-shift";

// The line at the bottom of every page: how AI was used, where the data comes from, and where to read more.
// The full statement is on the About page.
export function SiteFooter({ className }: { className?: string }) {
  const link = "font-semibold text-forest underline underline-offset-2";
  return (
    <footer className={cx("space-y-1.5 text-sm text-caption", className)}>
      <p>
        Code written with help from Super Intelligence (SI): Claude by Anthropic, from Team Valor Astra&apos;s designs,
        and reviewed and tested by the team. The crop plans come from cited rules, not SI.
      </p>
      <p>Data: NASA POWER · NASA GPM IMERG · NASA SMAP · NASA HLS · Mapbox.</p>
      <p className="flex flex-wrap gap-x-4 gap-y-1">
        <Link href="/about" className={link}>
          About &amp; disclosure
        </Link>
        <Link href="/about#privacy" className={link}>
          Privacy
        </Link>
        <a href={REPO} className={link} target="_blank" rel="noreferrer">
          Code on GitHub
        </a>
      </p>
    </footer>
  );
}

import { CloudRain, Lock, MapPin, Satellite, Sprout, Thermometer } from "lucide-react";
import Image from "next/image";
import { FieldIllustration } from "@/components/landing/FieldIllustration";
import { Logo } from "@/components/layout/Logo";
import { ButtonLink } from "@/components/ui/Button";

// Real results for the Norfolk example farm (NASA POWER, 2021-2025 vs 2001-2020), the same numbers the dashboard shows.
const NORFOLK = [
  { icon: CloudRain, label: "Summer rain", value: "−29%", note: "Much drier summers", tone: "bg-danger-tint text-danger-ink" },
  { icon: Thermometer, label: "Temperature", value: "+0.7 °C", note: "Warmer", tone: "bg-warning-tint text-warning-ink" },
  { icon: Sprout, label: "Soil wetness", value: "59%", note: "A little drier (was 61%)", tone: "bg-warning-tint text-warning-ink" },
];

const STEPS = [
  { title: "Pick your field", text: "Drop a pin on your farm in the UK, or try our Norfolk example. Western Nevada shows it works abroad too." },
  { title: "See what changed", text: "NASA data compares the last 5 years with the 20 years before." },
  { title: "Compare 3 plans", text: "Keep what you grow, use less water, or build up the soil. You decide." },
];

const DATA = [
  { name: "NASA POWER", what: "Temperature, rain and soil wetness", text: "Monthly since 2001, for any spot on Earth.", tone: "bg-forest" },
  { name: "GPM IMERG", what: "Satellite rain", text: "A second NASA source to check the rain numbers.", tone: "bg-water-ink" },
  { name: "NASA SMAP", what: "Satellite soil moisture", text: "Checks the soil numbers from space, for the Norfolk example farm.", tone: "bg-earth-ink" },
];

export default function Home() {
  return (
    <main className="min-h-dvh bg-page">
      <section className="relative overflow-hidden bg-forest text-white">
        {/* The drawn fields sit underneath, so the page still looks right if the photo is missing. */}
        <FieldIllustration className="absolute inset-0 size-full" />
        <Image
          src="/norfolk-from-space.jpg"
          alt=""
          fill
          priority
          // On a tall phone screen the wide photo is cropped by height, so it needs the full-size file to stay sharp.
          sizes="(max-width: 1024px) 2400px, 100vw"
          quality={85}
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-forest/90 md:bg-transparent md:bg-[linear-gradient(90deg,rgba(22,61,50,0.96)_0%,rgba(22,61,50,0.85)_55%,rgba(22,61,50,0.45)_100%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 pt-6 pb-14 sm:px-8 sm:pb-20">
          <Logo />
          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="text-sm font-semibold tracking-wide text-on-forest-muted uppercase">
                NASA Space Apps Challenge 2026 · Field Shift challenge
              </p>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-forest-deep/50 px-3 py-1.5 text-xs font-bold tracking-[0.14em] text-on-forest uppercase">
                <Satellite aria-hidden="true" className="size-4 text-sky-200" strokeWidth={1.8} />
                Earth observations for farmers
              </p>
              <h1 className="mt-3 font-display text-[36px] leading-[1.1] font-extrabold sm:text-[52px]">
                See how the weather on your field has changed.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-on-forest">
                Drop a pin on your UK farm. Rotara uses NASA data to show what changed in the last 5 years, and 3
                crop plans for the next 3.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/dashboard" variant="secondary" className="border-white px-6 text-lg">
                  <MapPin aria-hidden="true" className="size-5" strokeWidth={1.8} />
                  Find your farm
                </ButtonLink>
                <ButtonLink href="/dashboard?site=nevada" variant="on-dark">
                  Try the Nevada, USA example
                </ButtonLink>
              </div>
              <p className="mt-4 flex items-center gap-2 text-base text-on-forest-muted">
                <Lock aria-hidden="true" className="size-4" strokeWidth={1.8} />
                Free. No account. Nothing is saved.
              </p>
              <p className="mt-6 text-sm text-on-forest-muted">
                Seen from space: farmland near Dereham, Norfolk · NASA HLS (Landsat + Sentinel-2) · 11 June 2025
              </p>
            </div>

            <aside aria-labelledby="example-heading" className="rounded-card bg-white/95 p-5 text-ink">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold tracking-[0.14em] text-caption uppercase">Field climate brief</p>
                  <h2 id="example-heading" className="mt-1 font-display text-lg font-bold text-forest">
                    Norfolk, UK: a wheat farm
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-water-tint px-2.5 py-1 text-sm font-semibold text-water-ink">
                  <Satellite aria-hidden="true" className="size-4" strokeWidth={1.8} />
                  NASA POWER
                </span>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-caption">
                <MapPin aria-hidden="true" className="size-4 text-primary" strokeWidth={1.8} />
                52.65° N, 0.90° E · Earth-observed climate
              </p>
              <p className="mt-1 text-sm text-caption">Real data: 2021–2025 compared with 2001–2020</p>
              <ul className="mt-4 space-y-2.5">
                {NORFOLK.map(({ icon: Icon, label, value, note, tone }) => (
                  <li key={label} className="flex items-center gap-3 rounded-inner border border-line p-3">
                    <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${tone}`}>
                      <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-caption">{label}</span>
                      <span className="block text-base font-semibold">{note}</span>
                    </span>
                    <span className="font-display text-2xl font-extrabold text-forest tabular-nums">{value}</span>
                  </li>
                ))}
              </ul>
              <ButtonLink href="/dashboard?site=norfolk" variant="secondary" className="mt-4 w-full">
                See the 3 plans for this farm
              </ButtonLink>
            </aside>
          </div>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="px-4 py-14 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 id="how-heading" className="font-display text-[28px] font-extrabold text-forest">
            How it works
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {STEPS.map(({ title, text }, i) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-forest font-display text-lg font-extrabold text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-display text-lg font-bold text-forest">{title}</span>
                  <span className="mt-1 block text-base text-caption">{text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="data-heading" className="border-t border-line bg-white px-4 py-14 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 id="data-heading" className="flex items-center gap-3 font-display text-[28px] font-extrabold text-forest">
            <Satellite aria-hidden="true" className="size-7" strokeWidth={1.6} />
            From space to your soil
          </h2>
          <p className="mt-2 max-w-2xl text-base text-caption">
            Satellite and climate records help put changing field conditions in context.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {DATA.map(({ name, what, text, tone }) => (
              <li key={name} className={`rounded-card p-5 text-white ${tone}`}>
                <span className="block text-sm font-semibold tracking-wide text-white/75 uppercase">{what}</span>
                <span className="mt-1 block font-display text-2xl font-extrabold">{name}</span>
                <span className="mt-2 block text-base text-white/85">{text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-sm text-caption">
            Rotara supports your decisions. It does not replace local advice. Built by team Valor Astra for the
            NASA Space Apps Challenge 2026.
          </p>
        </div>
      </section>
    </main>
  );
}

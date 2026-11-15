import { Bot, Info, Library, Lock, Satellite } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Page, PageSection } from "@/components/layout/Page";
import { PageIntro } from "@/components/layout/PageIntro";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "About & disclosure · Rotara" };

const REPO = "https://github.com/Valorz1/field-shift";
const RULES = `${REPO}/blob/main/backend/app/ai/agronomy/rotation_rules.json`;

function Out({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-forest underline underline-offset-2">
      {children}
    </a>
  );
}

// Each line: what it is, and where it comes from.
const DATA: { name: string; text: ReactNode }[] = [
  {
    name: "Climate",
    text: (
      <>
        Monthly temperature, rain and soil wetness for any pin from <Out href="https://power.larc.nasa.gov/">NASA POWER</Out>{" "}
        (MERRA-2 model, 2001–2025). Recent years (2021–2025) are compared with the usual (2001–2020).
      </>
    ),
  },
  {
    name: "Last 30 days",
    text: <>Daily temperature and rain from NASA POWER, for frost nights, heat days (30 °C or more) and heavy rain days (20 mm or more).</>,
  },
  {
    name: "Rain check",
    text: (
      <>
        <Out href="https://gpm.nasa.gov/data/imerg">NASA GPM IMERG</Out> satellite rain, a second source for the example
        farms.
      </>
    ),
  },
  {
    name: "Soil check",
    text: (
      <>
        <Out href="https://nsidc.org/data/spl3smp_e/versions/6">NASA SMAP</Out> topsoil moisture (SPL3SMP_E, 9 km),
        downloaded through NASA AppEEARS. Only readings NASA marks as recommended quality are used.
      </>
    ),
  },
  {
    name: "Crop plans",
    text: (
      <>
        A rules engine builds 3 rotations from published guidance (AHDB, UW–Madison Extension, SARE, USDA NRCS, FAO and
        others). Every rule shows its source in the app. <Out href={RULES}>See all the rules and sources</Out>.
      </>
    ),
  },
  {
    name: "Map and search",
    text: <>Base map and place search from <Out href="https://www.mapbox.com/">Mapbox</Out>.</>,
  },
];

const CREDITS: { name: string; text: ReactNode }[] = [
  {
    name: "Homepage photo",
    text: (
      <>
        Farmland near Dereham, Norfolk, 11 June 2025, from NASA Harmonized Landsat Sentinel-2 (HLS): NASA, USGS Landsat
        and ESA Copernicus Sentinel-2. A real satellite image, not SI-generated.
      </>
    ),
  },
  { name: "NASA data", text: <>POWER, GPM IMERG, SMAP (via AppEEARS) and HLS. Use of NASA data does not mean NASA endorses this project.</> },
  { name: "Maps", text: <>© Mapbox, © OpenStreetMap contributors.</> },
  {
    name: "Fonts and icons",
    text: (
      <>
        <Out href="https://github.com/rsms/inter">Inter</Out> and{" "}
        <Out href="https://github.com/sharanda/manrope">Manrope</Out> (SIL Open Font License 1.1);{" "}
        <Out href="https://lucide.dev/">Lucide</Out> icons (ISC).
      </>
    ),
  },
  {
    name: "Software",
    text: <>Next.js, React, Tailwind CSS, Chart.js and Mapbox GL JS on the website; Python and FastAPI on the server.</>,
  },
];

function Rows({ rows }: { rows: { name: string; text: ReactNode }[] }) {
  return (
    <Card>
      <dl className="divide-y divide-line">
        {rows.map(({ name, text }) => (
          <div key={name} className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[11rem_1fr] sm:gap-4">
            <dt className="font-semibold text-forest">{name}</dt>
            <dd className="text-base text-ink">{text}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export default function AboutPage() {
  return (
    <Page>
      <PageIntro
        icon={Info}
        title="About & disclosure"
        lead="Rotara helps a farmer decide what to plant next as their climate shifts. Built by Team Valor Astra for the NASA Space Apps Challenge 2026 (Field Shift: Adapting Farms with NASA Data)."
      />

      <PageSection id="about-what" icon={Info} title="What Rotara does">
        <Card>
          <p className="text-base text-ink">
            Drop a pin or type a postcode, pick the crop you grow now, and tell us what matters to you. Rotara compares
            25 years of NASA data for that field, shows what has changed, and offers 3 crop rotations for the next 3
            years: keep the current crop, mix in climate-suited crops, or build the soil. Each plan shows what fits
            your answers, what to check first, the cited rule behind it, and what it does not know. You decide. The
            plans are a starting point to talk through with your adviser, not professional farm advice.
          </p>
        </Card>
      </PageSection>

      <PageSection id="about-si" icon={Bot} title="Super Intelligence (SI) disclosure">
        <Card className="space-y-3 text-base text-ink">
          <p>
            <span className="font-semibold">What the team did: </span>
            chose the challenge, the NASA datasets, the features and the crop-rule sources; designed the screens;
            decided every rule and threshold; and directed, reviewed and tested every change.
          </p>
          <p>
            <span className="font-semibold">What SI did: </span>
            Claude by Anthropic helped write, debug and review the website and server code and its tests, research and
            summarise sources, check the data, and draft text such as the README and this page. Changes made with
            Claude are marked as co-authored in the <Out href={REPO}>GitHub history</Out>. Base44 was used for an early
            design prototype of the dashboard.
          </p>
          <p>
            <span className="font-semibold">SI in the app: </span>
            an optional chat uses Gemma 4, running on the farmer&apos;s own computer through Ollama. It explains the
            existing plans in 1 or 2 lines. It does not make plans or change numbers, and it is not part of this
            website.
          </p>
          <p>
            <span className="font-semibold">Not from SI: </span>
            every climate, rain and soil figure comes from NASA data, and every crop plan comes from the cited rules,
            never from SI. The title-slide photo in our demo is SI-generated and labelled &ldquo;AI-generated&rdquo;.
          </p>
        </Card>
      </PageSection>

      <PageSection id="about-data" icon={Satellite} title="Where the data comes from">
        <Rows rows={DATA} />
        <p className="text-base text-caption">
          New to the words? See <Link href="/guide" className="font-semibold text-forest underline underline-offset-2">what the words mean</Link>.
        </p>
      </PageSection>

      <PageSection id="privacy" icon={Lock} title="Privacy">
        <Card>
          <ul className="list-disc space-y-1.5 pl-5 text-base text-ink marker:text-sage">
            <li>No account, no ads and no trackers.</li>
            <li>
              The place you pick is sent to Mapbox (to draw the map and find the place) and to our server, which asks
              NASA POWER for that spot&apos;s data. Our server does not save it, though our hosting services keep short
              request logs.
            </li>
            <li>
              Your crop and your answers about the farm stay in this browser tab and are gone when you end the session
              or close the tab.
            </li>
            <li>We clear the anonymous id Mapbox would otherwise keep in your browser.</li>
          </ul>
        </Card>
      </PageSection>

      <PageSection id="about-credits" icon={Library} title="Credits">
        <Rows rows={CREDITS} />
      </PageSection>
    </Page>
  );
}

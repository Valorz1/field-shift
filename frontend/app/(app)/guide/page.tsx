import { BookOpen, CircleCheck, CircleDashed, Satellite, Scale, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Page, PageSection } from "@/components/layout/Page";
import { PageIntro } from "@/components/layout/PageIntro";
import { Card } from "@/components/ui/Card";
import { SourceBadge } from "@/components/ui/SourceBadge";
import type { DataLabel } from "@/lib/view-models";

// Plain-language explanations of the words in the app, and of the ones farmers will meet in other
// satellite tools. Each says honestly whether this app uses it.

type Term = { id: string; word: string; plain: string; more: ReactNode; inApp: ReactNode; used: boolean };

const TERMS: Term[] = [
  {
    id: "soil-moisture",
    word: "Soil moisture and soil wetness",
    plain: "How much water is in the soil.",
    more: (
      <>
        Satellites measure it as the share of the soil that is water (for example 0.25 means a quarter of each spoonful
        of soil is water). NASA&apos;s weather model gives a <em>wetness</em> from 0 (bone dry) to 1 (soaked).
      </>
    ),
    inApp: (
      <>
        Yes. The Soil page shows root-zone wetness (the top metre of soil, where most roots are) from NASA POWER, and
        topsoil moisture (the top 5 cm) from the SMAP satellite for the Norfolk example farm.
      </>
    ),
    used: true,
  },
  {
    id: "anomaly",
    word: "Soil moisture anomaly",
    plain: "How much wetter or drier the soil is than usual for that time of year.",
    more: (
      <>
        July soil is compared with an average July, not with January. A negative anomaly means drier than usual. This
        matters more than the raw number, because every soil holds water differently.
      </>
    ),
    inApp: (
      <>
        Yes, in plain words: &ldquo;a little drier than usual&rdquo;, with the usual and recent figures side by side.
        Usual means the 2001–2020 average, recent means 2021–2025.
      </>
    ),
    used: true,
  },
  {
    id: "evapotranspiration",
    word: "Evapotranspiration (ET)",
    plain: "Water leaving the field into the air: evaporation from the soil plus water plants breathe out through their leaves.",
    more: (
      <>
        On a hot, sunny, windy day a crop can lose several millimetres of water. If more water leaves than rain brings in,
        the soil dries out. Satellites such as NASA&apos;s ECOSTRESS and MODIS estimate it from how warm the ground is.
      </>
    ),
    inApp: (
      <>
        Not yet. We use rain and soil wetness instead, which show the result of evapotranspiration but not the amount.
      </>
    ),
    used: false,
  },
  {
    id: "ndvi",
    word: "NDVI (crop greenness)",
    plain: "A satellite score from −1 to 1 for how green and leafy the ground is.",
    more: (
      <>
        Healthy leaves reflect a lot of near-infrared light and absorb red light. NDVI compares the two: (near-infrared −
        red) ÷ (near-infrared + red). A thick healthy crop scores roughly 0.6 to 0.9, bare soil about 0.1 to 0.2, and water
        below 0. A patch that scores lower than the rest of the field can point to stress, pests or poor drainage.
        Landsat, Sentinel-2 and MODIS satellites all measure it.
      </>
    ),
    inApp: (
      <>
        Not yet. It needs your field&apos;s boundary to be useful, and clouds often hide UK fields. It is the next thing we
        would add.
      </>
    ),
    used: false,
  },
  {
    id: "risks",
    word: "Frost nights, heat-stress days and heavy rain days",
    plain: "Counts of days that can harm a crop, from NASA's daily weather data.",
    more: (
      <>
        <strong>Frost night:</strong> the lowest temperature is below 0 °C. <strong>Heat-stress day:</strong> the highest
        temperature is 30 °C or more. Many crops start to suffer around there, and wheat is most at risk when it
        flowers. <strong>Heavy rain day:</strong> 20 mm of rain or more, which climate scientists call a &ldquo;very heavy
        precipitation day&rdquo;. It can wash soil away and waterlog fields.
      </>
    ),
    inApp: <>Yes, on the dashboard under &ldquo;Field risks to watch&rdquo;, for the last 30 days NASA has data for.</>,
    used: true,
  },
  {
    id: "water-stress",
    word: "Plant water stress",
    plain: "When a crop cannot get the water it needs, so it grows less.",
    more: (
      <>
        We estimate it from two signs: summer rain against usual, and how wet the top metre of soil was in summer against
        usual. Both drier = more chance of stress. It is a sign to look at your crop, not a measurement of it.
      </>
    ),
    inApp: <>Yes, on the dashboard. It does not know if you irrigate.</>,
    used: true,
  },
  {
    id: "rotation",
    word: "Rotation, cover crop and legume",
    plain: "Rotation: growing different crops on a field in turn, year by year.",
    more: (
      <>
        <strong>Cover crop:</strong> a crop grown to protect and feed the soil between main crops, not to sell.{" "}
        <strong>Legume:</strong> a plant such as beans, peas, clover or alfalfa whose roots hold bacteria that take
        nitrogen from the air and leave some in the soil for the next crop.
      </>
    ),
    inApp: <>Yes. Every plan is a 3-year rotation, and the soil plan adds a cover crop.</>,
    used: true,
  },
];

type DataKind = { name: string; badge: DataLabel; what: string; good: string; limits: string };

const KINDS: DataKind[] = [
  {
    name: "Satellite",
    badge: "NASA SMAP",
    what: "Measured from space: SMAP for topsoil moisture, GPM IMERG for rain.",
    good: "Covers every field on Earth, every few days, the same way everywhere.",
    limits: "Sees a large square (about 9–10 km), not your field. SMAP only sees the top 5 cm and skips readings it does not trust.",
  },
  {
    name: "Model",
    badge: "NASA POWER (MERRA-2 model)",
    what: "NASA POWER: a computer model that blends satellite and weather-station data into daily and monthly figures.",
    good: "No gaps, back to 1981, and it gives things satellites cannot see, like the wetness of the top metre of soil.",
    limits: "An estimate for an area of about 50 km. It does not know your soil, your drainage or your irrigation.",
  },
  {
    name: "Ground",
    badge: "Your input",
    what: "A rain gauge, a soil probe, a lab test, or your own records and eye.",
    good: "Exact for your field. Nothing beats it for the spot where it was taken.",
    limits: "Only one spot, and rarely kept for 20 years, so it is hard to tell what is usual.",
  },
];

function TermCard({ term }: { term: Term }) {
  const Icon = term.used ? CircleCheck : CircleDashed;
  return (
    <Card as="article" id={term.id} aria-labelledby={`${term.id}-title`} className="scroll-mt-24 space-y-2">
      <h3 id={`${term.id}-title`} className="font-display text-lg font-bold text-forest">
        {term.word}
      </h3>
      <p className="text-lg font-semibold text-ink">{term.plain}</p>
      <p className="text-base text-ink">{term.more}</p>
      <p className="flex gap-2 rounded-inner bg-page p-3 text-base text-ink">
        <Icon
          aria-hidden="true"
          className={term.used ? "mt-0.5 size-5 shrink-0 text-primary" : "mt-0.5 size-5 shrink-0 text-caption"}
          strokeWidth={2}
        />
        <span>
          <span className="font-semibold">In this app: </span>
          {term.inApp}
        </span>
      </p>
    </Card>
  );
}

export default function GuidePage() {
  return (
    <Page>
      <PageIntro
        icon={BookOpen}
        title="What the words mean"
        lead="Satellite tools use a lot of jargon. Here is what each word means, in plain English, and whether this app uses it."
      />

      <PageSection id="guide-kinds" icon={Satellite} title="Satellite, model and ground data">
        <div className="grid gap-4 lg:grid-cols-3">
          {KINDS.map((kind) => (
            <Card key={kind.name} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-forest">{kind.name}</h3>
                <SourceBadge source={kind.badge} />
              </div>
              <p className="text-base text-ink">{kind.what}</p>
              <p className="text-base text-ink">
                <span className="font-semibold">Good at: </span>
                {kind.good}
              </p>
              <p className="text-base text-ink">
                <span className="font-semibold">Limits: </span>
                {kind.limits}
              </p>
            </Card>
          ))}
        </div>
        <Card className="flex gap-3 border-forest/30 bg-green-tint">
          <Scale aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-forest" strokeWidth={1.8} />
          <p className="text-base text-ink">
            <span className="font-semibold">Why we use more than one: </span>
            when the satellite and the model tell the same story, you can trust it more. When they do not, that is a
            reason to check your field yourself. For Norfolk we put SMAP next to the model on the Soil page. For Nevada,
            NASA marked none of the SMAP readings as recommended quality, so we say so and use the model only. Your own
            rain gauge or soil test always beats both for your field.
          </p>
        </Card>
      </PageSection>

      <PageSection id="guide-terms" icon={BookOpen} title="Words you will meet">
        <div className="grid gap-4 lg:grid-cols-2">
          {TERMS.map((term) => (
            <TermCard key={term.id} term={term} />
          ))}
        </div>
      </PageSection>

      <PageSection id="guide-limits" icon={TriangleAlert} title="What this app cannot know">
        <Card>
          <ul className="list-disc space-y-1.5 pl-5 text-base text-ink marker:text-sage">
            <li>Your exact soil, drainage, slope and irrigation, unless you tell us under &ldquo;About your farm&rdquo;.</li>
            <li>Pests, weeds and diseases on your farm, and crop prices or contracts.</li>
            <li>What the weather will do next. Everything here is what has already happened.</li>
            <li>Whether a plan is right for you. It is a starting point to talk through with your agronomist or adviser.</li>
          </ul>
        </Card>
      </PageSection>
    </Page>
  );
}

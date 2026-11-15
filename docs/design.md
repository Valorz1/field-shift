# Design

Design canvas: https://claude.ai/artifact/Bjzg8CjWRdfYd2YDjkMCAv ("Field Shift — Farm Dashboard Design", 12 screens).

All tokens live in `frontend/app/globals.css` under `@theme`, so they are available as Tailwind classes (`bg-forest`, `text-caption`, `rounded-card`, `font-display` and so on).

## Colour

| Token | Hex | Use |
| --- | --- | --- |
| `forest` | `#163D32` | Sidebar, headings |
| `primary` | `#2F7653` | Primary buttons, active nav |
| `fresh` | `#77A86B` | Strategy 1 (baseline) |
| `page` | `#F7F8F3` | Page background |
| `earth` | `#9A7656` | Soil, strategy 3 (soil restoration) |
| `beige` | `#D8C9A9` | Dry periods |
| `sage` | `#A8BBA6` | Quiet borders |
| `water` | `#3E82B7` | NASA data, water, strategy 2 (climate adaptive) |
| `ink` | `#202B28` | Body text |
| `caption` | `#4F5B55` | Captions, secondary text |
| `success` | `#39865B` | Connected, good |
| `warning` | `#D69B3B` | Warnings |
| `danger` | `#C65B4F` | Errors, unavailable |
| `neutral` | `#7C8982` | Neutral states |
| `line` | `#E3E6DC` | Card borders |

Several design colours are below 4.5:1 as text on white (`warning` is 2.4:1, `water` and `earth` about 4.1:1). For text and badges use the paired `*-ink` on `*-tint` tokens instead, which all pass WCAG AA:

| Pair | Ink | Tint |
| --- | --- | --- |
| green | `#245C40` | `#E7F0E8` |
| water | `#245F8E` | `#E6F0F8` |
| earth | `#6E5034` | `#F1E9DC` |
| warning | `#7A5A12` | `#F6EBD3` |
| danger | `#9E3B30` | `#F8E5E2` |
| neutral | `#3E4A44` | `#ECEEE8` |

On the forest sidebar, text uses `on-forest` (`#D8E4DC`) and `on-forest-muted` (`#B7CBBE`).

## Type

- Manrope (`font-display`): 800 at 32px for page titles, 700 at 18px for card titles.
- Inter (`font-sans`, the default): 400 at 16px for lead text, 14px for body, 12px for captions and sources.
- KPI values use tabular numerals.

Both fonts are self-hosted from Fontsource variable-font packages in
`frontend/app/layout.tsx`, so production builds do not need to fetch Google
Fonts.

## Shape and spacing

- Radius: `rounded-control` 10px (buttons, inputs), `rounded-inner` 12px (inner cards), `rounded-card` 16px (page cards), `rounded-full` for badges.
- Spacing uses Tailwind's default 4px scale (4, 8, 12, 16, 20, 24, 32). Cards have 20px padding (`p-5`), 16px gaps (`gap-4`) and 24px between sections (`space-y-6`).
- Cards have a 1px `line` border and no shadow.
- Touch targets are at least 44px (`min-h-11`).
- Icons are 20px line icons with a 1.6px stroke (`lucide-react`).

## Data labels

Every figure carries a `SourceBadge`: NASA POWER, GPM IMERG, NASA SMAP, Calculated, Your input, AI, General agronomy, Sample data or Missing. Data source connections use `StatusPill`: Connected, Available, Loading or Unavailable.

## Copy

- Empty: "No data for these dates. Try a wider date range."
- Error: "Could not reach NASA POWER. Check your connection, then try again."
- The strategies disclaimer (`Disclaimer`) stays visible on any screen that shows strategies.
- No NASA logos anywhere in the app.

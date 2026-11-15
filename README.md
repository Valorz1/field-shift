# Rotara

**Crop rotation plans from NASA data. The farmer decides.**

Built by team **Valor Astra** for the NASA Space Apps Challenge 2026, challenge *Field Shift: Adapting Farms with NASA Data*.

| | |
|---|---|
| Live site | https://field-shift-frontend-seven.vercel.app |
| Demo (slides) | DEMO_SLIDES_URL |
| Backend API docs | https://field-shift-backends.onrender.com/docs |

## What it does

A farmer drops a pin (or types a postcode), picks the crop they grow, and says what matters to them. Rotara compares 25 years of NASA data for that field and offers **3 crop rotations for the next 3 years**:

1. **Keep the current crop**: the reference case.
2. **Mix in crops that suit the climate**: for example wheat → oilseed rape → field beans.
3. **Build up the soil**: add a cover crop, often a legume.

Each plan shows which of the farmer's priorities it meets, what to check first, why it was suggested, the cited evidence, the risks, and what was not checked. The farmer always makes the choice.

### Why it matters: the Norfolk example

In Norfolk, UK, rain over the whole year hardly changed: 706 mm a year in 2001–2020, 693 mm in 2021–2025 (−2%). Summer rain fell from 206 mm to 145 mm (−30%), right when crops fill their grain.

This is not one bad year. All 5 summers from 2021 to 2025 were below the 2001–2020 average, and 2022 (95 mm) and 2025 (105 mm) were drier than any summer from 2001 to 2020 (the driest had 120 mm). A yearly total hides this; Rotara shows it.

## Features

- **Find your field**: drop a pin or search a postcode or village (Mapbox).
- **What changed**: temperature, yearly and seasonal rain, root-zone soil wetness and a climate risk level, recent (2021–2025) against usual (2001–2020).
- **Field risks**: frost nights, heat-stress days (30 °C or more) and heavy rain days (20 mm or more) in the last 30 days, and summer plant water stress.
- **About your farm**: priorities (use less water, build organic matter, add nitrogen, stop soil washing away, fewer pests and diseases, feed for livestock, easy to sell, keep changes small), water, kit, buyer, soil type and organic matter from a soil test.
- **3 plans**: each with "Matches X of your priorities", ✓ what fits, ! what to check, and a "Best fit" badge only when one plan clearly leads.
- **Compare** the plans side by side.
- **What the words mean**: NDVI, evapotranspiration, soil moisture anomaly, pest breaks, and satellite vs model vs ground data.
- **Ask about your field** (optional): a local Gemma 4 model explains the plans in 1–2 lines, at an AI level the farmer chooses. It never creates plans or numbers.
- **Private by design**: no account, nothing stored. The session lives in the browser tab and is gone when it closes.

## How the plans are made

No AI model produces any number or plan. Everything is calculated or comes from cited rules.

1. **Climate summary** (`backend/app/services/indicators.py`). From NASA POWER monthly data, using complete years only.
2. **Risk level**: 1 point if it got **warmer by 0.5 °C or more**, 1 point if **yearly or summer rain fell by 5% or more**. 0 = low, 1 = moderate, 2 = high. These are screening thresholds chosen by the team, documented in [docs/methodology.md](./docs/methodology.md).
3. **3 plans** (`backend/app/services/strategy_engine.py`). Built from crop rules in [`rotation_rules.json`](./backend/app/ai/agronomy/rotation_rules.json), each linked to one of 17 published sources. For example:
   - **Pulse break**: pulses such as field beans or peas never appear twice in 3 years. AHDB advises at least five years between pulse crops.
   - **Alfalfa**: a stand lasts 4–10+ years and should not be resown straight after itself (UW–Madison Extension).
   - **Warm places**: cowpea, a warm-season legume, comes before chickpea, a cool-season one (Sita et al., 2017).
4. **Farmer answers** (`frontend/lib/farm-profile.ts`) never change the science. They add notes to each plan, worked out from what the plan already contains (its crops, water need and how big a change it is).

## NASA data

| Dataset | Used for | Limits |
|---|---|---|
| [NASA POWER](https://power.larc.nasa.gov/), monthly, 2001–2025 | Temperature, rain, root-zone and topsoil wetness, live for any pin | Modelled (MERRA-2), about a 50 km grid; does not know the farm's soil or irrigation |
| NASA POWER, daily | Frost, heat-stress and heavy rain days in the last 30 days | Runs a few days behind today |
| [GPM IMERG](https://gpm.nasa.gov/data/imerg), monthly | Checks POWER rain: Norfolk 706 vs 735 mm a year, Nevada 170 vs 170 mm | Different grids, so agreement supports but does not prove either |
| [SMAP](https://nsidc.org/data/spl3smp_e/versions/6) L3 Enhanced 9 km (SPL3SMP_E v006), via AppEEARS | Checks the pattern of POWER soil wetness for Norfolk, 2016–2025 | Top 5 cm only. Nevada: 0 of 1,492 readings were of recommended quality, so none are used |

## What Rotara cannot know

- The farm's own soil, drainage, slope and irrigation, unless the farmer tells it.
- Pests, weeds and diseases on the farm, crop prices, yields and contracts.
- What the weather will do next. Everything is what has already happened.
- Whether a plan is right. It is a starting point to talk through with an agronomist.

Two data notes: the recent period is only 5 years, so it shows recent change, not a climate trend. In Western Nevada summer rain is only about 20 mm, so a few millimetres show as a large percentage.

## Run it locally

You need Python 3.12 and Node.js 20 or later.

**Backend** (terminal 1):

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate    macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at http://localhost:8000 (docs at http://localhost:8000/docs).

**Frontend** (terminal 2):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. For the map and address search, put a free Mapbox token in `frontend/.env.local`:

```
NEXT_PUBLIC_MAPBOX_TOKEN=your-token
```

**Optional chat**: run [Ollama](https://ollama.com/) with `gemma4:e4b` (see `scripts/pull-model.sh`). Everything else works without it.

**Or with Docker**: copy `.env.example` to `.env`, then `docker compose up --build`.

**Tests**:

```bash
cd backend && python -m pytest -q
```

## Environment variables

| Variable | Where | What |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Frontend | Backend URL. Default `http://localhost:8000` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Frontend | Mapbox public token for the map and address search. Never commit it |
| `ALLOWED_ORIGINS` | Backend | Deployed frontend URL(s), comma-separated, no trailing slash. `localhost:3000` is always allowed |
| `MODEL_BASE_URL`, `MODEL_NAME` | Backend | Ollama-compatible model for the optional chat |

## Deploy

- **Backend on Render**: New → Blueprint → this repo. It uses [`render.yaml`](./render.yaml); see [backend/RENDER.md](./backend/RENDER.md).
- **Frontend on Vercel**: import this repo with root directory `frontend`, and set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_MAPBOX_TOKEN`.
- Then set `ALLOWED_ORIGINS` on the backend to the Vercel URL.

The chat needs a model server, so it does not run on the deployed site.

## Project structure

```
backend/   FastAPI API, climate indicators, strategy engine, crop rules, tests
frontend/  Next.js app (dashboard, plans, compare, soil, climate, guide)
data/raw/  NASA POWER, GPM IMERG and SMAP data for the two example farms
docs/      methodology, architecture, privacy, design notes
```

## Use of AI

- **In the app**: optional Gemma 4 chat, run locally, that explains the existing plans. It does not make plans.
- **In building it**: the team used AI assistants (including Claude, GitHub Copilot and Base44) for code, research, review and design. Every change was reviewed and tested by a team member, and facts were checked against their sources.
- The farmland photo on the title slide is AI-generated and labelled.

## Team Valor Astra

Parambir · Sanat · Abdirahman · Júlia · Faizan · Ammar

## Licence and disclaimer

[MIT](./LICENSE). Rotara is a student prototype. Its plans are a starting point, not advice: check them with local experts and your own field before acting.

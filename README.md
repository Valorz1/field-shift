# Rotara
![Live Demo](https://img.shields.io/badge/LIVE_DEMO-Visit_Rotara-163d32?style=for-the-badge&logo=vercel&logoColor=white) ![Pitch Deck](https://img.shields.io/badge/PITCH_DECK-View_Slides-ddb355?style=for-the-badge&logo=canva&logoColor=163d32) ![NASA Space Apps 2026](https://img.shields.io/badge/NASA-SPACE_APPS_2026-2f6b4f?style=for-the-badge)

!Next.js !FastAPI !Python ![MIT License](https://img.shields.io/badge/License-MIT-ddb355?style=for-the-badge)

**Turning NASA Earth data into smarter crop rotation decisions.**

Built by **Team Valor Astra** for the **NASA Space Apps Challenge 2026**.

[Live app](https://rotara-chi.vercel.app) · [API docs](https://field-shift-backends.onrender.com/docs) · [Demo slides](https://canva.link/um5s5uhjp8bd9gc) · [Methodology](./docs/methodology.md)

> The repo is called `field-shift` because that was our working name. The app is called Rotara.

---

## What is Rotara?

Most climate tools show farmers a pile of numbers. Rotara tries to answer the question that comes next: **"So what should I plant?"**

A farmer picks their field on a map. Rotara compares 25 years of NASA climate data, shows what has changed, and then suggests three different 3-year crop rotation plans. The farmer picks their priorities, compares the plans and makes the final call.

- **25 years** of NASA data (2001–2025)
- **3 rotation plans** to compare
- **0 AI-generated recommendations**. Every plan comes from documented agronomy rules.

---

## Why we built it

Climate change is not only about hotter weather or less rain overall. It is also about *when* the rain falls.

Our Norfolk, UK example shows this well:

| Rainfall | 2001–2020 average | 2021–2025 average | Change |
|---|---:|---:|---:|
| Annual | 706 mm | 693 mm | −2% |
| Summer | 206 mm | 145 mm | **−30%** |

The yearly total barely moved, so a normal dashboard would say "nothing to worry about". But summer is when crops are growing and filling their grain, so a 30% drop matters a lot.

- Every summer from 2021 to 2025 was below the 2001–2020 summer average.
- Summer 2022 had 95 mm and summer 2025 had 105 mm. Both were drier than the driest summer in the baseline (120 mm).

Annual averages can hide seasonal changes. Rotara is built to show them.

---

## How it works

### 1. Find your field
Drop a pin on the map or search for a postcode or village (maps and search use Mapbox).

### 2. See what is changing
Rotara compares two periods:

| Period | Used as |
|---|---|
| 2001–2020 | Historical baseline |
| 2021–2025 | Recent conditions |

It looks at temperature, annual and summer rainfall, root-zone soil wetness, topsoil wetness, and a simple climate risk screening.

### 3. Tell us about your farm
Choose what matters to you, for example:

- Use less water
- Build organic matter
- Add nitrogen naturally
- Stop soil washing away
- Fewer pests and diseases
- Feed for livestock
- Easy to sell
- Keep changes small

You can also add details like water availability, equipment, buyers, soil type and soil organic matter.

### 4. Compare three plans
Rotara generates three rotation plans for the next three years:

| Plan | Idea |
|---|---|
| **Keep the current crop** | What you grow now, as a reference point |
| **Mix in climate-suited crops** | Bring in crops that may suit the changing climate better |
| **Build the soil** | Add a cover crop (often a legume) to improve soil health |

Every plan comes with:

- which of your priorities it matches
- what works for your goals
- what still needs checking
- why the plan was suggested
- published evidence
- risks and limitations

A **Best Fit** label only appears when one plan is clearly ahead.

### 5. Decide
Rotara does not pick for you. The farmer always makes the final decision.

---

## Under the hood

**No AI model produces our numbers or crop plans.** Everything comes from climate calculations, written agronomy rules and published research.

### Climate analysis
Code: `backend/app/services/indicators.py`

We take NASA POWER monthly data, use complete years only, and compare the recent period to the baseline.

### Climate risk screening
We use two simple thresholds that we defined ourselves:

| Condition | Points |
|---|---:|
| Temperature up by 0.5 °C or more | +1 |
| Annual or summer rainfall down by 5% or more | +1 |

| Total | Risk level |
|---|---|
| 0 | LOW |
| 1 | MODERATE |
| 2 | HIGH |

These are project thresholds, **not** official agricultural risk categories. More detail is in [`docs/methodology.md`](./docs/methodology.md).

### Strategy engine
Code: `backend/app/services/strategy_engine.py`

Plans are built from the rules in [`rotation_rules.json`](./backend/app/ai/agronomy/rotation_rules.json), which link to 17 published sources. A few examples:

- **Pulse breaks:** Field beans and peas are not repeated within the 3-year plan. AHDB recommends at least five years between pulse crops.
- **Alfalfa:** A stand can last 4–10+ years and should not be resown straight after itself (UW–Madison Extension guidance).
- **Legume order:** In warm places, a warm-season legume like cowpea is suggested before a cool-season one like chickpea (Sita et al., 2017).

### Preference matching
Code: `frontend/lib/farm-profile.ts`

The farmer's answers do **not** change the science. They are only used to score the plans that already exist, based on which crops they contain, how much water they need and how big the change is.

---

## Data sources

| Dataset | What we use it for | Limitation |
|---|---|---|
| [NASA POWER](https://power.larc.nasa.gov/) (monthly) | Temperature, rainfall, root-zone and topsoil wetness, 2001–2025 | Modelled data (MERRA-2) on a grid of about 50 km |
| NASA POWER (daily) | Frost, heat and heavy rain in the last 30 days | Can be a few days behind |
| [GPM IMERG](https://gpm.nasa.gov/data/imerg) (monthly) | Cross-checking rainfall | Different grid to POWER |
| [SMAP](https://nsidc.org/data/spl3smp_e/versions/6) (L3 Enhanced, 9 km) | Checking soil wetness in Norfolk, 2016–2025 | Only measures the top 5 cm of soil |
| [HLS](https://www.earthdata.nasa.gov/data/projects/hls) (Harmonized Landsat Sentinel-2) | The real satellite photo of Norfolk farmland on the home page | One image from 11 June 2025, for illustration only |

### Checking the data against itself

| Location | NASA POWER rainfall | GPM IMERG rainfall |
|---|---:|---:|
| Norfolk | 706 mm | 735 mm |
| Nevada | 170 mm | 170 mm |

We used SMAP to check the pattern of POWER soil wetness in Norfolk. For Nevada, none of the 1,492 SMAP readings passed the recommended quality checks (0 out of 1,492), so we did not use any of them. We would rather show a limitation than hide it.

---

## Optional AI assistant

Rotara can use a locally hosted **Gemma 4** model to explain plans in simpler words (one or two lines, at a level the farmer chooses).

| The AI can | The AI cannot |
|---|---|
| Explain existing plans | Create crop rotation plans |
| Simplify technical language | Calculate climate indicators |
| Help users understand a recommendation | Make up scientific evidence |

The app works fully without it. It needs a separate model server, so it is **not** available on the deployed version by default.

---

## Privacy

- No account needed
- No farm profile saved on a server
- Your answers stay in your browser session
- Closing the tab clears them

---

## What Rotara does not know

Rotara cannot tell you:

- your real soil, drainage, slope or irrigation
- whether you have pests, weeds or disease
- crop prices, yields, contracts or buyer needs
- what the weather will do in future
- whether a plan will actually work on your farm

Some of these can be entered by the farmer, but Rotara cannot check them.

Things to keep in mind:

- The recent period is only **5 years**. It shows recent change, not a proven long-term trend.
- Western Nevada gets about 20 mm of summer rain, so tiny changes look like huge percentages.
- NASA POWER is modelled data and misses field-level detail.
- Always compare satellite and model data with local measurements and expert advice.

**Rotara is a decision-support prototype. It does not replace an agronomist.**

---

## Tech stack

| Part | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Python, FastAPI |
| Climate data | NASA POWER |
| Rainfall check | GPM IMERG |
| Soil moisture check | SMAP |
| Maps | Mapbox |
| Optional AI explanations | Gemma 4 via Ollama |
| Hosting | Vercel (frontend), Render (backend) |
| Containers | Docker |

---

## Run it locally

**You need:** Python 3.12, Node.js 20+, npm, Git. Docker is optional.

### 1. Clone the repo

```bash
git clone https://github.com/Valorz1/field-shift.git
cd field-shift
```

### 2. Start the backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

```bash
# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

Then install and run:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- API docs: http://localhost:8000/docs

### 3. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

### 4. Add your Mapbox token

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your-token
```

Without this, the map and search will not work.

### 5. Optional: AI explanations

Install [Ollama](https://ollama.com/) and run the `gemma4:e4b` model. See `scripts/pull-model.sh` for the steps.

### Or use Docker

```bash
cp .env.example .env
docker compose up --build
```

### Run the tests

```bash
cd backend
python -m pytest -q
```

---

## Environment variables

| Variable | Where | What it does |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Frontend | Backend URL (default `http://localhost:8000`) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Frontend | Mapbox public access token |
| `ALLOWED_ORIGINS` | Backend | Frontend URLs allowed to call the API, separated by commas |
| `MODEL_BASE_URL` | Backend | Address of the Ollama-compatible model server |
| `MODEL_NAME` | Backend | Name of the model to use (optional) |
| `APP_ENV` | Backend | Which environment the backend is running in |
| `NASA_EARTHDATA_USERNAME`, `NASA_EARTHDATA_PASSWORD` | Data scripts | Only needed to download raw NASA data again |

Never commit secrets or private keys.

---

## Deployment

**Backend (Render)**

1. Create a new Blueprint on Render and connect this repo.
2. Render reads [`render.yaml`](./render.yaml) for the setup.
3. More details in [`backend/RENDER.md`](./backend/RENDER.md).

**Frontend (Vercel)**

1. Import the repo into Vercel and set the root directory to `frontend`.
2. Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_MAPBOX_TOKEN`.
3. Deploy.

Finally, add your Vercel URL to `ALLOWED_ORIGINS` on the backend.

---

## Project structure

```text
field-shift/
├── backend/
│   ├── app/
│   │   ├── services/
│   │   │   ├── indicators.py          # climate calculations
│   │   │   └── strategy_engine.py     # builds the 3 plans
│   │   └── ai/agronomy/
│   │       └── rotation_rules.json    # crop rules + sources
│   ├── requirements.txt
│   └── RENDER.md
├── frontend/
│   ├── app/
│   └── lib/farm-profile.ts            # preference matching
├── data/raw/                          # NASA POWER, GPM IMERG, SMAP data
├── docs/                              # methodology, architecture, privacy, design notes
├── scripts/pull-model.sh
├── render.yaml
├── docker-compose.yml
├── .env.example
└── LICENSE
```

---

## How we used AI

**In the app:** only the optional Gemma 4 explainer. It does not create plans or scientific numbers.

**While building it:** each team member, in their own words:

| Team member | AI tool | What for |
|---|---|---|
| Parambir | Claude (Anthropic), Base44 | Code, research, code review and slides; Base44 for an early dashboard design prototype |
| Sanat | Claude Code (Anthropic) | Strategy engine and climate risk rules |
| Abdirahman | Claude (Anthropic) | AI-assisted coding and research |
| Júlia | Claude (Anthropic) | Writing code and testing |
| Faizan | Microsoft Copilot (Codex model) | Building the deployment layer |
| Ammar | ChatGPT (OpenAI) | Text formatting and research help |

Commits made with Claude are marked as co-authored in the Git history. The demo slides were generated with Canva's AI from our own outline, then checked and edited by the team. A team member reviewed and tested every change, and we checked factual claims against their sources.

The live site has a full statement on its [About & disclosure page](https://rotara-chi.vercel.app/about).

---

## Team Valor Astra

Parambir · Sanat · Abdirahman · Júlia · Faizan · Ammar

Made for the NASA Space Apps Challenge 2026.

---

## Licence

[MIT](./LICENSE). Rotara is a student-built prototype. Its plans are for exploring options, not professional farming advice. Check anything you act on against local conditions and a qualified expert.

**The satellite sees the change. Rotara shows the options. The farmer decides.**

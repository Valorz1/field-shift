# ROTARA
### Turning NASA Earth data into smarter crop rotation decisions.

<p align="center">
  <strong>25 YEARS OF NASA DATA · 3 INTELLIGENT ROTATION PLANS · 1 FARMER-FIRST APPROACH</strong>
</p>

<p align="center">
  Built for the <strong>NASA Space Apps Challenge 2026</strong><br/>
  by <strong>TEAM VALOR ASTRA</strong>
</p>

<p align="center">
  <a href="https://rotara-chi.vercel.app"><strong>EXPLORE ROTARA</strong></a>
  &nbsp; · &nbsp;
  <a href="https://field-shift-backends.onrender.com/docs"><strong>API DOCUMENTATION</strong></a>
  &nbsp; · &nbsp;
  <a href="./docs/methodology.md"><strong>OUR METHODOLOGY</strong></a>
</p>

---

## THE IDEA

**What if farmers could see how their climate is changing before deciding what to plant next?**

Climate change is not just about hotter temperatures or less rainfall. It is also about *when* rain falls, how soil moisture changes, and whether traditional crop choices will remain suitable.

Farmers need information they can actually use.

That's where **Rotara** comes in.

Rotara combines 25 years of NASA Earth observation data with agronomic research to help farmers understand their fields and explore smarter crop rotation strategies.

Find your field.  
Understand its climate.  
Explore three possible futures.  
Make the decision yourself.

**We bring the data. You stay in control.**

---

## EXPLORE ROTARA

| Resource | Link |
|---|---|
| Live application | [Launch Rotara](https://rotara-chi.vercel.app) |
| Backend API | [Explore API documentation](https://field-shift-backends.onrender.com/docs) |
| Demo presentation | [View the 7-slide demo](https://canva.link/um5s5uhjp8bd9gc) |

---

## WHAT MAKES ROTARA DIFFERENT?

Most climate dashboards show you numbers.

**Rotara connects those numbers to decisions.**

Instead of simply telling a farmer that summer rainfall has decreased, Rotara explores what that could mean for crop choices and presents alternative rotations backed by documented agronomic rules.

### 01 — Climate intelligence

Analyse 25 years of NASA POWER data to compare recent conditions against historical averages.

### 02 — Seasonal change detection

See changes in temperature, annual rainfall, summer rainfall and soil wetness.

### 03 — Three-year crop strategies

Explore three different crop rotation scenarios, each designed around a different agricultural objective.

### 04 — Evidence, not AI guesses

Crop plans are generated through documented agronomic rules and published research, not an AI model making up recommendations.

### 05 — Farmer-first decisions

Farmers can set their priorities, compare trade-offs and decide which strategy makes sense for their land.

---

## THE ROTARA EXPERIENCE

### 01. Find your field

Drop a pin on the interactive map or search for a postcode or village.

Powered by Mapbox.

### 02. Discover what is changing

Rotara analyses climate indicators using two comparison periods:

| Period | Role |
|---|---|
| 2001–2020 | Historical baseline |
| 2021–2025 | Recent conditions |

Explore:
- Temperature changes.
- Annual and seasonal precipitation.
- Root-zone soil wetness.
- Topsoil wetness.
- Climate risk screening.

### 03. Tell us about your farm

Every farm has different needs.

Farmers can select priorities such as:

- Use less water.
- Build organic matter.
- Add nitrogen.
- Reduce soil erosion.
- Reduce pest and disease pressure.
- Produce livestock feed.
- Maintain marketability.
- Keep changes manageable.

They can also provide information about water availability, equipment, buyers, soil type and soil organic matter.

### 04. Explore three possible futures

Rotara generates three alternative crop rotation plans for the next three years.

| Strategy | What it explores |
|---|---|
| **The Baseline** | Keep the current crop as a reference scenario |
| **The Climate Switch** | Introduce crops that may better suit the identified climate conditions |
| **The Soil Builder** | Incorporate cover crops, often legumes, to support soil health |

Every strategy includes:

- A priority matching score.
- What works for the farmer's goals.
- What needs checking.
- Why the strategy was suggested.
- Published supporting evidence.
- Potential risks.
- Important limitations and unchecked factors.

A **Best Fit** label is shown only when one strategy clearly leads.

### 05. Compare. Understand. Decide.

Compare all three strategies side by side.

Rotara does not force a decision or pretend there is one perfect rotation.

**The farmer has the final say. Always.**

---

## REAL DATA. REAL CLIMATE INSIGHTS.

### The Norfolk case study

One of the most interesting findings from our analysis came from Norfolk, UK.

At first glance, annual rainfall seems relatively stable.

But look closer.

| Rainfall indicator | 2001–2020 | 2021–2025 | Difference |
|---|---:|---:|---:|
| Annual rainfall | 706 mm | 693 mm | −2% |
| Summer rainfall | 206 mm | 145 mm | **−30%** |

<details>
<summary><strong>Why is this important?</strong></summary>

Summer rainfall is particularly important during crop development and grain filling.

Despite only a 2% reduction in annual rainfall, summer rainfall decreased by 30%.

The pattern was consistent across the recent period:

- Every summer from 2021 to 2025 was below the 2001–2020 summer average.
- Summer 2022 recorded just 95 mm.
- Summer 2025 recorded just 105 mm.
- Both were below the driest summer in the 2001–2020 baseline, which recorded 120 mm.

**The takeaway:** Annual averages can hide important seasonal changes. Rotara helps bring those changes to the surface.

</details>

This is exactly the kind of insight we want to make accessible to farmers.

---

## UNDER THE HOOD: HOW ROTARA WORKS

**No AI model generates our scientific numbers or crop rotation plans.**

Rotara uses a combination of climate calculations, documented agronomic rules and published research.

### 1. Climate analysis

Implementation: `backend/app/services/indicators.py`

NASA POWER monthly data is processed using complete years only.

The application calculates climate indicators and compares recent conditions with the historical baseline.

### 2. Climate risk screening

Rotara uses two team-defined screening thresholds:

| Condition | Points |
|---|---:|
| Temperature increased by 0.5 °C or more | +1 |
| Annual or summer rainfall decreased by 5% or more | +1 |

| Total score | Classification |
|---|---|
| 0 | LOW |
| 1 | MODERATE |
| 2 | HIGH |

These are project-specific screening thresholds, not official agricultural risk classifications.

Full details: [`docs/methodology.md`](./docs/methodology.md).

### 3. Agronomic strategy engine

Implementation: `backend/app/services/strategy_engine.py`

Rotations are generated using documented crop rules:

[`rotation_rules.json`](./backend/app/ai/agronomy/rotation_rules.json)

These rules are connected to 17 published sources.

Some examples:

**Pulse crop breaks**

Pulses such as field beans and peas are not repeated within the three-year rotation. AHDB recommends at least five years between pulse crops.

**Alfalfa management**

Alfalfa stands can last 4–10+ years and should not be resown immediately after themselves, following UW–Madison Extension guidance.

**Climate suitability**

Warm-season legumes such as cowpea are positioned before cool-season legumes such as chickpea, based on research by Sita et al. (2017).

### 4. Farmer preference matching

Implementation: `frontend/lib/farm-profile.ts`

Farmer answers do not change the underlying science.

Instead, Rotara evaluates the characteristics of existing plans, including:
- Which crops they contain.
- Their water requirements.
- How substantial the required changes are.

This provides context about how each plan aligns with farmer priorities.

---

## POWERED BY NASA EARTH OBSERVATION

Rotara uses multiple datasets to analyse climate conditions and independently examine important patterns.

| Dataset | What we use it for | Important limitation |
|---|---|---|
| [NASA POWER](https://power.larc.nasa.gov/) — Monthly | Temperature, rainfall, root-zone and topsoil wetness (2001–2025) | MERRA-2 modelled data, approximately 50 km grid |
| NASA POWER — Daily | Frost, heat and heavy rainfall indicators over the last 30 days | Data can run several days behind |
| [GPM IMERG](https://gpm.nasa.gov/data/imerg) — Monthly | Independent rainfall cross-checking | Different spatial grids |
| [SMAP](https://nsidc.org/data/spl3smp_e/versions/6) — L3 Enhanced 9 km | Soil wetness comparison for Norfolk (2016–2025) | Measures the top 5 cm of soil |
| [HLS](https://www.earthdata.nasa.gov/data/projects/hls) (Harmonized Landsat Sentinel-2) | The real satellite photo of Norfolk farmland on the home page | A single image from 11 June 2025, used for illustration only |

### Data validation

We also compared independent datasets to understand where the observed patterns agree.

| Location | NASA POWER rainfall | GPM IMERG rainfall |
|---|---:|---:|
| Norfolk | 706 mm | 735 mm |
| Nevada | 170 mm | 170 mm |

SMAP observations were used to check the pattern of NASA POWER soil wetness in Norfolk.

For Nevada, 0 out of 1,492 SMAP readings met recommended quality criteria, so none were used.

**We believe transparency matters as much as accuracy.** Where data quality is limited, we make that limitation visible rather than hiding it.

---

## OPTIONAL AI ASSISTANT

Rotara includes an optional locally hosted **Gemma 4** model for explaining existing recommendations.

It can turn technical explanations into simpler one- or two-line answers, with the explanation level selected by the farmer.

But there is an important distinction:

| AI can | AI cannot |
|---|---|
| Explain existing plans | Generate crop rotation plans |
| Simplify technical language | Calculate climate indicators |
| Help users understand recommendations | Invent scientific evidence |

The science and strategy generation remain separate from the language model.

---

## PRIVACY BY DESIGN

Farm information should belong to the farmer.

Rotara is designed without mandatory accounts or server-side user profiles.

- No account required.
- No farm profile stored on a server.
- Information stays in the browser session.
- Session data disappears when the browser tab closes.

---

## WHAT ROTARA DOES NOT KNOW

We believe an honest tool is a better tool.

Rotara cannot independently determine:

- Actual soil composition, drainage, slope or irrigation conditions.
- Existing pests, weeds or diseases.
- Crop prices, yields, contracts or buyer requirements.
- Future weather conditions.
- Whether a proposed rotation will succeed on a particular farm.

Some details can be supplied by the farmer, but not independently verified by the application.

**Important considerations:**

- The recent comparison period is only five years. It shows recent change, not a definitive long-term climate trend.
- Western Nevada receives around 20 mm of summer rainfall, so small changes can produce large percentage differences.
- NASA POWER uses modelled data and cannot capture every field-level difference.
- Satellite and model data should be considered alongside local measurements and professional expertise.

Rotara is a decision-support prototype, not a replacement for an agronomist.

---

## TECHNOLOGY STACK

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Python, FastAPI |
| Climate data | NASA POWER |
| Rainfall validation | GPM IMERG |
| Soil moisture validation | SMAP |
| Interactive mapping | Mapbox |
| Optional AI explanations | Gemma 4 via Ollama |
| Backend deployment | Render |
| Frontend deployment | Vercel |
| Containerisation | Docker |

---

## RUN ROTARA LOCALLY

### Prerequisites

- Python 3.12
- Node.js 20+
- npm
- Git

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_NAME>
```

### 2. Start the backend

```bash
cd backend

python -m venv .venv
```

Activate the environment:

**Windows**

```bash
.venv\Scripts\activate
```

**macOS / Linux**

```bash
source .venv/bin/activate
```

Install dependencies and start the API:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend: http://localhost:8000

API documentation: http://localhost:8000/docs

### 3. Start the frontend

Open another terminal:

```bash
cd frontend

npm install
npm run dev
```

Frontend: http://localhost:3000

### 4. Configure Mapbox

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your-token
```

Add your Mapbox public access token to enable maps and address search.

### 5. Optional AI setup

Install [Ollama](https://ollama.com/) and run the `gemma4:e4b` model.

See `scripts/pull-model.sh` for setup instructions.

The core application works without the optional model.

### 6. Run using Docker

Alternatively:

```bash
cp .env.example .env
docker compose up --build
```

### 7. Run tests

```bash
cd backend
python -m pytest -q
```

---

## ENVIRONMENT VARIABLES

| Variable | Location | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Frontend | Backend URL; defaults to `http://localhost:8000` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Frontend | Mapbox public access token |
| `ALLOWED_ORIGINS` | Backend | Comma-separated frontend origins |
| `MODEL_BASE_URL` | Backend | Ollama-compatible model server |
| `MODEL_NAME` | Backend | Optional model name |

Do not commit private credentials or secrets.

---

## DEPLOYMENT

### Backend — Render

1. Create a new Blueprint on Render.
2. Connect this repository.
3. Use [`render.yaml`](./render.yaml) for deployment configuration.

Additional instructions: [`backend/RENDER.md`](./backend/RENDER.md).

### Frontend — Vercel

1. Import the repository into Vercel.
2. Set the root directory to `frontend`.
3. Configure `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_MAPBOX_TOKEN`.
4. Deploy.

Finally, configure `ALLOWED_ORIGINS` on the backend to include the deployed Vercel URL.

**Note:** The optional AI assistant requires a separate model server and is not available on the deployed application by default.

---

## PROJECT STRUCTURE

```text
ROTARA/
│
├── backend/
│   ├── app/
│   │   ├── services/
│   │   │   ├── indicators.py
│   │   │   └── strategy_engine.py
│   │   └── ai/
│   │       └── agronomy/
│   │           └── rotation_rules.json
│   ├── requirements.txt
│   └── RENDER.md
│
├── frontend/
│   ├── app/
│   └── lib/
│       └── farm-profile.ts
│
├── data/
│   └── raw/
│       └── NASA POWER, GPM IMERG and SMAP data
│
├── docs/
│   ├── methodology.md
│   ├── architecture/
│   ├── privacy/
│   └── design notes
│
├── scripts/
│   └── pull-model.sh
│
├── render.yaml
├── docker-compose.yml
├── .env.example
└── LICENSE
```

---

## TRANSPARENCY: OUR USE OF AI

AI supported the development of Rotara, but the project's scientific calculations and crop rotation logic are independently implemented.

**AI in the application:** An optional Gemma 4 model explains existing recommendations. It does not generate plans or scientific numbers.

**AI during development:** each team member, in their own words:

| Team member | AI tool | What for |
|---|---|---|
| Parambir | Claude (Anthropic), Base44 | Code, research, code review and slides; Base44 for an early dashboard design prototype |
| Sanat | Claude Code (Anthropic) | Strategy engine and climate risk rules |
| Abdirahman | Claude (Anthropic) | AI-assisted coding and research |
| Júlia | Claude (Anthropic) | Writing code and testing |
| Faizan | Microsoft Copilot (Codex model) | Building the deployment layer |
| Ammar | ChatGPT (OpenAI) | Text formatting and research help |

Commits made with Claude are marked as co-authored in the Git history. The demo slides were generated with Canva's AI from our own outline, then checked and edited by the team.

Every change was reviewed and tested by a team member, and factual claims were checked against their sources. The live site has a full statement on its [About & disclosure page](https://rotara-chi.vercel.app/about).

---

## THE TEAM BEHIND ROTARA

### TEAM VALOR ASTRA

**Parambir · Sanat · Abdirahman · Júlia · Faizan · Ammar**

Built with curiosity, collaboration and a shared interest in using space technology to solve challenges here on Earth.

Created for the **NASA Space Apps Challenge 2026**.

---

## LICENCE

Released under the [MIT Licence](./LICENSE).

Rotara is a student-built prototype. Its crop rotation plans are intended for exploration and decision support, not professional agricultural advice.

Always verify recommendations against local field conditions, measurements and qualified agricultural expertise before implementation.

---

<p align="center">

### BETTER DATA. SMARTER ROTATIONS. STRONGER FUTURES.

**The satellite sees the change. Rotara explains the possibilities. The farmer decides.**

**TEAM VALOR ASTRA — NASA SPACE APPS CHALLENGE 2026**

</p>
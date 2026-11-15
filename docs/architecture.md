# Architecture

- **Frontend:** Next.js App Router, React, Tailwind CSS, Chart.js and Mapbox GL JS. Hosted on Vercel: https://rotara-chi.vercel.app
- **Backend:** FastAPI, hosted on Render. Routers in `backend/app/routers/`: `climate`, `soil`, `strategies`, `chat`, `photo` and `sources`. API docs: https://field-shift-backends.onrender.com/docs
- **Data providers** (`backend/app/services/`): NASA POWER (monthly and daily), GPM IMERG and SMAP adapters, plus the indicators and the rules-based strategy engine. Every threshold and rule is in [methodology.md](./methodology.md).
- **Crop rules:** cited rules in `backend/app/ai/agronomy/rotation_rules.json`. The plans come from these rules, not from AI.
- **Optional AI chat:** `backend/app/ai/` holds the local Gemma 4 client (through Ollama), the prompt levels and the output guardrails. It explains the existing plans in 1 or 2 lines; it does not make plans or change numbers, and it is not part of the live website.
- **Session model:** the farm, crop and answers live in an in-memory store in the browser (`frontend/lib/session-store.ts`) and are cleared on refresh. There is no database. See [privacy.md](./privacy.md).

See the repository tree and `docker-compose.yml` for the local development setup.

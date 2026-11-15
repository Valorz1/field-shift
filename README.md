# Field Shift

A prototype decision-support workspace for climate-aware farm planning.

## What it is
Field Shift combines farm-session inputs, climate and soil indicators, and cited agronomy guidance to help users explore practical strategies. It is a decision-support prototype, not a substitute for local agronomic advice.

## Run locally
Prerequisites: Docker Desktop / Docker Engine with Compose.

1. Copy `.env.example` to `.env` and fill in credentials if needed.
2. Run `docker compose up --build`.
3. Frontend: http://localhost:3000
4. Backend API: http://localhost:8000/docs
5. Local model runner: configured through `MODEL_BASE_URL` and `MODEL_NAME`.

The initial scaffold includes service placeholders; connect data providers and a model runner before relying on live outputs.

## Deploy the backend to Render

The repository includes a Render Blueprint for the backend-only API service.
See [backend/RENDER.md](./backend/RENDER.md) for deployment steps and environment
variables.

## Data sources
Planned integrations:
- NASA POWER: meteorological and solar data.
- NASA GPM IMERG: precipitation estimates.
- NASA SMAP: soil-moisture observations.

Check provider documentation, licensing, latency, spatial resolution, and attribution requirements before production use.

## Privacy
Farm-session data is held in browser memory by the starter frontend and is not persisted by this scaffold. Do not enter sensitive information into a deployment until storage, access controls, retention, and security have been reviewed.

## Disclaimer
Outputs are informational and experimental. Satellite-derived products and model-generated suggestions can be uncertain or incomplete. Verify recommendations with qualified local experts and ground observations.

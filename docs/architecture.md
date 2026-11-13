# Architecture

- **Frontend:** Next.js App Router and Tailwind CSS.
- **Backend:** FastAPI routers expose climate, soil, strategy, chat, and photo endpoints.
- **AI layer:** local model client, prompt levels, and output guardrails.
- **Data providers:** NASA POWER, GPM IMERG, and SMAP service adapters.
- **Session model:** starter farm context is volatile in frontend memory; no database is configured.

See the repository tree and `docker-compose.yml` for the development topology.

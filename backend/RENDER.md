# Deploy the backend to Render

The repository-root `render.yaml` defines one Render web service for the FastAPI
backend. It does not create or deploy the frontend.

## Deploy

1. In Render, create a Blueprint from this repository and select `render.yaml`.
2. Leave the service root directory unset. The backend reads its demo datasets
   from the repository's top-level `data/raw` directory.
3. Render installs `backend/requirements.txt` and starts the app with
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. After deployment, check `/health` and open `/docs` on the service URL.

## Environment

- `ALLOWED_ORIGINS`: comma-separated exact origins of browser clients, for
  example `https://your-frontend.example`. Keep it empty until a frontend is
  deployed. Local development origins are already allowed.
- `MODEL_BASE_URL`: optional URL of a remotely reachable Ollama-compatible
  service. Render does not run the local Ollama service from `docker-compose.yml`;
  chat requests return `503` until this points to a reachable model service.
- `MODEL_NAME`: model name available from that service. The Blueprint defaults
  this to `gemma4:e4b`.

NASA POWER requests do not require credentials. Demo climate and strategy
endpoints use the checked-in sample datasets.

This deployment does not add authentication or rate limiting. Do not expose it
to sensitive or untrusted use without adding those controls.

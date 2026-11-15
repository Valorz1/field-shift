import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import climate, soil, strategies, chat, photo

app = FastAPI(title="Field Shift API", version="0.1.0")

# Let the Next.js frontend call this API from the browser: port 3000 locally, plus the deployed site's
# address from ALLOWED_ORIGINS (comma-separated, e.g. "https://rotara.example.app").
LOCAL_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
EXTRA_ORIGINS = [o.strip().rstrip("/") for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=LOCAL_ORIGINS + EXTRA_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(climate.router, prefix="/climate", tags=["climate"])
app.include_router(soil.router, prefix="/soil", tags=["soil"])
app.include_router(strategies.router, prefix="/strategies", tags=["strategies"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(photo.router, prefix="/photo", tags=["photo"])


@app.get("/health")
def health():
    return {"status": "ok"}
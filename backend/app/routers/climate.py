"""Climate routes: NASA POWER monthly data for the frontend.

GET  /climate/demo/{name}  -> saved data for a demo farm (fast, works offline)
POST /climate/             -> live NASA POWER data for any lat/lon (slower)
"""
import csv
from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.schemas import LocationRequest
from app.services.nasa_power import fetch_monthly, to_rows

router = APIRouter()

# backend/app/routers/climate.py -> repo root is 3 folders up
DATA_DIR = Path(__file__).resolve().parents[3] / "data" / "raw"
DEMO_FARMS = {"norfolk", "nevada"}


@router.get("/demo/{name}")
def demo_climate(name: str):
    if name not in DEMO_FARMS:
        raise HTTPException(404, f"Unknown demo farm. Use one of: {sorted(DEMO_FARMS)}")
    path = DATA_DIR / f"power_{name}_monthly.csv"
    if not path.exists():
        raise HTTPException(404, f"Data file missing: {path.name}")
    with path.open(encoding="utf-8") as f:
        rows = [{**r, "value": float(r["value"])} for r in csv.DictReader(f)]
    return {"farm": name, "source": "NASA POWER", "rows": rows}


@router.post("/")
def live_climate(payload: LocationRequest):
    try:
        rows = _live_rows(round(payload.latitude, 2), round(payload.longitude, 2))
    except Exception as exc:  # network or NASA error
        raise HTTPException(502, f"Could not reach NASA POWER: {exc}") from exc
    return {"latitude": payload.latitude, "longitude": payload.longitude,
            "source": "NASA POWER", "rows": rows}


@lru_cache(maxsize=64)
def _live_rows(lat: float, lon: float) -> list[dict]:
    return to_rows(fetch_monthly(lat, lon))
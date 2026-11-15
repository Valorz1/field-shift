"""Climate routes: NASA POWER monthly data for the frontend.

GET  /climate/demo/{name}  -> saved data for a demo farm (fast, works offline):
                              NASA POWER rows, plus GPM IMERG and NASA SMAP rows when available
POST /climate/             -> live NASA POWER data for any lat/lon (slower)
GET  /climate/recent       -> the last 30 days from NASA POWER daily data vs the usual weather
"""
import csv
from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query

from app.schemas import LocationRequest
from app.services.nasa_power import fetch_monthly, to_rows
from app.services.recent_weather import fetch_daily, monthly_baseline, recent_window, summarise_recent

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
    rows = _read_rows(path)
    sources = ["NASA POWER"]
    # Satellite rain from GPM IMERG, when it has been downloaded for this farm.
    imerg = DATA_DIR / f"imerg_{name}_monthly.csv"
    if imerg.exists():
        rows += _read_rows(imerg)
        sources.append("GPM IMERG")
    # Satellite soil moisture from NASA SMAP, when it has been downloaded for this farm.
    smap = DATA_DIR / f"smap_{name}_monthly.csv"
    if smap.exists():
        rows += _read_rows(smap)
        sources.append("NASA SMAP")
    return {"farm": name, "source": " + ".join(sources), "sources": sources, "rows": rows}


def _read_rows(path: Path) -> list[dict]:
    with path.open(encoding="utf-8") as f:
        return [{**r, "value": float(r["value"])} for r in csv.DictReader(f)]


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

@router.get("/recent")
def recent_weather(latitude: float = Query(ge=-90, le=90), longitude: float = Query(ge=-180, le=180),
                   farm: str | None = None):
    """Last 30 days on the field. farm = a demo farm name, to use its saved monthly data as the usual."""
    lat, lon = round(latitude, 2), round(longitude, 2)
    try:
        if farm in DEMO_FARMS and (DATA_DIR / f"power_{farm}_monthly.csv").exists():
            history = _read_rows(DATA_DIR / f"power_{farm}_monthly.csv")
        else:
            history = _live_rows(lat, lon)
        start, end = recent_window()
        raw = fetch_daily(lat, lon, start, end)
    except Exception as exc:  # network or NASA error
        raise HTTPException(502, f"Could not reach NASA POWER: {exc}") from exc
    try:
        summary = summarise_recent(raw, monthly_baseline(history))
    except ValueError as exc:
        raise HTTPException(404, str(exc)) from exc
    return {"latitude": latitude, "longitude": longitude, **summary}

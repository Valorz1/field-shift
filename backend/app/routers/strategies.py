"""Strategy routes: NASA climate summary + the three rotation strategies.

GET  /strategies/demo/{name}?crop=wheat  -> saved data for a demo farm (fast)
POST /strategies/                        -> live NASA POWER data for any lat/lon

Both return {"farm", "climate", "risk", "strategies", "disclaimer"}.
The strategies come from Sanat's rules engine, not from the AI.
"""
import csv
import tempfile
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.routers.climate import DATA_DIR, DEMO_FARMS, _live_rows
from app.services.indicators import climate_summary
from app.services.strategy_engine import build_strategies

router = APIRouter()

DEMO_DEFAULTS = {
    "norfolk": {"name": "Norfolk demo farm", "latitude": 52.65, "longitude": 0.90, "crop": "wheat"},
    "nevada": {"name": "Nevada demo farm", "latitude": 39.47, "longitude": -118.78, "crop": "alfalfa"},
}

DISCLAIMER = (
    "These recommendations identify patterns and potential adaptation strategies. "
    "They do not replace farmer judgment, local agricultural expertise, field "
    "assessments, or professional agronomic advice."
)


class StrategyRequest(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    crop: str = Field(min_length=1, description="The crop the farmer grows now, e.g. wheat")
    name: str | None = None


@router.get("/demo/{name}")
def demo_strategies(name: str, crop: str | None = None):
    if name not in DEMO_FARMS:
        raise HTTPException(404, f"Unknown demo farm. Use one of: {sorted(DEMO_FARMS)}")
    path = DATA_DIR / f"power_{name}_monthly.csv"
    if not path.exists():
        raise HTTPException(404, f"Data file missing: {path.name}")
    farm = {**DEMO_DEFAULTS[name], "crop": crop or DEMO_DEFAULTS[name]["crop"]}
    return _respond(farm, path)


@router.post("/")
def live_strategies(payload: StrategyRequest):
    try:
        rows = _live_rows(round(payload.latitude, 2), round(payload.longitude, 2))
    except Exception as exc:  # network or NASA error
        raise HTTPException(502, f"Could not reach NASA POWER: {exc}") from exc
    farm = payload.model_dump()
    # climate_summary reads a CSV, so write the live rows to a temporary file.
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "live.csv"
        with path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["date", "parameter", "value", "unit", "source", "label"])
            writer.writeheader()
            writer.writerows(rows)
        return _respond(farm, path)


def _respond(farm: dict, csv_path: Path) -> dict:
    try:
        summary = climate_summary(csv_path)
        strategies = build_strategies(farm, summary["climate"], summary["risk"])
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    return {
        "farm": farm,
        "climate": summary["climate"],
        "risk": summary["risk"],
        "strategies": strategies,
        "disclaimer": DISCLAIMER,
    }

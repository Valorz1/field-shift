"""AI helper route: Gemma 4 (local, through Ollama) explains the farm data in 1-2 lines.

POST /chat/  {"message": "...", "level": 1|2|3, "farm": {"demo": "norfolk", "crop": "wheat"}}
         or  {"message": "...", "level": 2, "farm": {"latitude": 52.6, "longitude": 0.9, "crop": "wheat"}}

The AI never makes the plans. It gets the NASA figures and the 3 plans from the
strategies route and only explains them. Nothing is stored.
"""
import json
from pathlib import Path

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, model_validator

from app.ai import client, guardrails
from app.routers import strategies

router = APIRouter()

PROMPTS = Path(__file__).resolve().parents[1] / "ai" / "prompts"
LEVEL_PROMPTS = {1: "level-1-advice.md", 2: "level-2-compare.md", 3: "level-3-schedule.md"}
NOTE = "AI explanation of the NASA data and the app's plans. Check with a local adviser before deciding."


class ChatFarm(BaseModel):
    demo: str | None = Field(default=None, description="norfolk or nevada")
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    crop: str | None = None

    @model_validator(mode="after")
    def _demo_or_location(self):
        if self.demo is None and (self.latitude is None or self.longitude is None or not self.crop):
            raise ValueError("give either 'demo', or 'latitude', 'longitude' and 'crop'")
        return self


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    level: int = Field(default=2, ge=1, le=3)
    farm: ChatFarm


@router.post("/")
def chat(payload: ChatRequest):
    level = guardrails.validate_level(payload.level)
    data = _farm_data(payload.farm)
    messages = [
        {"role": "system", "content": _prompt("system.md") + "\n\n" + _prompt(LEVEL_PROMPTS[level])},
        {"role": "user", "content": "Farm data:\n" + json.dumps(_compact(data), ensure_ascii=False)
         + "\n\nFarmer's question: " + payload.message.strip()},
    ]
    try:
        raw = client.chat(messages)
    except httpx.HTTPError as exc:
        raise HTTPException(503, "The AI helper isn't running. Start Ollama with the Gemma model, then try again.") from exc
    reply = guardrails.clean_reply(raw)
    if not reply:
        reply = "Sorry, I don't have an answer for that. Try asking about your farm's rain, temperature or the 3 plans."
    return {"reply": reply, "level": level, "label": "ai", "model": client.MODEL_NAME, "note": NOTE}


def _farm_data(farm: ChatFarm) -> dict:
    if farm.demo is not None:
        return strategies.demo_strategies(farm.demo, farm.crop)
    return strategies.live_strategies(strategies.StrategyRequest(
        latitude=farm.latitude, longitude=farm.longitude, crop=farm.crop))


def _compact(data: dict) -> dict:
    """Only what the AI needs, so the prompt stays short and the model stays on topic."""
    def num(m):
        """Round for farmers: whole % and mm, one decimal for °C (e.g. "about 30 %", not 29.58 %)."""
        if not (isinstance(m, dict) and "value" in m):
            return m
        value, unit = m["value"], m["unit"]
        if isinstance(value, (int, float)):
            value = round(value, 1) if "°C" in unit else round(value)
        return f"{value} {unit}"

    climate = data["climate"]
    return {
        "farm": {k: data["farm"].get(k) for k in ("name", "crop", "latitude", "longitude")},
        "periods": climate["periods"],
        "temperature": {k: num(climate["temperature"][k]) for k in ("baseline", "recent", "change")},
        "yearly_rain": {k: num(v) for k, v in climate["rainfall"].items() if k != "years_used"},
        "summer_rain": {k: num(v) for k, v in climate["summer_rainfall"].items() if k != "years_used"},
        "risk": data["risk"]["level"],
        "plans": [
            {k: s.get(k) for k in ("title", "rotation_crops", "why", "benefits", "risks", "gaps",
                                   "water_need", "confidence")}
            for s in data["strategies"]
        ],
        "source": "NASA POWER monthly data; plans from Field Shift's cited crop rules",
    }


def _prompt(name: str) -> str:
    return (PROMPTS / name).read_text(encoding="utf-8").strip()

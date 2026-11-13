from pydantic import BaseModel
from typing import Literal

RiskCategory = Literal["low", "moderate", "high", "unknown"]

class LocationRequest(BaseModel):
    latitude: float
    longitude: float

class IndicatorResponse(BaseModel):
    name: str
    value: float | None = None
    unit: str = ""
    risk: RiskCategory = "unknown"
    source: str
    note: str | None = None

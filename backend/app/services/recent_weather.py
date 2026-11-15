"""The last 30 days on a field, from NASA POWER daily data, compared with the usual weather.

NASA POWER daily data runs up to a few days ago, so "the last 30 days" ends on the latest day
NASA has a value for, not on today. "Usual" comes from the monthly 2001-2020 averages:
usual rain for a day is that month's average total spread evenly over its days, and usual
temperature is that month's average temperature. No forecast: only what has already happened.
"""
from __future__ import annotations

import calendar
from datetime import date, timedelta
from statistics import mean

import httpx

DAILY_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
DAILY_PARAMETERS = ["T2M", "T2M_MIN", "T2M_MAX", "PRECTOTCORR"]
BASELINE = (2001, 2020)
DAYS = 30
FROST_C = 0.0
# Heat stress: many crops suffer above about 30 °C, wheat most around flowering.
HEAT_C = 30.0
# Heavy rain: 20 mm or more in a day, the "very heavy precipitation day" of the ETCCDI climate indices (R20mm).
HEAVY_RAIN_MM = 20.0


def fetch_daily(lat: float, lon: float, start: date, end: date, timeout: float = 60) -> dict:
    """Raw JSON from the POWER daily point API."""
    params = {
        "parameters": ",".join(DAILY_PARAMETERS),
        "community": "AG",
        "latitude": lat,
        "longitude": lon,
        "start": start.strftime("%Y%m%d"),
        "end": end.strftime("%Y%m%d"),
        "format": "JSON",
    }
    response = httpx.get(DAILY_URL, params=params, timeout=timeout)
    response.raise_for_status()
    return response.json()


def _daily_values(raw: dict) -> dict[date, dict[str, float]]:
    """Day -> {parameter: value}, keeping only days where NASA has every parameter."""
    fill = raw.get("header", {}).get("fill_value", -999)
    series = raw.get("properties", {}).get("parameter", {})
    days: dict[date, dict[str, float]] = {}
    for name in DAILY_PARAMETERS:
        for key, value in series.get(name, {}).items():
            if value is None or value == fill:
                continue
            day = date(int(key[:4]), int(key[4:6]), int(key[6:8]))
            days.setdefault(day, {})[name] = float(value)
    return {d: v for d, v in days.items() if len(v) == len(DAILY_PARAMETERS)}


def monthly_baseline(rows: list[dict]) -> dict[int, dict[str, float]]:
    """Calendar month -> usual temperature (°C) and usual rain total (mm), 2001-2020."""
    start, end = BASELINE
    picked: dict[int, dict[str, list[float]]] = {}
    for row in rows:
        year, month = int(row["date"][:4]), int(row["date"][5:7])
        if not start <= year <= end:
            continue
        if row["parameter"] == "T2M":
            picked.setdefault(month, {}).setdefault("temperature", []).append(float(row["value"]))
        elif row["parameter"] == "PRECTOTCORR_MONTH_TOTAL":
            picked.setdefault(month, {}).setdefault("rain", []).append(float(row["value"]))
    return {
        month: {"temperature": mean(v["temperature"]), "rain": mean(v["rain"])}
        for month, v in picked.items()
        if v.get("temperature") and v.get("rain")
    }


def summarise_recent(raw: dict, baseline: dict[int, dict[str, float]], days: int = DAYS) -> dict:
    """The last `days` days NASA has data for, against the usual weather for those days."""
    values = _daily_values(raw)
    if not values:
        raise ValueError("NASA POWER has no recent daily data for this place.")
    window = sorted(values)[-days:]
    missing = [d.month for d in window if d.month not in baseline]
    if missing:
        raise ValueError("No usual weather to compare with for these months.")

    rain = sum(values[d]["PRECTOTCORR"] for d in window)
    usual_rain = sum(baseline[d.month]["rain"] / calendar.monthrange(d.year, d.month)[1] for d in window)
    temperature = mean(values[d]["T2M"] for d in window)
    usual_temperature = mean(baseline[d.month]["temperature"] for d in window)
    hottest = max(window, key=lambda d: values[d]["T2M_MAX"])
    coldest = min(window, key=lambda d: values[d]["T2M_MIN"])
    wettest = max(window, key=lambda d: values[d]["PRECTOTCORR"])

    return {
        "period": {"start": window[0].isoformat(), "end": window[-1].isoformat(), "days": len(window)},
        "rain": {
            "recent_mm": round(rain, 1),
            "usual_mm": round(usual_rain, 1),
            "change_pct": round((rain / usual_rain - 1) * 100, 1) if usual_rain > 0 else None,
        },
        "temperature": {
            "recent_c": round(temperature, 1),
            "usual_c": round(usual_temperature, 1),
            "change_c": round(temperature - usual_temperature, 1),
        },
        "frost_nights": sum(1 for d in window if values[d]["T2M_MIN"] < FROST_C),
        "heat_days": sum(1 for d in window if values[d]["T2M_MAX"] >= HEAT_C),
        "heavy_rain_days": sum(1 for d in window if values[d]["PRECTOTCORR"] >= HEAVY_RAIN_MM),
        "wettest": {"date": wettest.isoformat(), "mm": round(values[wettest]["PRECTOTCORR"], 1)},
        "hottest": {"date": hottest.isoformat(), "max_c": round(values[hottest]["T2M_MAX"], 1)},
        "coldest": {"date": coldest.isoformat(), "min_c": round(values[coldest]["T2M_MIN"], 1)},
        "source": "NASA POWER daily",
        "usual": "2001-2020 monthly averages from NASA POWER",
    }


def recent_window(today: date | None = None, lookback: int = 45) -> tuple[date, date]:
    """Ask NASA for a little more than 30 days: the newest few days are often not ready yet."""
    end = today or date.today()
    return end - timedelta(days=lookback), end

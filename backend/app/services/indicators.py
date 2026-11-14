"""Climate indicators from NASA POWER monthly CSVs.

`climate_summary(csv_path)` answers: "is this location getting hotter or drier?"
by comparing a recent period with a baseline period, then scores a simple risk
level. Thresholds and every rule used here are documented in
docs/methodology.md.

Input CSV columns: date, parameter, value, unit, source, label
Parameters used:
    T2M                      average temperature (deg C)
    PRECTOTCORR_MONTH_TOTAL  rain per month (mm)
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd

SOURCE = "NASA POWER"
LABEL = "calculated"

TEMP_PARAM = "T2M"
RAIN_PARAM = "PRECTOTCORR_MONTH_TOTAL"

BASELINE_PERIOD = (2001, 2020)
RECENT_PERIOD = (2021, 2025)
SUMMER_MONTHS = (6, 7, 8)  # June, July, August

# Risk thresholds (documented in docs/methodology.md).
WARMING_THRESHOLD_C = 0.5  # warmer by >= 0.5 deg C -> 1 point
DRYING_THRESHOLD_PCT = 5.0  # drier by >= 5 % -> 1 point

# NASA POWER marks missing values with -999.
FILL_VALUE = -999

DECIMALS = 2

_RISK_LEVELS = {0: "low", 1: "moderate", 2: "high"}


# --------------------------------------------------------------------------
# Loading and cleaning
# --------------------------------------------------------------------------
def _parse_dates(series: pd.Series) -> pd.Series:
    """Parse dates such as 2001-01-01, 2001-01 or 200101.

    Anything that is not a real month (for example POWER's annual row, which
    uses month 13) becomes NaT and is dropped by the caller.
    """
    text = series.astype(str).str.strip()
    compact = text.str.fullmatch(r"\d{6}")
    parsed = pd.to_datetime(text.where(~compact), errors="coerce", format="mixed")
    parsed_compact = pd.to_datetime(text.where(compact), format="%Y%m", errors="coerce")
    return parsed.fillna(parsed_compact)


def _load_monthly(csv_path: str | Path) -> pd.DataFrame:
    """Read the CSV and return clean monthly rows: parameter, year, month, value."""
    df = pd.read_csv(csv_path)
    missing = {"date", "parameter", "value"} - set(df.columns)
    if missing:
        raise ValueError(f"{csv_path}: missing required column(s): {sorted(missing)}")

    df = df[df["parameter"].isin([TEMP_PARAM, RAIN_PARAM])].copy()
    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    df.loc[df["value"] == FILL_VALUE, "value"] = float("nan")

    df["date"] = _parse_dates(df["date"])
    df = df.dropna(subset=["date"])  # drops annual (month 13) / unparseable rows
    df["year"] = df["date"].dt.year
    df["month"] = df["date"].dt.month

    if df.duplicated(["parameter", "year", "month"]).any():
        raise ValueError(f"{csv_path}: duplicate parameter/year/month rows")

    return df[["parameter", "year", "month", "value"]]


# --------------------------------------------------------------------------
# Calculations
# --------------------------------------------------------------------------
def _yearly_values(
    df: pd.DataFrame, parameter: str, how: str, months: tuple[int, ...] = tuple(range(1, 13))
) -> pd.Series:
    """One value per year (mean or sum over `months`), indexed by year.

    A year is used only if every requested month has a valid value, so a
    partly-missing year can never bias a mean or a total.
    """
    sub = df[(df["parameter"] == parameter) & (df["month"].isin(months))]
    grouped = sub.groupby("year")["value"]
    complete = grouped.count() == len(months)
    return getattr(grouped, how)()[complete]


def _period_mean(yearly: pd.Series, period: tuple[int, int], what: str) -> tuple[float, int]:
    """Mean of the yearly values inside `period`, plus how many years were used."""
    start, end = period
    selected = yearly[(yearly.index >= start) & (yearly.index <= end)]
    if selected.empty:
        raise ValueError(f"No complete years of data for {what} in {start}-{end}")
    return float(selected.mean()), int(selected.size)


def _round(x: float) -> float:
    return round(float(x), DECIMALS)


def _num(value: float | int, unit: str) -> dict[str, Any]:
    """Every number in the output carries a unit, label and source."""
    return {"value": value, "unit": unit, "label": LABEL, "source": SOURCE}


def _compare(yearly: pd.Series, what: str) -> tuple[float, float, int, int]:
    base, n_base = _period_mean(yearly, BASELINE_PERIOD, f"{what} baseline")
    recent, n_recent = _period_mean(yearly, RECENT_PERIOD, f"{what} recent")
    return _round(base), _round(recent), n_base, n_recent


def _rain_block(yearly: pd.Series, what: str, unit: str) -> dict[str, Any]:
    base, recent, n_base, n_recent = _compare(yearly, what)
    if base == 0:
        raise ValueError(f"Baseline {what} is 0, percentage change is undefined")
    change_pct = _round((recent - base) / base * 100)
    return {
        "baseline": _num(base, unit),
        "recent": _num(recent, unit),
        "change_pct": _num(change_pct, "%"),
        "years_used": {
            "baseline": _num(n_base, "years"),
            "recent": _num(n_recent, "years"),
        },
    }


def climate_summary(csv_path: str | Path) -> dict[str, Any]:
    """Compare recent climate with the baseline and score a simple risk level.

    Returns {"climate": {...}, "risk": {...}}. Every number is an object
    {"value", "unit", "label": "calculated", "source": "NASA POWER"}.
    """
    df = _load_monthly(csv_path)

    temp_yearly = _yearly_values(df, TEMP_PARAM, "mean")
    rain_yearly = _yearly_values(df, RAIN_PARAM, "sum")
    summer_yearly = _yearly_values(df, RAIN_PARAM, "sum", SUMMER_MONTHS)

    t_base, t_recent, t_n_base, t_n_recent = _compare(temp_yearly, "temperature")
    t_change = _round(t_recent - t_base)

    rainfall = _rain_block(rain_yearly, "yearly rain", "mm/year")
    summer = _rain_block(summer_yearly, "summer (Jun-Aug) rain", "mm/summer")

    # Risk scoring uses the rounded values shown in the output, so the result
    # can be re-checked by hand from the JSON.
    warming = t_change >= WARMING_THRESHOLD_C
    drying = rainfall["change_pct"]["value"] <= -DRYING_THRESHOLD_PCT
    points = int(warming) + int(drying)

    return {
        "climate": {
            "periods": {
                "baseline": f"{BASELINE_PERIOD[0]}-{BASELINE_PERIOD[1]}",
                "recent": f"{RECENT_PERIOD[0]}-{RECENT_PERIOD[1]}",
            },
            "temperature": {
                "baseline": _num(t_base, "°C"),
                "recent": _num(t_recent, "°C"),
                "change": _num(t_change, "°C"),
                "years_used": {
                    "baseline": _num(t_n_base, "years"),
                    "recent": _num(t_n_recent, "years"),
                },
            },
            "rainfall": rainfall,
            "summer_rainfall": summer,
        },
        "risk": {
            "level": _RISK_LEVELS[points],
            "points": _num(points, "points"),
            "drivers": {
                "warming": {"triggered": warming, "points": _num(int(warming), "points")},
                "drying": {"triggered": drying, "points": _num(int(drying), "points")},
            },
        },
    }


# --------------------------------------------------------------------------
# Kept from the original scaffold (not used by climate_summary).
# --------------------------------------------------------------------------
def classify_anomaly(z_score: float) -> str:
    magnitude = abs(z_score)
    if magnitude < 1:
        return "low"
    if magnitude < 2:
        return "moderate"
    return "high"

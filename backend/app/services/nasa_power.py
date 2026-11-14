"""NASA POWER client: monthly agroclimate data for one farm location.

Data: NASA POWER (https://power.larc.nasa.gov), community "AG".
No login needed.

Use from the backend:
    from app.services.nasa_power import fetch_monthly, to_rows

Or run from the backend folder to save files for the demo:
    python -m app.services.nasa_power --name nevada --lat 39.53 --lon -119.81
"""
from __future__ import annotations

import argparse
import calendar
import csv
import json
from pathlib import Path

import httpx

BASE_URL = "https://power.larc.nasa.gov/api/temporal/monthly/point"

# T2M: air temperature at 2 m          T2M_MAX / T2M_MIN: max / min temperature
# PRECTOTCORR: bias-corrected precipitation
# RH2M: relative humidity at 2 m       ALLSKY_SFC_SW_DWN: solar radiation at the surface
DEFAULT_PARAMETERS = ["T2M", "T2M_MAX", "T2M_MIN", "PRECTOTCORR", "RH2M", "ALLSKY_SFC_SW_DWN"]
DEFAULT_START, DEFAULT_END = 2001, 2025


def fetch_monthly(lat: float, lon: float, start: int = DEFAULT_START, end: int = DEFAULT_END,
                  parameters: list[str] | None = None, timeout: float = 120) -> dict:
    """Return the raw JSON response from the POWER monthly point API."""
    params = {
        "parameters": ",".join(parameters or DEFAULT_PARAMETERS),
        "community": "AG",
        "latitude": lat,
        "longitude": lon,
        "start": start,
        "end": end,
        "format": "JSON",
    }
    response = httpx.get(BASE_URL, params=params, timeout=timeout)
    response.raise_for_status()
    return response.json()


def to_rows(raw: dict) -> list[dict]:
    """Flatten the POWER response into one row per parameter per month.

    Skips the annual summary (month "13") and missing values (the fill value).
    Adds a monthly precipitation total when POWER reports precipitation in mm/day.
    """
    fill_value = raw.get("header", {}).get("fill_value", -999)
    meta = raw.get("parameters", {})
    data = raw.get("properties", {}).get("parameter", {})
    rows: list[dict] = []

    for name, series in data.items():
        unit = meta.get(name, {}).get("units", "")
        for key, value in series.items():
            year, month = int(key[:4]), int(key[4:])
            if month == 13 or value is None or value == fill_value:
                continue
            rows.append(_row(year, month, name, value, unit))
            if name == "PRECTOTCORR" and unit.lower().replace(" ", "") == "mm/day":
                days = calendar.monthrange(year, month)[1]
                rows.append(_row(year, month, "PRECTOTCORR_MONTH_TOTAL", round(value * days, 2), "mm",
                                 kind="calculated"))
    rows.sort(key=lambda r: (r["parameter"], r["date"]))
    return rows


def _row(year: int, month: int, name: str, value: float, unit: str, kind: str = "nasa") -> dict:
    return {
        "date": f"{year}-{month:02d}",
        "parameter": name,
        "value": value,
        "unit": unit,
        "source": "NASA POWER",
        "label": kind,  # "nasa" = observed/modelled by NASA; "calculated" = derived by us
    }


def save(raw: dict, rows: list[dict], out_dir: Path, name: str) -> tuple[Path, Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    raw_path = out_dir / f"power_{name}_raw.json"
    csv_path = out_dir / f"power_{name}_monthly.csv"
    raw_path.write_text(json.dumps(raw, indent=2), encoding="utf-8")
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["date", "parameter", "value", "unit", "source", "label"])
        writer.writeheader()
        writer.writerows(rows)
    return raw_path, csv_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Download NASA POWER monthly data for a farm.")
    parser.add_argument("--name", required=True, help="short farm name, used in file names")
    parser.add_argument("--lat", type=float, required=True)
    parser.add_argument("--lon", type=float, required=True)
    parser.add_argument("--start", type=int, default=DEFAULT_START)
    parser.add_argument("--end", type=int, default=DEFAULT_END)
    parser.add_argument("--out", default="../data/raw", help="output folder")
    args = parser.parse_args()

    raw = fetch_monthly(args.lat, args.lon, args.start, args.end)
    rows = to_rows(raw)
    raw_path, csv_path = save(raw, rows, Path(args.out), args.name)
    print(f"Saved {len(rows)} rows")
    print(f"  {raw_path}")
    print(f"  {csv_path}")


if __name__ == "__main__":
    main()

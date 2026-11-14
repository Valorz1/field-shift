"""NASA SMAP satellite soil moisture for a demo farm, from an AppEEARS NetCDF download.

Data: SMAP Enhanced L3 Radiometer Global Daily 9 km (SPL3SMP_E, version 006), morning (AM) pass,
layer Soil_Moisture_Retrieval_Data_AM_soil_moisture, in cm3/cm3 (volume of water per volume of soil),
for roughly the top 5 cm of soil. Requested through NASA AppEEARS as an area sample.

We keep the 3 x 3 grid cells (about 27 km across) centred on the farm, and only readings whose
quality flag says "recommended quality" (bit 0 is 0). Each day is the mean of those cells, and each
month is the mean of its days. This runs once, offline; the app then reads the saved CSV.

Run from the backend folder (needs: pip install netCDF4):
    python -m app.services.smap --name norfolk --lat 52.65 --lon 0.90 --input ../data/raw/SPL3SMP_E.006_9.00805km_aid0001.nc
"""
from __future__ import annotations

import argparse
import csv
from datetime import date, timedelta
from pathlib import Path
from statistics import mean

SM_VAR = "Soil_Moisture_Retrieval_Data_AM_soil_moisture"
QF_VAR = "Soil_Moisture_Retrieval_Data_AM_retrieval_qual_flag"
OUT_DIR = Path(__file__).resolve().parents[3] / "data" / "raw"


def monthly_means(days: dict[date, float]) -> list[dict]:
    """Daily values -> one row per month with the mean and the number of days behind it."""
    months: dict[tuple[int, int], list[float]] = {}
    for day, value in days.items():
        months.setdefault((day.year, day.month), []).append(value)
    rows = []
    for (year, month), values in sorted(months.items()):
        key = f"{year}-{month:02d}"
        rows.append({"date": key, "parameter": "SMAP_SOIL_MOISTURE_AM", "value": round(mean(values), 4),
                     "unit": "cm3/cm3", "source": "NASA SMAP", "label": "nasa"})
        rows.append({"date": key, "parameter": "SMAP_DAYS", "value": len(values),
                     "unit": "days", "source": "NASA SMAP", "label": "calculated"})
    return rows


def daily_near(path: Path, lat: float, lon: float, cells: int = 1) -> dict[date, float]:
    """Mean of recommended-quality cells within `cells` grid steps of the point, for each day."""
    import netCDF4  # only needed for this one-off conversion
    import numpy as np

    data = netCDF4.Dataset(path)
    lats, lons = data.variables["lat"][:], data.variables["lon"][:]
    i, j = int(np.abs(lats - lat).argmin()), int(np.abs(lons - lon).argmin())
    box = (slice(None), slice(max(i - cells, 0), i + cells + 1), slice(max(j - cells, 0), j + cells + 1))
    sm = np.ma.filled(data.variables[SM_VAR][box].astype(float), np.nan)
    qf = np.ma.filled(data.variables[QF_VAR][box].astype(int), 65534)
    good = ~np.isnan(sm) & (sm >= 0) & ((qf & 1) == 0)
    start = date(2000, 1, 1)
    out: dict[date, float] = {}
    for k, seconds in enumerate(data.variables["time"][:]):
        if good[k].any():
            out[start + timedelta(seconds=float(seconds))] = float(np.mean(sm[k][good[k]]))
    return out


def save(rows: list[dict], name: str, out_dir: Path = OUT_DIR) -> Path:
    path = out_dir / f"smap_{name}_monthly.csv"
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["date", "parameter", "value", "unit", "source", "label"])
        writer.writeheader()
        writer.writerows(rows)
    return path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--name", required=True)
    parser.add_argument("--lat", type=float, required=True)
    parser.add_argument("--lon", type=float, required=True)
    parser.add_argument("--input", type=Path, required=True)
    args = parser.parse_args()
    days = daily_near(args.input, args.lat, args.lon)
    path = save(monthly_means(days), args.name)
    print(f"Saved {path} ({len(days)} days of recommended-quality data)")


if __name__ == "__main__":
    main()

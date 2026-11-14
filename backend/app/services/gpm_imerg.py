"""NASA GPM IMERG monthly rainfall, from a Giovanni CSV download.

Product: GPM_3IMERGM v07, "Merged satellite-gauge precipitation estimate -
Final Run", monthly, 0.1 degree. Giovanni "Time Series, Area-Averaged" export.
The value is the mean rain rate over the month in mm/hr; we also give the
monthly total in mm (rate x hours in that month), labelled "calculated".

Run from the backend folder:
    python -m app.services.gpm_imerg --name norfolk --input "../data/raw/<giovanni file>.csv"
"""
from __future__ import annotations

import argparse
import calendar
import csv
from pathlib import Path

SOURCE = "GPM IMERG"
RATE_PARAM = "IMERG_PRECIP_RATE"
TOTAL_PARAM = "IMERG_PRECIP_MONTH_TOTAL"


def parse_giovanni_csv(path: str | Path) -> tuple[dict, list[dict]]:
    """Return (metadata, rows) from a Giovanni area-averaged time-series CSV."""
    lines = Path(path).read_text(encoding="utf-8-sig").splitlines()
    meta: dict[str, str] = {}
    fill_value = -9999.9
    data_start = None
    for i, line in enumerate(lines):
        if line.lower().startswith("time,"):
            data_start = i + 1
            break
        if ":," in line:
            key, value = line.split(":,", 1)
            meta[key.strip()] = value.strip().strip('"')
            if key.lower().startswith("fill value"):
                fill_value = float(value)
    if data_start is None:
        raise ValueError("No 'time,' header found: is this a Giovanni time-series CSV?")

    rows: list[dict] = []
    for line in lines[data_start:]:
        if not line.strip():
            continue
        stamp, value = (part.strip() for part in line.split(",", 1))
        year, month = int(stamp[:4]), int(stamp[5:7])
        rate = float(value)
        if rate == fill_value or rate < 0:
            continue
        date = f"{year}-{month:02d}"
        hours = calendar.monthrange(year, month)[1] * 24
        rows.append(_row(date, RATE_PARAM, round(rate, 5), "mm/hr", "nasa"))
        rows.append(_row(date, TOTAL_PARAM, round(rate * hours, 1), "mm", "calculated"))
    rows.sort(key=lambda r: (r["parameter"], r["date"]))
    return meta, rows


def _row(date: str, parameter: str, value: float, unit: str, label: str) -> dict:
    return {"date": date, "parameter": parameter, "value": value,
            "unit": unit, "source": SOURCE, "label": label}


def save(rows: list[dict], out_dir: Path, name: str) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"imerg_{name}_monthly.csv"
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["date", "parameter", "value", "unit", "source", "label"])
        writer.writeheader()
        writer.writerows(rows)
    return path


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert a Giovanni IMERG CSV to Field Shift format.")
    parser.add_argument("--name", required=True, help="short farm name, e.g. norfolk")
    parser.add_argument("--input", required=True, help="path to the Giovanni CSV")
    parser.add_argument("--out", default="../data/raw", help="output folder")
    args = parser.parse_args()

    meta, rows = parse_giovanni_csv(args.input)
    path = save(rows, Path(args.out), args.name)
    months = len(rows) // 2
    print(f"Saved {months} months of IMERG rainfall to {path}")
    print(f"  area: {meta.get('Data Bounding Box', 'unknown')}")


if __name__ == "__main__":
    main()

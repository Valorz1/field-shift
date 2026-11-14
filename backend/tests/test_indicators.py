import json
from pathlib import Path

import pytest

from app.services.indicators import (
    classify_anomaly,
    DRYING_THRESHOLD_PCT,
    WARMING_THRESHOLD_C,
    climate_summary,
)

RAW = Path(__file__).resolve().parents[2] / "data" / "raw"


def val(result, *path):
    node = result
    for key in path:
        node = node[key]
    return node["value"]


# ---------- the numbers --------------------------------------------------
def test_warmer_and_drier_is_high_risk(make_csv):
    # +0.6 C; summer rain 40 -> 20 mm/month, other months unchanged at 50.
    # yearly rain: 570 -> 510 mm = -10.53 %; summer: 120 -> 60 mm = -50 %.
    r = climate_summary(make_csv(temp_base=10.0, temp_recent=10.6, summer_base=40, summer_recent=20))
    assert val(r, "climate", "temperature", "baseline") == 10.0
    assert val(r, "climate", "temperature", "recent") == 10.6
    assert val(r, "climate", "temperature", "change") == 0.6
    assert val(r, "climate", "rainfall", "baseline") == 570.0
    assert val(r, "climate", "rainfall", "recent") == 510.0
    assert val(r, "climate", "rainfall", "change_pct") == -10.53
    assert val(r, "climate", "summer_rainfall", "baseline") == 120.0
    assert val(r, "climate", "summer_rainfall", "recent") == 60.0
    assert val(r, "climate", "summer_rainfall", "change_pct") == -50.0
    assert r["risk"]["level"] == "high"
    assert val(r, "risk", "points") == 2


def test_stable_climate_is_low_risk(make_csv):
    r = climate_summary(make_csv(temp_recent=10.1))
    assert val(r, "climate", "temperature", "change") == 0.1
    assert val(r, "climate", "rainfall", "change_pct") == 0.0
    assert r["risk"]["level"] == "low"
    assert val(r, "risk", "points") == 0


def test_years_used(make_csv):
    r = climate_summary(make_csv())
    assert val(r, "climate", "temperature", "years_used", "baseline") == 20
    assert val(r, "climate", "temperature", "years_used", "recent") == 5


# ---------- thresholds (documented in docs/methodology.md) -------------------
def test_threshold_constants():
    assert WARMING_THRESHOLD_C == 0.5
    assert DRYING_THRESHOLD_PCT == 5.0


def test_warming_exactly_at_threshold_counts(make_csv):
    r = climate_summary(make_csv(temp_recent=10.5))
    assert r["risk"]["drivers"]["warming"]["triggered"] is True
    assert r["risk"]["level"] == "moderate"


def test_warming_just_below_threshold_does_not_count(make_csv):
    r = climate_summary(make_csv(temp_recent=10.49))
    assert r["risk"]["drivers"]["warming"]["triggered"] is False
    assert r["risk"]["level"] == "low"


def test_drying_exactly_at_threshold_counts(make_csv):
    # 100 -> 95 mm in every month is exactly -5 %.
    r = climate_summary(make_csv(rain_base=100, rain_recent=95))
    assert val(r, "climate", "rainfall", "change_pct") == -5.0
    assert r["risk"]["drivers"]["drying"]["triggered"] is True
    assert r["risk"]["level"] == "moderate"


def test_drying_just_below_threshold_does_not_count(make_csv):
    r = climate_summary(make_csv(rain_base=100, rain_recent=96))  # -4 %
    assert r["risk"]["drivers"]["drying"]["triggered"] is False
    assert r["risk"]["level"] == "low"


def test_wetter_is_not_a_risk(make_csv):
    r = climate_summary(make_csv(rain_base=50, rain_recent=60))
    assert val(r, "climate", "rainfall", "change_pct") == 20.0
    assert r["risk"]["drivers"]["drying"]["triggered"] is False


def test_summer_drying_alone_does_not_score(make_csv):
    # Summer rain is reported but the brief scores yearly rain only.
    r = climate_summary(make_csv(summer_base=100, summer_recent=0.0 + 90, rain_base=50, rain_recent=50))
    assert val(r, "climate", "summer_rainfall", "change_pct") == -10.0
    assert val(r, "climate", "rainfall", "change_pct") > -5.0
    assert r["risk"]["level"] == "low"


# ---------- data cleaning -------------------------------------------------
@pytest.mark.parametrize("fmt", ["%Y-%m-%d", "%Y-%m", "%Y%m"])
def test_date_formats(make_csv, fmt):
    r = climate_summary(make_csv(date_format=fmt, temp_recent=10.6))
    assert val(r, "climate", "temperature", "change") == 0.6


def test_fill_value_year_is_excluded_not_averaged(make_csv):
    def poison(rows):
        # T2M for Mar 2023 is NASA's -999 fill value.
        return [
            (d, p, -999 if (p == "T2M" and d.startswith("2023-03")) else v, u, s, l)
            for d, p, v, u, s, l in rows
        ]

    r = climate_summary(make_csv(temp_recent=10.6, mutate=poison))
    assert val(r, "climate", "temperature", "recent") == 10.6  # -999 never leaks in
    assert val(r, "climate", "temperature", "years_used", "recent") == 4


def test_partial_year_is_not_used_for_yearly_rain(make_csv):
    def drop_late_2025(rows):
        return [row for row in rows if not row[0].startswith(("2025-11", "2025-12"))]

    r = climate_summary(make_csv(mutate=drop_late_2025))
    assert val(r, "climate", "rainfall", "years_used", "recent") == 4
    assert val(r, "climate", "rainfall", "recent") == 600.0  # not biased low by 2025


def test_annual_month_13_row_is_ignored(make_csv):
    def add_annual(rows):
        return rows + [("200113", "T2M", 99.0, "C", "NASA POWER", "observed")]

    r = climate_summary(make_csv(date_format="%Y%m", mutate=add_annual))
    assert val(r, "climate", "temperature", "baseline") == 10.0


def test_other_parameters_are_ignored(make_csv):
    def add_other(rows):
        return rows + [("2005-01-01", "WS2M", 7.0, "m/s", "NASA POWER", "observed")]

    r = climate_summary(make_csv(mutate=add_other))
    assert val(r, "climate", "temperature", "baseline") == 10.0


def test_duplicate_rows_raise(make_csv):
    def dup(rows):
        return rows + [rows[0]]

    with pytest.raises(ValueError, match="duplicate"):
        climate_summary(make_csv(mutate=dup))


def test_missing_recent_period_raises(make_csv):
    def only_old(rows):
        return [row for row in rows if int(row[0][:4]) <= 2020]

    with pytest.raises(ValueError, match="recent"):
        climate_summary(make_csv(mutate=only_old))


def test_missing_column_raises(tmp_path):
    bad = tmp_path / "bad.csv"
    bad.write_text("date,value\n2001-01-01,1\n")
    with pytest.raises(ValueError, match="parameter"):
        climate_summary(bad)


# ---------- output contract -------------------------------------------------
def _numeric_objects(node):
    """Yield every {"value": ...} object in the output."""
    if isinstance(node, dict):
        if "value" in node:
            yield node
        else:
            for child in node.values():
                yield from _numeric_objects(child)


def test_every_number_is_labelled_calculated_from_nasa_power(make_csv):
    r = climate_summary(make_csv(temp_recent=10.6))
    objects = list(_numeric_objects(r))
    assert objects
    for obj in objects:
        assert obj["label"] == "calculated"
        assert obj["source"] == "NASA POWER"
        assert "unit" in obj


def test_output_is_json_serialisable(make_csv):
    json.dumps(climate_summary(make_csv(temp_recent=10.6)))


def test_only_climate_and_risk_keys(make_csv):
    assert set(climate_summary(make_csv())) == {"climate", "risk"}


# ---------- real data (runs only if the CSVs are in data/raw) ---------------
NORFOLK = RAW / "power_norfolk_monthly.csv"
NEVADA = RAW / "power_nevada_monthly.csv"


@pytest.mark.skipif(not (NORFOLK.exists() and NEVADA.exists()), reason="real CSVs not in data/raw")
def test_norfolk_and_nevada_give_different_results():
    norfolk, nevada = climate_summary(NORFOLK), climate_summary(NEVADA)
    assert norfolk["climate"] != nevada["climate"]


# ---------- kept from the original scaffold --------------------------------
def test_classify_anomaly():
    assert classify_anomaly(0.2) == "low"
    assert classify_anomaly(1.2) == "moderate"
    assert classify_anomaly(-2.1) == "high"

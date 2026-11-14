from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.routers import climate
from app.services.recent_weather import monthly_baseline, recent_window, summarise_recent


def _daily(start: date, days: int, rain=2.0, t=10.0, tmin=5.0, tmax=15.0, missing_last=0):
    """A fake POWER daily reply: `days` days from `start`, the last `missing_last` days left as -999."""
    series = {"T2M": {}, "T2M_MIN": {}, "T2M_MAX": {}, "PRECTOTCORR": {}}
    for i in range(days):
        day = start + timedelta(days=i)
        key = day.strftime("%Y%m%d")
        gone = i >= days - missing_last
        series["T2M"][key] = -999 if gone else t
        series["T2M_MIN"][key] = -999 if gone else tmin
        series["T2M_MAX"][key] = -999 if gone else tmax
        series["PRECTOTCORR"][key] = -999 if gone else rain
    return {"header": {"fill_value": -999}, "properties": {"parameter": series}}


def _baseline_rows(rain_month_total=62.0, t=9.0):
    rows = []
    for year in range(2001, 2021):
        for month in range(1, 13):
            rows.append({"date": f"{year}-{month:02d}", "parameter": "T2M", "value": t})
            rows.append({"date": f"{year}-{month:02d}", "parameter": "PRECTOTCORR_MONTH_TOTAL", "value": rain_month_total})
    # recent years must be ignored by the baseline
    rows.append({"date": "2024-10-01", "parameter": "T2M", "value": 99.0})
    return rows


def test_baseline_uses_2001_to_2020_only():
    base = monthly_baseline(_baseline_rows())
    assert base[10]["temperature"] == 9.0
    assert base[10]["rain"] == 62.0


def test_last_30_days_skips_days_nasa_has_not_filled_yet():
    raw = _daily(date(2026, 10, 1), 40, missing_last=4)
    out = summarise_recent(raw, monthly_baseline(_baseline_rows()))
    assert out["period"]["days"] == 30
    assert out["period"]["end"] == "2026-11-05"  # 40 days from 1 Oct, minus the 4 empty ones
    assert out["rain"]["recent_mm"] == 60.0       # 30 days x 2 mm


def test_compares_with_usual_rain_and_temperature():
    # Usual: 62 mm a month. 25 October days at 62/31 mm + 5 November days at 62/30 mm = 60.3 mm.
    raw = _daily(date(2026, 10, 7), 30, rain=1.0, t=11.0)
    out = summarise_recent(raw, monthly_baseline(_baseline_rows()))
    assert out["rain"]["usual_mm"] == 60.3
    assert out["rain"]["change_pct"] == pytest.approx(-50.3, abs=0.1)
    assert out["temperature"]["change_c"] == 2.0


def test_counts_frost_nights():
    raw = _daily(date(2026, 10, 7), 30, tmin=-1.0)
    out = summarise_recent(raw, monthly_baseline(_baseline_rows()))
    assert out["frost_nights"] == 30


def test_no_daily_data_is_an_error():
    raw = _daily(date(2026, 10, 7), 5, missing_last=5)
    with pytest.raises(ValueError):
        summarise_recent(raw, monthly_baseline(_baseline_rows()))


def test_window_asks_for_more_than_30_days():
    start, end = recent_window(date(2026, 11, 14))
    assert end == date(2026, 11, 14)
    assert (end - start).days == 45


def test_recent_route_for_a_demo_farm(monkeypatch):
    monkeypatch.setattr(climate, "fetch_daily", lambda lat, lon, start, end: _daily(date(2026, 10, 7), 30))
    response = TestClient(app).get("/climate/recent", params={"latitude": 52.65, "longitude": 0.9, "farm": "norfolk"})
    assert response.status_code == 200
    body = response.json()
    assert body["source"] == "NASA POWER daily"
    assert body["period"]["days"] == 30
    assert "change_pct" in body["rain"]


def test_recent_route_reports_nasa_errors(monkeypatch):
    def boom(*_):
        raise RuntimeError("timeout")

    monkeypatch.setattr(climate, "fetch_daily", boom)
    response = TestClient(app).get("/climate/recent", params={"latitude": 52.65, "longitude": 0.9, "farm": "norfolk"})
    assert response.status_code == 502

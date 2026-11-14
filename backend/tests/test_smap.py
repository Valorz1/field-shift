from datetime import date

from fastapi.testclient import TestClient

from app.main import app
from app.services.smap import monthly_means


def test_monthly_means_average_the_days_and_count_them():
    rows = monthly_means({date(2024, 6, 1): 0.10, date(2024, 6, 2): 0.20, date(2024, 7, 1): 0.30})
    june = [r for r in rows if r["date"] == "2024-06"]
    assert {r["parameter"]: r["value"] for r in june} == {"SMAP_SOIL_MOISTURE_AM": 0.15, "SMAP_DAYS": 2}
    assert rows[0]["unit"] == "cm3/cm3" and rows[0]["source"] == "NASA SMAP"


def test_norfolk_demo_includes_smap_rows():
    body = TestClient(app).get("/climate/demo/norfolk").json()
    assert "NASA SMAP" in body["sources"]
    smap = [r for r in body["rows"] if r["parameter"] == "SMAP_SOIL_MOISTURE_AM"]
    assert len(smap) == 120  # every month 2016-2025
    assert all(0 < r["value"] < 0.6 for r in smap)


def test_nevada_has_no_smap_yet():
    body = TestClient(app).get("/climate/demo/nevada").json()
    assert "NASA SMAP" not in body["sources"]

from fastapi.testclient import TestClient

from app.main import app
from app.routers import climate, strategies

client = TestClient(app)


def test_demo_farm_returns_three_strategies(make_csv, monkeypatch):
    path = make_csv(name="power_norfolk_monthly.csv", temp_recent=11.0, rain_recent=40.0)
    monkeypatch.setattr(strategies, "DATA_DIR", path.parent)
    body = client.get("/strategies/demo/norfolk").json()
    assert [s["id"] for s in body["strategies"]] == ["baseline", "water_efficient", "soil_restoration"]
    assert body["farm"]["crop"] == "wheat"
    assert body["risk"]["level"] == "high"  # warmer by 1 °C and drier by 20 %
    assert "do not replace farmer judgment" in body["disclaimer"]


def test_demo_farm_crop_can_be_changed(make_csv, monkeypatch):
    path = make_csv(name="power_nevada_monthly.csv")
    monkeypatch.setattr(strategies, "DATA_DIR", path.parent)
    body = client.get("/strategies/demo/nevada?crop=maize").json()
    assert body["farm"]["crop"] == "maize"
    assert body["strategies"][0]["rotation_crops"] == ["maize", "maize", "maize"]


def test_unknown_demo_farm_is_404():
    assert client.get("/strategies/demo/mars").status_code == 404


def test_live_location_uses_nasa_rows(make_csv, monkeypatch):
    import csv as _csv

    path = make_csv()
    with path.open(encoding="utf-8") as f:
        rows = list(_csv.DictReader(f))
    monkeypatch.setattr(strategies, "_live_rows", lambda lat, lon: rows)
    body = client.post("/strategies/", json={"latitude": 51.5, "longitude": -0.1, "crop": "barley"}).json()
    assert len(body["strategies"]) == 3
    assert body["farm"]["latitude"] == 51.5


def test_live_location_needs_a_crop():
    assert client.post("/strategies/", json={"latitude": 51.5, "longitude": -0.1, "crop": ""}).status_code == 422

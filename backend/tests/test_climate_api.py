from fastapi.testclient import TestClient

from app.main import app
from app.routers import climate

client = TestClient(app)


def test_demo_farm_reads_csv(tmp_path, monkeypatch):
    (tmp_path / "power_norfolk_monthly.csv").write_text(
        "date,parameter,value,unit,source,label\n2025-01,T2M,4.2,C,NASA POWER,nasa\n",
        encoding="utf-8",
    )
    monkeypatch.setattr(climate, "DATA_DIR", tmp_path)
    body = client.get("/climate/demo/norfolk").json()
    assert body["rows"][0]["value"] == 4.2


def test_unknown_demo_farm_is_404():
    assert client.get("/climate/demo/mars").status_code == 404


def test_cors_allows_frontend():
    response = client.get("/health", headers={"Origin": "http://localhost:3000"})
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"

import importlib

from fastapi.testclient import TestClient


def _client(monkeypatch, origins: str | None):
    if origins is None:
        monkeypatch.delenv("ALLOWED_ORIGINS", raising=False)
    else:
        monkeypatch.setenv("ALLOWED_ORIGINS", origins)
    import app.main

    return TestClient(importlib.reload(app.main).app)


def _preflight(client, origin):
    return client.options(
        "/health", headers={"Origin": origin, "Access-Control-Request-Method": "GET"}
    )


def test_local_frontend_is_allowed(monkeypatch):
    r = _preflight(_client(monkeypatch, None), "http://localhost:3000")
    assert r.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_deployed_site_is_allowed_only_when_set(monkeypatch):
    site = "https://rotara.example.app"
    assert "access-control-allow-origin" not in _preflight(_client(monkeypatch, None), site).headers
    r = _preflight(_client(monkeypatch, f" {site}/ , https://other.example"), site)
    assert r.headers.get("access-control-allow-origin") == site

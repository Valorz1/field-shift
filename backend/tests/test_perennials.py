"""Perennial note for alfalfa (rule PE-1, docs/methodology.md)."""
import pytest

from app.services.indicators import climate_summary
from app.services.strategy_engine import build_strategies, load_rules


@pytest.fixture
def warm_dry(make_csv):
    return climate_summary(make_csv(temp_base=15.0, temp_recent=15.6, rain_base=100, rain_recent=90))


def build(result, crop):
    return build_strategies({"current_crop": crop}, result["climate"], result["risk"])


@pytest.mark.parametrize("crop", ["alfalfa", " Alfalfa "])
def test_alfalfa_gets_the_perennial_note_in_every_strategy(warm_dry, crop):
    for s in build(warm_dry, crop):
        assert s["current_crop_is_perennial"] is True
        assert any("is a perennial" in r and "four to ten years" in r for r in s["risks"]), s["id"]
        assert any("Do not reseed" in r and "12 months" in r for r in s["risks"]), s["id"]
        assert any("stand were not checked" in g for g in s["gaps"]), s["id"]
        assert "PE-1" in [e["rule_id"] for e in s["evidence"] if e["type"] == "agronomy_rule"]
        assert s["sources"] == ["Calculated", "General agronomy"]


def test_perennial_note_does_not_change_the_rotations(warm_dry):
    out = build(warm_dry, "alfalfa")
    assert out[0]["rotation_crops"] == ["alfalfa"] * 3
    assert out[2]["rotation_crops"][2] == "alfalfa"


def test_annual_crop_gets_no_perennial_note(warm_dry):
    for s in build(warm_dry, "wheat"):
        assert s["current_crop_is_perennial"] is False
        assert not any("perennial" in r for r in s["risks"])


def test_perennial_rule_cites_a_known_source():
    rules = load_rules()
    for sid in rules["perennials"]["rule"]["source_ids"]:
        assert rules["sources"][sid]["url"].startswith("https://")

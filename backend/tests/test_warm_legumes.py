"""Warm places: cowpea (warm-season legume) before chickpea (cool-season). See docs/methodology.md."""
from pathlib import Path

import pytest

from app.services.indicators import climate_summary
from app.services.strategy_engine import build_strategies, load_rules

NEVADA = Path(__file__).resolve().parents[2] / "data" / "raw" / "power_nevada_monthly.csv"


def water_plan(result, crop):
    return build_strategies({"current_crop": crop}, result["climate"], result["risk"])[1]


@pytest.fixture
def warm_dry(make_csv):
    return climate_summary(make_csv(temp_base=15.0, temp_recent=15.6, rain_base=100, rain_recent=90))


@pytest.mark.parametrize("crop", ["alfalfa", "dragonfruit"])
def test_warm_place_without_cereal_rule_starts_with_cowpea(warm_dry, crop):
    water = water_plan(warm_dry, crop)
    assert water["rotation"][1]["crop"] == "cowpea"
    alts = water["rotation"][1]["alternatives"]
    assert alts.index("cowpea") < alts.index("chickpea")


def test_cowpea_order_cites_a_source():
    rules = load_rules()
    we3 = next(r for r in rules["lower_water_rules"] if r["id"] == "WE-3")
    assert we3["alternatives"][0] == "cowpea"
    assert "sita_legumes_heat_2017" in we3["source_ids"]
    assert rules["sources"]["sita_legumes_heat_2017"]["url"].startswith("https://")


@pytest.mark.skipif(not NEVADA.exists(), reason="real CSV not in data/raw")
def test_real_nevada_alfalfa_gets_cowpea_first():
    r = climate_summary(NEVADA)
    assert water_plan(r, "alfalfa")["rotation_crops"][1] == "cowpea"

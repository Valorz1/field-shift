import json

import pytest

from app.services.indicators import climate_summary
from app.services.strategy_engine import (
    COOL_CLIMATE_THRESHOLD_C,
    RULES_PATH,
    STRATEGY_IDS,
    build_strategies,
    load_rules,
)

REQUIRED_FIELDS = {
    "id", "title", "rotation", "why", "evidence", "benefits",
    "risks", "gaps", "water_need", "complexity", "confidence",
}


# Synthetic places. "Warm" ones have a 15 C baseline (at or above the 12 C
# cool-climate threshold); "cool" ones have a 10 C baseline.
@pytest.fixture
def high_dry(make_csv):
    r = climate_summary(make_csv(temp_base=15.0, temp_recent=15.6, rain_base=100, rain_recent=90))
    assert r["risk"]["level"] == "high"
    return r


@pytest.fixture
def moderate_warm(make_csv):
    r = climate_summary(make_csv(temp_base=15.0, temp_recent=15.6))
    assert r["risk"]["level"] == "moderate"
    return r


@pytest.fixture
def low(make_csv):
    r = climate_summary(make_csv(temp_base=15.0, temp_recent=15.0))
    assert r["risk"]["level"] == "low"
    return r


@pytest.fixture
def cool_high_dry(make_csv):
    r = climate_summary(make_csv(temp_base=10.0, temp_recent=10.6, rain_base=100, rain_recent=90))
    assert r["risk"]["level"] == "high"
    return r


def build(result, crop="maize"):
    return build_strategies({"current_crop": crop}, result["climate"], result["risk"])


# ---------- shape ----------------------------------------------------------
@pytest.mark.parametrize("fixture", ["high_dry", "moderate_warm", "low"])
def test_always_three_in_order_with_all_fields(fixture, request):
    out = build(request.getfixturevalue(fixture))
    assert [s["id"] for s in out] == list(STRATEGY_IDS)
    for s in out:
        assert REQUIRED_FIELDS <= set(s)
        assert [y["year"] for y in s["rotation"]] == [1, 2, 3]
        assert s["complexity"] in {"low", "medium", "high"}
        assert s["confidence"] in {"low", "medium", "high"}


def test_output_is_json_serialisable(high_dry):
    json.dumps(build(high_dry))


def test_baseline_keeps_current_crop(high_dry):
    base = build(high_dry, "wheat")[0]
    assert [y["crop"] for y in base["rotation"]] == ["wheat"] * 3


# ---------- decision rules -------------------------------------------------
def test_high_risk_and_drier_is_strongly_worth_a_look(high_dry):
    water = build(high_dry)[1]
    assert water["why"].startswith("Strongly worth a look")


def test_moderate_risk_is_worth_a_look_not_strongly(moderate_warm):
    water = build(moderate_warm)[1]
    assert water["why"].startswith("Worth a look")
    assert "Strongly" not in water["why"]


def test_low_risk_is_optional(low):
    assert build(low)[1]["why"].startswith("Optional")


def test_maize_gets_lower_water_crops_in_rotation(high_dry):
    water = build(high_dry, "maize")[1]
    assert water["rotation"][0]["crop"] == "maize"
    assert water["rotation"][1]["crop"] == "sorghum"
    assert water["confidence"] == "medium"  # crop-specific rule matched


def test_alternative_never_equals_current_crop(high_dry):
    water = build(high_dry, "sorghum")[1]
    assert "sorghum" not in water["rotation"][1]["alternatives"]


def test_unknown_crop_uses_general_rules_with_low_confidence(high_dry):
    water = build(high_dry, "dragonfruit")[1]
    assert water["confidence"] == "low"
    assert any("No crop-specific rule" in g for g in water["gaps"])
    assert water["rotation"][1]["crop"] in {"chickpea", "cowpea"}


def test_soil_restoration_adds_legume_cover_crop(high_dry):
    soil = build(high_dry)[2]
    assert "legume" in soil["rotation"][1]["role"]
    assert any("cover crop" in r.lower() for r in soil["risks"])


def test_crop_name_is_case_and_space_insensitive(high_dry):
    assert build(high_dry, "  Maize ")[1]["rotation"][1]["crop"] == "sorghum"


def test_missing_crop_raises(high_dry):
    with pytest.raises(ValueError, match="current_crop"):
        build_strategies({}, high_dry["climate"], high_dry["risk"])


# ---------- no invented numbers -------------------------------------------------
def test_climate_evidence_matches_the_calculated_numbers(high_dry):
    t = high_dry["climate"]["temperature"]["change"]["value"]
    r = high_dry["climate"]["rainfall"]["change_pct"]["value"]
    for s in build(high_dry):
        text = " ".join(e["statement"] for e in s["evidence"] if e["type"] == "climate_data")
        assert f"{t:+.2f}" in text
        assert f"{r:+.2f}" in text
        for e in s["evidence"]:
            if e["type"] == "climate_data":
                assert e["label"] == "calculated" and e["source"] == "NASA POWER"


def test_agronomy_claims_carry_a_source(high_dry):
    for s in build(high_dry)[1:]:
        rule_items = [e for e in s["evidence"] if e["type"] == "agronomy_rule"]
        assert rule_items
        for e in rule_items:
            assert e["sources"] and all(src["url"].startswith("https://") for src in e["sources"])


# ---------- frontend compatibility fields ------------------------------------
def test_frontend_fields_are_added(high_dry):
    out = build(high_dry, "wheat")
    assert [s["kind"] for s in out] == ["baseline", "climate-adaptive", "soil-restoration"]
    assert [s["position"] for s in out] == [1, 2, 3]
    for s in out:
        assert s["summary"] == s["why"]
        assert s["rotation_crops"] == [y["crop"] for y in s["rotation"]]
        assert len(s["rotation_crops"]) == 3
    assert out[0]["sources"] == ["Calculated"]
    assert out[1]["sources"] == ["Calculated", "General agronomy"]


def test_crop_key_fallback_matches_frontend_session(high_dry):
    # frontend/lib/session-store.ts stores the crop as `crop`.
    via_crop = build_strategies({"crop": "maize"}, high_dry["climate"], high_dry["risk"])
    assert via_crop == build(high_dry, "maize")


# ---------- climate filter ------------------------------------------------------
WARM_ONLY_CROPS = {"sorghum", "millet", "chickpea", "cowpea"}


def test_cool_place_gets_cool_climate_crops_not_sorghum_or_millet(cool_high_dry):
    water = build(cool_high_dry, "wheat")[1]
    assert water["climate_zone"] == "cool"
    assert [y["crop"] for y in water["rotation"]] == ["wheat", "oilseed rape", "field beans"]
    assert not WARM_ONLY_CROPS & set(water["rotation"][1]["alternatives"])
    assert water["rotation"][1]["role"] == "cool-climate crop"
    assert water["confidence"] == "medium"  # the cool-climate rule names wheat
    assert "add crops suited to a cool climate" in water["title"]


def test_cool_place_does_not_claim_lower_water(cool_high_dry):
    water = build(cool_high_dry, "wheat")[1]
    assert water["water_need"].startswith("Not compared")
    assert any("no water-use comparison" in g for g in water["gaps"])
    assert any("spring crops" in r for r in water["risks"])  # CL-2 caution


def test_warm_place_keeps_sorghum_and_millet(high_dry):
    water = build(high_dry, "wheat")[1]
    assert water["climate_zone"] == "warm"
    assert water["rotation"][1]["crop"] == "sorghum"
    assert "oilseed rape" not in water["rotation"][1]["alternatives"]


def test_strongly_worth_a_look_still_applies_in_cool_places(cool_high_dry):
    assert build(cool_high_dry, "wheat")[1]["why"].startswith("Strongly worth a look")


@pytest.mark.parametrize(
    "temp_base, zone",
    [(11.99, "cool"), (12.0, "warm"), (12.01, "warm")],
)
def test_cool_threshold_is_under_12_c(make_csv, temp_base, zone):
    assert COOL_CLIMATE_THRESHOLD_C == 12.0
    r = climate_summary(make_csv(temp_base=temp_base, temp_recent=temp_base))
    assert build(r, "wheat")[1]["climate_zone"] == zone


def test_zone_reason_is_in_the_evidence(cool_high_dry):
    water = build(cool_high_dry, "wheat")[1]
    text = " ".join(e["statement"] for e in water["evidence"] if e["type"] == "climate_data")
    assert "10.00 °C is under the 12 °C cool-climate threshold" in text


# ---------- same crop under another name -----------------------------------------
@pytest.mark.parametrize("crop", ["wheat", "Winter Wheat", "spring wheat"])
def test_wheat_farm_is_not_told_to_grow_winter_wheat(cool_high_dry, crop):
    alts = build(cool_high_dry, crop)[1]["rotation"][1]["alternatives"]
    assert "winter wheat" not in alts


def test_barley_farm_is_not_told_to_grow_spring_barley(cool_high_dry):
    alts = build(cool_high_dry, "barley")[1]["rotation"][1]["alternatives"]
    assert "spring barley" not in alts
    assert "winter wheat" in alts


# ---------- legume check ---------------------------------------------------------
@pytest.mark.parametrize("crop", ["alfalfa", "Field Beans", "faba beans", "red clover", "soybean"])
def test_legume_crop_gets_non_legume_cover_crop(high_dry, crop):
    soil = build(high_dry, crop)[2]
    assert soil["current_crop_is_legume"] is True
    assert soil["title"] == "Add a non-legume cover crop"
    assert soil["rotation"][1]["role"] == "non-legume cover crop"
    assert soil["rotation"][1]["alternatives"] == ["cereal rye"]
    assert "already a legume" in soil["why"]
    rule_ids = [e["rule_id"] for e in soil["evidence"] if e["type"] == "agronomy_rule"]
    assert "SR-1" not in rule_ids  # the "legumes add nitrogen" rule is not used
    assert "SR-4" in rule_ids and "legumes" in rule_ids
    assert not any("hairy vetch" in b or "Legume cover crops" in b for b in soil["benefits"])


def test_non_legume_crop_still_gets_legume_cover_crop(high_dry):
    soil = build(high_dry, "wheat")[2]
    assert soil["current_crop_is_legume"] is False
    assert soil["rotation"][1]["alternatives"] == ["hairy vetch", "red clover"]
    assert "SR-4" not in [e["rule_id"] for e in soil["evidence"] if e["type"] == "agronomy_rule"]


def test_cool_place_never_puts_field_beans_after_field_beans(cool_high_dry):
    alts = build(cool_high_dry, "faba beans")[1]["rotation"][1]["alternatives"]
    assert "field beans" not in alts


# ---------- the rules file itself -----------------------------------------------
def test_every_rule_cites_a_known_source():
    rules = load_rules()
    for group in ("lower_water_rules", "soil_restoration_rules"):
        for rule in rules[group]:
            assert rule["source_ids"], rule["id"]
            for sid in rule["source_ids"]:
                src = rules["sources"][sid]
                assert src["citation"] and src["url"].startswith("https://")


def test_legume_list_and_aliases_cite_known_sources():
    rules = load_rules()
    for section in ("legumes", "crop_aliases"):
        assert rules[section]["source_ids"], section
        for sid in rules[section]["source_ids"]:
            assert rules["sources"][sid]["url"].startswith("https://")


def test_every_lower_water_rule_says_where_it_applies():
    for rule in load_rules()["lower_water_rules"]:
        assert set(rule["climates"]) <= {"cool", "warm"} and rule["climates"], rule["id"]


def test_rule_ids_are_unique():
    rules = load_rules()
    ids = [r["id"] for g in ("lower_water_rules", "soil_restoration_rules") for r in rules[g]]
    assert len(ids) == len(set(ids))


def test_rules_file_exists_where_the_brief_says():
    assert RULES_PATH.as_posix().endswith("backend/app/ai/agronomy/rotation_rules.json")

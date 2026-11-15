"""Rules-based crop strategies.

`build_strategies(farm, climate, risk)` always returns exactly three
strategies, in this order: baseline, water_efficient, soil_restoration.

No AI is involved. Everything comes from:
  * the `climate` and `risk` dicts produced by indicators.climate_summary
    (calculated from NASA POWER), and
  * the cited rules in app/ai/agronomy/rotation_rules.json.

The decision rules are documented in docs/methodology.md.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

RULES_PATH = Path(__file__).resolve().parents[1] / "ai" / "agronomy" / "rotation_rules.json"
ROTATION_YEARS = 3

STRATEGY_IDS = ("baseline", "water_efficient", "soil_restoration")

COMMON_GAPS = [
    "No yield, price, soil, or irrigation data was used.",
    "Local sowing windows, market access and equipment fit were not checked; confirm with a local agronomist.",
]


# --------------------------------------------------------------------------
# Rules
# --------------------------------------------------------------------------
@lru_cache(maxsize=4)
def _load_rules_cached(path: str) -> dict[str, Any]:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_rules(path: str | Path | None = None) -> dict[str, Any]:
    return _load_rules_cached(str(path or RULES_PATH))


def _sources(rules: dict, source_ids: list[str]) -> list[dict[str, str]]:
    return [
        {
            "id": sid,
            "citation": rules["sources"][sid]["citation"],
            "url": rules["sources"][sid]["url"],
        }
        for sid in source_ids
    ]


def _rule_evidence(rules: dict, rule: dict) -> dict[str, Any]:
    return {
        "type": "agronomy_rule",
        "rule_id": rule["id"],
        "statement": rule["statement"],
        "sources": _sources(rules, rule["source_ids"]),
    }


def _canonical(rules: dict, crop: str) -> str:
    """Map names of the same crop to one name, e.g. 'winter wheat' -> 'wheat'."""
    return rules.get("crop_aliases", {}).get("aliases", {}).get(crop, crop)


def _same_crop(rules: dict, a: str, b: str) -> bool:
    return _canonical(rules, a) == _canonical(rules, b)


def _is_legume(rules: dict, crop: str) -> bool:
    legumes = set(rules.get("legumes", {}).get("crops", []))
    return crop in legumes or _canonical(rules, crop) in legumes


def _matches(rule: dict, crop: str, rules: dict | None = None, zone: str | None = None) -> bool:
    if zone is not None and zone not in rule.get("climates", ["cool", "warm"]):
        return False
    if "*" in rule["applies_to"]:
        return True
    return crop in rule["applies_to"] or (rules is not None and _canonical(rules, crop) in rule["applies_to"])


def _crop_specific(rule: dict, crop: str, rules: dict | None = None) -> bool:
    """True when the rule (or its source) names the farm's crop."""
    named = set(rule["applies_to"]) | set(rule.get("alternatives", []))
    if crop in named:
        return True
    return rules is not None and any(_same_crop(rules, crop, n) for n in named if n != "*")


# --------------------------------------------------------------------------
# Climate zone (threshold documented in docs/methodology.md, section 4)
# --------------------------------------------------------------------------
# Team screening threshold, not taken from a published standard.
COOL_CLIMATE_THRESHOLD_C = 12.0


def _climate_zone(climate: dict) -> tuple[str, dict]:
    """'cool' when the baseline (2001-2020) average temperature is under 12 C, else 'warm'."""
    t = climate["temperature"]["baseline"]
    zone = "cool" if t["value"] < COOL_CLIMATE_THRESHOLD_C else "warm"
    word = "under" if zone == "cool" else "at or above"
    evidence = {
        "type": "climate_data",
        "statement": (
            f"Baseline ({climate['periods']['baseline']}) average temperature {t['value']:.2f} {t['unit']} is {word} "
            f"the {COOL_CLIMATE_THRESHOLD_C:g} °C cool-climate threshold, so {zone}-climate crop rules are used."
        ),
        "label": t["label"],
        "source": t["source"],
    }
    return zone, evidence


# --------------------------------------------------------------------------
# Inputs
# --------------------------------------------------------------------------
def _current_crop(farm: dict[str, Any]) -> tuple[str, str]:
    """Return (normalised crop for rule matching, crop name as the farmer wrote it)."""
    raw = farm.get("current_crop") or farm.get("crop")
    if not raw or not str(raw).strip():
        raise ValueError("farm must include 'current_crop'")
    raw = str(raw).strip()
    return raw.lower(), raw


def _climate_evidence(climate: dict, risk: dict) -> list[dict[str, Any]]:
    periods = climate["periods"]
    t = climate["temperature"]["change"]
    r = climate["rainfall"]["change_pct"]
    s = climate["summer_rainfall"]["change_pct"]
    base, recent = periods["baseline"], periods["recent"]
    return [
        {
            "type": "climate_data",
            "statement": f"Average temperature {recent} vs {base}: {t['value']:+.2f} {t['unit']}.",
            "label": t["label"],
            "source": t["source"],
        },
        {
            "type": "climate_data",
            "statement": f"Average yearly rain {recent} vs {base}: {r['value']:+.2f} {r['unit']}.",
            "label": r["label"],
            "source": r["source"],
        },
        {
            "type": "climate_data",
            "statement": f"Average summer (Jun-Aug) rain {recent} vs {base}: {s['value']:+.2f} {s['unit']}.",
            "label": s["label"],
            "source": s["source"],
        },
        {
            "type": "climate_data",
            "statement": f"Climate risk level: {risk['level']} ({risk['points']['value']} of 2 points).",
            "label": risk["points"]["label"],
            "source": risk["points"]["source"],
        },
    ]


def _rotation(crops: list[str], roles: list[str], extra: dict[int, dict] | None = None) -> list[dict]:
    rotation = []
    for i, (crop, role) in enumerate(zip(crops, roles), start=1):
        entry = {"year": i, "crop": crop, "role": role}
        entry.update((extra or {}).get(i, {}))
        rotation.append(entry)
    return rotation


# --------------------------------------------------------------------------
# The three strategies
# --------------------------------------------------------------------------
def _baseline(crop: str, climate: dict, risk: dict) -> dict[str, Any]:
    risks = []
    if risk["level"] != "low":
        risks.append(
            f"Climate risk is '{risk['level']}'; this option makes no adaptation to it."
        )
    return {
        "id": "baseline",
        "title": "Keep the current crop",
        "rotation": _rotation([crop] * ROTATION_YEARS, ["current crop"] * ROTATION_YEARS),
        "why": f"Reference case: grow {crop} every year, as now. Other options are compared against this.",
        "evidence": _climate_evidence(climate, risk),
        "benefits": ["No change to current management, equipment or markets."],
        "risks": risks,
        "gaps": list(COMMON_GAPS),
        "water_need": "Unchanged (current crop).",
        "complexity": "low",
        "confidence": "medium",
    }


def _water_efficient(crop_key: str, crop: str, climate: dict, risk: dict, rules: dict) -> dict[str, Any]:
    drier = risk["drivers"]["drying"]["triggered"]
    warmer = risk["drivers"]["warming"]["triggered"]
    level = risk["level"]

    # Priority rule (docs/methodology.md, section 4).
    if level == "high" and drier:
        priority = "Strongly worth a look"
        reason = "risk is high and the climate data shows drier conditions"
    elif level in ("moderate", "high"):
        priority = "Worth a look"
        trigger = "drier" if drier else "warmer" if warmer else "higher-risk"
        reason = f"risk is {level} and the climate data shows {trigger} conditions"
    else:
        priority = "Optional"
        reason = "risk is low, so there is no climate trigger"

    zone, zone_evidence = _climate_zone(climate)
    used_rules = [r for r in rules["lower_water_rules"] if _matches(r, crop_key, rules, zone)]
    crop_rules = [r for r in used_rules if r.get("kind") != "caution"]
    caution_rules = [r for r in used_rules if r.get("kind") == "caution"]

    alternatives: list[str] = []
    roles: dict[str, str] = {}
    for rule in crop_rules:
        for alt in rule["alternatives"]:
            if not _same_crop(rules, alt, crop_key) and alt not in alternatives:
                alternatives.append(alt)
                roles[alt] = rule.get("role", "lower-water crop")

    # Only claim "lower water" when a rule that says so was used.
    lower_water = any(r.get("role", "lower-water crop") == "lower-water crop" for r in crop_rules)
    kind_of_crop = "lower-water crops" if lower_water else "crops suited to a cool climate"

    gaps = list(COMMON_GAPS)
    if not any(_crop_specific(r, crop_key, rules) for r in crop_rules):
        gaps.append(f"No crop-specific rule for '{crop}'; only general options were used.")
    if not lower_water:
        gaps.append("The cool-climate rules give no water-use comparison between these crops.")

    if alternatives:
        year2, year3 = alternatives[0], alternatives[1] if len(alternatives) > 1 else crop
        rotation = _rotation(
            [crop, year2, year3],
            ["current crop", roles[year2], roles.get(year3, "current crop")],
            extra={2: {"alternatives": alternatives}},
        )
        why = (
            f"{priority}: {reason}. Keep {crop} and bring {kind_of_crop} into the rotation "
            f"({', '.join(alternatives)})."
        )
        water_need = (
            "Lower than growing the current crop every year, in the years the lower-water crop is grown."
            if lower_water
            else "Not compared: the rules give no water-use figures for these crops."
        )
    else:
        rotation = _rotation([crop] * ROTATION_YEARS, ["current crop"] * ROTATION_YEARS)
        why = f"{priority}: {reason}. The rules list no alternative for {crop} in a {zone} climate."
        water_need = "Unchanged (no alternative found in the rules)."
        gaps.append(f"The rules contain no {zone}-climate alternative for '{crop}'.")

    risks = ["A new crop needs its own sowing window, equipment and market; none of these were checked."]
    if lower_water:
        risks.append("Lower-water crops are less water-demanding, but the rules give no yield comparison.")
    risks += [r["statement"] for r in caution_rules]
    confidence = "medium" if any(_crop_specific(r, crop_key, rules) for r in crop_rules) else "low"

    return {
        "id": "water_efficient",
        "title": f"Keep the current crop, add {kind_of_crop}",
        "rotation": rotation,
        "why": why,
        "evidence": _climate_evidence(climate, risk) + [zone_evidence] + [_rule_evidence(rules, r) for r in used_rules],
        "benefits": ["Spreads exposure to dry years across more than one crop."] if alternatives else [],
        "risks": risks,
        "gaps": gaps,
        "water_need": water_need,
        "complexity": "medium",
        "confidence": confidence,
        "climate_zone": zone,
    }


def _soil_restoration(crop_key: str, crop: str, climate: dict, risk: dict, rules: dict) -> dict[str, Any]:
    drier = risk["drivers"]["drying"]["triggered"]
    legume = _is_legume(rules, crop_key)
    wanted = "legume" if legume else "non_legume"
    # Rules marked for_crops apply only to legume / non-legume current crops.
    used = [r for r in rules["soil_restoration_rules"] if r.get("for_crops", wanted) == wanted]
    benefit_rules = [r for r in used if r.get("kind") != "caution"]
    caution_rules = [r for r in used if r.get("kind") == "caution"]
    cover_crops = next(c for r in used for c in [r.get("cover_crops")] if c)
    cover_text = " or ".join(cover_crops)

    risks = [
        "Cover crops use soil water and need good termination timing.",
        "Needs seed, sowing and termination work that the current rotation may not include.",
    ]
    if drier:
        risks.append("The climate data shows drier conditions, so soil-water use by the cover crop deserves extra care.")

    if legume:
        title = "Add a non-legume cover crop"
        role = "non-legume cover crop"
        why = (
            f"Worth a look: {crop} is already a legume, so instead of adding another legume, a non-legume "
            f"cover crop ({cover_text}) protects the soil and takes up leftover nitrogen between {crop} crops. "
            "This option is based on soil benefits, not on the climate risk level."
        )
        extra_gaps = ["The nitrogen left by the current legume crop was not measured."]
    else:
        title = "Add legumes and cover crops"
        role = "legume cover crop"
        why = (
            f"Worth a look: legume cover crops add nitrogen and protect the soil between {crop} crops. "
            "This option is based on soil benefits, not on the climate risk level."
        )
        extra_gaps = []

    evidence = _climate_evidence(climate, risk) + [_rule_evidence(rules, r) for r in used]
    if legume:
        evidence.append({
            "type": "agronomy_rule",
            "rule_id": "legumes",
            "statement": f"{crop} is on the legume list, so no legume cover crop is suggested.",
            "sources": _sources(rules, rules["legumes"]["source_ids"]),
        })

    return {
        "id": "soil_restoration",
        "title": title,
        "rotation": _rotation(
            [crop, f"{role} ({cover_text})", crop],
            ["current crop", role, "current crop"],
            extra={2: {"alternatives": cover_crops}},
        ),
        "why": why,
        "evidence": evidence,
        "benefits": [r["statement"] for r in benefit_rules],
        "risks": risks + [r["statement"] for r in caution_rules],
        "gaps": list(COMMON_GAPS) + extra_gaps,
        "water_need": "Current crop plus the cover crop's soil-water use; no volume available.",
        "complexity": "medium",
        "confidence": "medium",
        "current_crop_is_legume": legume,
    }


# --------------------------------------------------------------------------
# Public API
# --------------------------------------------------------------------------
def build_strategies(
    farm: dict[str, Any],
    climate: dict[str, Any],
    risk: dict[str, Any],
    rules: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Return exactly three strategies: baseline, water_efficient, soil_restoration."""
    rules = rules if rules is not None else load_rules()
    crop_key, crop = _current_crop(farm)
    strategies = [
        _baseline(crop, climate, risk),
        _water_efficient(crop_key, crop, climate, risk, rules),
        _soil_restoration(crop_key, crop, climate, risk, rules),
    ]
    strategies = [_with_perennial_notes(s, crop_key, crop, rules) for s in strategies]
    return [_with_frontend_fields(s, i) for i, s in enumerate(strategies, start=1)]


# --------------------------------------------------------------------------
# Perennial crops (rule PE-1; see docs/methodology.md, section 4)
# --------------------------------------------------------------------------
def _is_perennial(rules: dict, crop: str) -> bool:
    perennials = set(rules.get("perennials", {}).get("crops", []))
    return crop in perennials or _canonical(rules, crop) in perennials


def _with_perennial_notes(strategy: dict[str, Any], crop_key: str, crop: str, rules: dict) -> dict[str, Any]:
    """For a perennial current crop (alfalfa), say the table is not a yearly resowing."""
    if not _is_perennial(rules, crop_key):
        return {**strategy, "current_crop_is_perennial": False}
    rule = rules["perennials"]["rule"]
    return {
        **strategy,
        "risks": strategy["risks"] + [
            f"{crop} is a perennial: one stand can stay productive for four to ten years or more, so each "
            f"'{crop}' year in this table means keeping the stand, not sowing it again.",
            f"Do not reseed {crop} straight after {crop}: autotoxicity, seedling disease and pests build up in "
            "old stands; a break of at least 12 months has worked.",
        ],
        "gaps": strategy["gaps"] + [f"The age and plant density of the current {crop} stand were not checked."],
        "evidence": strategy["evidence"] + [_rule_evidence(rules, rule)],
        "current_crop_is_perennial": True,
    }


# --------------------------------------------------------------------------
# Frontend compatibility (additive only; see docs/methodology.md, section 4)
# --------------------------------------------------------------------------
# The frontend StrategyView (frontend/lib/view-models.ts) uses these kinds.
FRONTEND_KIND = {
    "baseline": "baseline",
    "water_efficient": "climate-adaptive",
    "soil_restoration": "soil-restoration",
}


def _with_frontend_fields(strategy: dict[str, Any], position: int) -> dict[str, Any]:
    """Add the fields the frontend StrategyView reads. Existing fields are not changed."""
    has_rules = any(e["type"] == "agronomy_rule" for e in strategy["evidence"])
    return {
        **strategy,
        "kind": FRONTEND_KIND[strategy["id"]],
        "position": position,
        "summary": strategy["why"],
        "rotation_crops": [year["crop"] for year in strategy["rotation"]],
        # Frontend DataLabel values: numbers are "Calculated" from NASA POWER;
        # crop ideas come from the cited rules ("General agronomy").
        "sources": ["Calculated", "General agronomy"] if has_rules else ["Calculated"],
    }

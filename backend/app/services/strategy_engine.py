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


def _matches(rule: dict, crop: str) -> bool:
    return crop in rule["applies_to"] or "*" in rule["applies_to"]


def _crop_specific(rule: dict, crop: str) -> bool:
    return crop in rule["applies_to"]


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

    used_rules = [r for r in rules["lower_water_rules"] if _matches(r, crop_key)]
    alternatives: list[str] = []
    for rule in used_rules:
        for alt in rule["alternatives"]:
            if alt != crop_key and alt not in alternatives:
                alternatives.append(alt)

    gaps = list(COMMON_GAPS)
    if not any(_crop_specific(r, crop_key) for r in used_rules):
        gaps.append(f"No crop-specific rule for '{crop}'; only general lower-water options were used.")

    if alternatives:
        year2, year3 = alternatives[0], alternatives[1] if len(alternatives) > 1 else crop
        rotation = _rotation(
            [crop, year2, year3],
            ["current crop", "lower-water crop", "lower-water crop" if year3 != crop else "current crop"],
            extra={2: {"alternatives": alternatives}},
        )
        why = (
            f"{priority}: {reason}. Keep {crop} and bring lower-water crops into the rotation "
            f"({', '.join(alternatives)})."
        )
        water_need = "Lower than growing the current crop every year, in the years the lower-water crop is grown."
    else:
        rotation = _rotation([crop] * ROTATION_YEARS, ["current crop"] * ROTATION_YEARS)
        why = f"{priority}: {reason}. The rules list no lower-water alternative for {crop}."
        water_need = "Unchanged (no alternative found in the rules)."
        gaps.append(f"The rules contain no lower-water alternative for '{crop}'.")

    risks = [
        "A new crop needs its own sowing window, equipment and market; none of these were checked.",
        "Lower-water crops are less water-demanding, but the rules give no yield comparison.",
    ]
    confidence = "medium" if any(_crop_specific(r, crop_key) for r in used_rules) else "low"

    return {
        "id": "water_efficient",
        "title": "Keep the current crop, add lower-water crops",
        "rotation": rotation,
        "why": why,
        "evidence": _climate_evidence(climate, risk) + [_rule_evidence(rules, r) for r in used_rules],
        "benefits": ["Spreads exposure to dry years across more than one crop."] if alternatives else [],
        "risks": risks,
        "gaps": gaps,
        "water_need": water_need,
        "complexity": "medium",
        "confidence": confidence,
    }


def _soil_restoration(crop: str, climate: dict, risk: dict, rules: dict) -> dict[str, Any]:
    drier = risk["drivers"]["drying"]["triggered"]
    used = rules["soil_restoration_rules"]
    benefit_rules = [r for r in used if r.get("kind") != "caution"]
    caution_rules = [r for r in used if r.get("kind") == "caution"]
    cover_crops = next(c for r in used for c in [r.get("cover_crops")] if c)

    risks = [
        "Cover crops use soil water and need good termination timing.",
        "Needs seed, sowing and termination work that the current rotation may not include.",
    ]
    if drier:
        risks.append("The climate data shows drier conditions, so soil-water use by the cover crop deserves extra care.")

    return {
        "id": "soil_restoration",
        "title": "Add legumes and cover crops",
        "rotation": _rotation(
            [crop, f"legume cover crop ({cover_crops[0]} or {cover_crops[1]})", crop],
            ["current crop", "legume cover crop", "current crop"],
            extra={2: {"alternatives": cover_crops}},
        ),
        "why": (
            f"Worth a look: legume cover crops add nitrogen and protect the soil between {crop} crops. "
            "This option is based on soil benefits, not on the climate risk level."
        ),
        "evidence": _climate_evidence(climate, risk) + [_rule_evidence(rules, r) for r in used],
        "benefits": [r["statement"] for r in benefit_rules],
        "risks": risks + [r["statement"] for r in caution_rules],
        "gaps": list(COMMON_GAPS)
        + ["If the current crop is already a legume, the nitrogen benefit may differ; not assessed."],
        "water_need": "Current crop plus the cover crop's soil-water use; no volume available.",
        "complexity": "medium",
        "confidence": "medium",
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
        _soil_restoration(crop, climate, risk, rules),
    ]
    return [_with_frontend_fields(s, i) for i, s in enumerate(strategies, start=1)]


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

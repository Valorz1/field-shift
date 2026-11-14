# Methodology

This document lists every threshold and rule used by the backend engine. All code is in `backend/app/services/`. No AI model produces any number or strategy: the numbers are calculated from the NASA POWER CSVs, and the strategies come from rules in code plus cited rules in `backend/app/ai/agronomy/rotation_rules.json`.

## 1. Data

| Item | Value |
|---|---|
| Source | NASA POWER, monthly data (`data/raw/power_<place>_monthly.csv`) |
| Temperature | parameter `T2M`, average temperature at 2 m, °C |
| Rain | parameter `PRECTOTCORR_MONTH_TOTAL`, rain per month, mm |
| Baseline period | 2001–2020 |
| Recent period | 2021–2025 |
| Summer | June, July, August |

Every number in the output is an object `{"value", "unit", "label": "calculated", "source": "NASA POWER"}`.

### Cleaning rules (`indicators._load_monthly`)

1. Only `T2M` and `PRECTOTCORR_MONTH_TOTAL` rows are used; other parameters are ignored.
2. Dates in `YYYY-MM-DD`, `YYYY-MM` or `YYYYMM` form are accepted. Rows that are not a real month (NASA POWER's annual summary row uses month 13) are dropped.
3. The NASA POWER fill value `-999` is treated as missing, never as a measurement.
4. Duplicate parameter/year/month rows raise an error instead of being silently merged.
5. **Complete years only.** A year is used only if every month needed has a valid value (12 months for yearly figures, 3 months for summer). A partly-missing year is excluded, so it cannot bias a mean or a total. The number of years actually used is reported as `years_used`.

## 2. Indicators

| Indicator | Calculation |
|---|---|
| Temperature (baseline / recent) | Mean over the period of each complete year's mean of its 12 monthly `T2M` values |
| Temperature change | recent − baseline, in °C |
| Yearly rain (baseline / recent) | Mean over the period of each complete year's total of its 12 monthly rain values, in mm/year |
| Rain change | (recent − baseline) / baseline × 100, in % |
| Summer rain | Same as yearly rain, but each year's total covers June–August only, in mm/summer |

All values are rounded to 2 decimals before differences, percentages and thresholds are calculated. This means every figure in the JSON can be reproduced by hand from the other figures in the JSON.

## 3. Risk level (the thresholds)

| Rule | Threshold | Points |
|---|---|---|
| Warmer | temperature change **≥ +0.5 °C** | 1 |
| Drier | yearly rain change **≤ −5 %** (drier by 5 % or more) | 1 |

| Points | Risk level |
|---|---|
| 0 | low |
| 1 | moderate |
| 2 | high |

Notes:
- A value exactly on a threshold (+0.50 °C, −5.00 %) counts as triggered. This is covered by tests.
- "Drier" is judged on **yearly** rain, as set out in the task brief. Summer rain change is calculated and reported, but it does not score points.
- The thresholds are constants in `indicators.py` (`WARMING_THRESHOLD_C`, `DRYING_THRESHOLD_PCT`). They are simple screening thresholds chosen by the team, not values taken from a published standard.

## 4. Strategies (`strategy_engine.build_strategies`)

Always three, in this order: `baseline`, `water_efficient`, `soil_restoration`. Rotations cover 3 years.

| Strategy | Rotation | Priority rule |
|---|---|---|
| baseline | current crop in years 1–3 | Reference case; no priority |
| water_efficient | current crop in year 1, then lower-water crops from the rules | risk **high** and drier → "Strongly worth a look"; risk moderate or high otherwise → "Worth a look"; risk low → "Optional" |
| soil_restoration | current crop, a legume cover crop in year 2, current crop | Always "Worth a look", based on soil benefits cited in the rules, not on the climate risk level |

### Output fields

Each strategy has: `id`, `title`, `rotation` (years 1–3, each `{year, crop, role}`), `why`, `evidence`, `benefits`, `risks`, `gaps`, `water_need`, `complexity`, `confidence`.

For the frontend (`StrategyView` in `frontend/lib/view-models.ts`) these extra fields are added; they repeat information already above and add no new numbers or claims:

| Field | Value |
|---|---|
| `kind` | `baseline` → `baseline`, `water_efficient` → `climate-adaptive`, `soil_restoration` → `soil-restoration` |
| `position` | 1, 2, 3 |
| `summary` | same text as `why` |
| `rotation_crops` | the three crop names from `rotation`, as plain strings |
| `sources` | `["Calculated"]`, plus `"General agronomy"` when a cited rule was used |

The farm input is read from `current_crop`, falling back to `crop` (the key the frontend session store uses).

"Drier" and "warmer" here are the same triggers used for the risk score (section 3), so the strategy engine and the risk score can never disagree.

Crop ideas come only from `rotation_rules.json`. Each rule lists the sources it comes from, and the rules are qualitative: they state no yields, prices or water volumes.

### Confidence

- `medium` when at least one rule names the farm's current crop.
- `low` when only general rules (`applies_to: "*"`) match, for example for a crop that has no specific rule.
- It is never `high`, because no yield, soil, price or local trial data is used.

### Known gaps (also listed in every strategy's `gaps`)

- No yield, price, soil or irrigation data.
- Local sowing windows, markets and equipment are not checked.
- Rule sources are general references (FAO, SARE, NRCS, UN, news articles), not trials at the farm's location.

## 5. Things to check in the data

- NASA POWER has reported that, for monthly (interannual) data from January 2018, its precipitation values were monthly averages rather than monthly sums (NASA Applied Sciences, Energy Management Q&A, 2021). `PRECTOTCORR_MONTH_TOTAL` should be mm per **month**. If the recent years look about 30 times smaller than the baseline years, the data has this problem and the rain change would be wrong.

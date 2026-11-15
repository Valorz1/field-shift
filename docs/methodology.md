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
| Drier | yearly rain change **≤ −5 %**, **or** summer (Jun–Aug) rain change **≤ −5 %** | 1 |

| Points | Risk level |
|---|---|
| 0 | low |
| 1 | moderate |
| 2 | high |

Notes:
- A value exactly on a threshold (+0.50 °C, −5.00 %) counts as triggered. This is covered by tests.
- "Drier" is judged on yearly rain **or** summer rain. Either one, or both, gives 1 point, so the scale stays 0–2. `risk.drivers.drying.basis` lists which one triggered (`["yearly"]`, `["summer"]`, both, or `[]`).
- Why summer counts: a place can lose a lot of summer rain, when crops need it most, while its yearly total hardly changes. Norfolk is the example: yearly rain −1.78 %, summer rain −29.58 %. Before this rule Norfolk scored moderate; now it scores high.
- The summer trigger reuses the same −5 % threshold as yearly rain. It is a team screening choice, not a published standard. Summer rain varies a lot from year to year, and the recent period has only 5 summers, so a summer trigger is less certain than a yearly one.
- The thresholds are constants in `indicators.py` (`WARMING_THRESHOLD_C`, `DRYING_THRESHOLD_PCT`). They are simple screening thresholds chosen by the team, not values taken from a published standard.

## 4. Strategies (`strategy_engine.build_strategies`)

Always three, in this order: `baseline`, `water_efficient`, `soil_restoration`. Rotations cover 3 years.

| Strategy | Rotation | Priority rule |
|---|---|---|
| baseline | current crop in years 1–3 | Reference case; no priority |
| water_efficient | current crop in year 1, then crops for the place's climate zone from the rules (see "Climate filter") | risk **high** and drier → "Strongly worth a look"; risk moderate or high otherwise → "Worth a look"; risk low → "Optional" |
| soil_restoration | current crop, a cover crop in year 2, current crop. A legume cover crop, unless the current crop is already a legume (see "Legume check") | Always "Worth a look", based on soil benefits cited in the rules, not on the climate risk level |

### Climate filter (cool vs warm places)

| Rule | Threshold |
|---|---|
| Cool place | baseline (2001–2020) average temperature **< 12 °C** |
| Warm place | baseline average temperature **≥ 12 °C** |

- The threshold is the constant `COOL_CLIMATE_THRESHOLD_C` in `strategy_engine.py`. Like the risk thresholds, it is a simple screening threshold chosen by the team, not a value from a published standard. A value of exactly 12.00 °C counts as warm. This is covered by tests.
- It uses the **baseline** temperature (the long-term climate of the place), not the recent one.
- Each lower-water rule has `climates`: `["cool"]` or `["warm"]`. In a cool place only `cool` rules are used; in a warm place only `warm` rules are used. A `warm` tag does not mean the crop cannot grow in a cool place. It means no source was found that supports suggesting it there, so it is left out.
- Cool-place crops (rule CL-1): oilseed rape, field beans, oats, spring barley, winter wheat. These are established arable crops in England (Defra land-use statistics, 2026). Oilseed rape is listed first because it did best in the dry 2026 UK season, and spring-sown crops are listed last because they struggled most (AHDB, 2026; rule CL-2, which is also added to the strategy's `risks`).
- Warm-place crops are unchanged: sorghum, millet, chickpea, cowpea (rules WE-1 to WE-3).
- The cool-climate sources say where these crops are grown, not how much water they use. So in a cool place the strategy title says "add crops suited to a cool climate", not "lower-water crops", and `water_need` says the water use was not compared.
- The zone and the reason (the baseline temperature against 12 °C) are in the strategy's `climate_zone` field and its `evidence`.

Real data: Norfolk's baseline is 10.08 °C, so it counts as cool. Nevada's is 13.21 °C, so it counts as warm. Nevada is only about 1 °C above the threshold, and one yearly average cannot show cold winters or the length of the growing season.

### Legume check

- `rotation_rules.json` → `legumes` lists crops treated as legumes (alfalfa, clovers, vetches, beans including field/faba beans, soybean, peanut, cowpea, peas, chickpea, lentil, sainfoin), with sources.
- If the current crop is a legume, soil_restoration does **not** suggest adding a legume. It suggests a non-legume cover crop, cereal rye (rule SR-4), and the "legumes add nitrogen" rule (SR-1) is not used.
- water_efficient is not changed by this check: grain legumes there (chickpea, cowpea) are rotation crops, not a "add a legume for nitrogen" step.
- Crops not on the list are treated as non-legumes.

### Pulse break

- `rotation_rules.json` → `pulses` lists pulse (grain legume) crops: beans including field/faba/broad beans, peas, chickpea, lentil, cowpea. Forage legumes such as alfalfa and clover are legumes but **not** pulses.
- Rule PG-1: leave at least five years between pulse crops, to reduce soil-borne disease (AHDB, 19 August 2026). A 3-year table cannot show a 5-year break, so the engine makes sure it **never holds more than one pulse**.
- Current crop is a pulse:
  - soil_restoration: year 3 is a cereal instead of the pulse again. That is winter wheat in a cool place (from CL-1) or sorghum in a warm place (from WE-1). Example: field beans → cereal rye → winter wheat.
  - water_efficient: no other pulse is offered. If no other crop is left, the cereal is used.
  - baseline: the rotation stays unchanged (it is the reference case), but `risks` says it goes against the pulse break.
  - All three get a `gaps` note: the field's pulse history was not checked.
- Current crop is not a pulse: water_efficient can still add one pulse (e.g. chickpea), but never two. If every later option is also a pulse, the zone's cereal is used in year 3 instead.

### Same crop, different name

`rotation_rules.json` → `crop_aliases` treats names such as "winter wheat" and "wheat", "spring barley" and "barley", or "faba beans" and "field beans" as one crop. A farm is never offered the crop it already grows under another name.

### Perennial crops (alfalfa)

- `rotation_rules.json` → `perennials` lists crops whose stand is kept for several years. It currently holds only alfalfa.
- Rule PE-1 (UW–Madison Extension): an alfalfa stand can stay productive for four to ten years or more. Reseeding alfalfa straight after alfalfa is not recommended (autotoxicity, seedling disease, pests); a break of at least 12 months has worked.
- When the current crop is a perennial, every strategy gets two `risks`, one `gaps` note (stand age and density were not checked), the PE-1 evidence item and `current_crop_is_perennial: true`. The rotations themselves are not changed: an "alfalfa" year means keeping the stand, not sowing it again.

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

- `medium` when at least one rule names the farm's current crop (in `applies_to` or in its crop list, counting alternative names).
- `low` when only general rules (`applies_to: "*"`) match, for example for a crop that has no specific rule.
- It is never `high`, because no yield, soil, price or local trial data is used.

### Known gaps (also listed in every strategy's `gaps`)

- No yield, price, soil or irrigation data.
- Local sowing windows, markets and equipment are not checked.
- Rule sources are general references (FAO, SARE, NRCS, UN, Defra, AHDB, NMSU, the Food Foundation, news articles), not trials at the farm's location. The AHDB evidence comes from one dry season (2026).

## 5. Things to check in the data

- NASA POWER has reported that, for monthly (interannual) data from January 2018, its precipitation values were monthly averages rather than monthly sums (NASA Applied Sciences, Energy Management Q&A, 2021). `PRECTOTCORR_MONTH_TOTAL` should be mm per **month**. If the recent years look about 30 times smaller than the baseline years, the data has this problem and the rain change would be wrong.

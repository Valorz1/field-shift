from app.services.nasa_power import to_rows

FAKE = {
    "header": {"fill_value": -999},
    "parameters": {"T2M": {"units": "C"}, "PRECTOTCORR": {"units": "mm/day"}},
    "properties": {"parameter": {
        "T2M": {"202501": 3.5, "202502": -999, "202513": 12.0},
        "PRECTOTCORR": {"202502": 2.0},
    }},
}


def test_skips_annual_and_missing_values():
    temps = [r for r in to_rows(FAKE) if r["parameter"] == "T2M"]
    assert [r["date"] for r in temps] == ["2025-01"]
    assert temps[0]["unit"] == "C"


def test_adds_monthly_rain_total_from_mm_per_day():
    total = [r for r in to_rows(FAKE) if r["parameter"] == "PRECTOTCORR_MONTH_TOTAL"][0]
    assert total["value"] == 56.0  # 2.0 mm/day x 28 days in Feb 2025
    assert total["unit"] == "mm"
    assert total["label"] == "calculated"
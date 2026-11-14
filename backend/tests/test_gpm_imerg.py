from app.services.gpm_imerg import parse_giovanni_csv

SAMPLE = """Title:,"Time Series, Area-Averaged of IMERG (monthly)"
Data Bounding Box:,"0.85,52.65,0.95,52.75"
Fill Value (mean_GPM_3IMERGM_07_precipitation):, -9999.9

time, mean_GPM_3IMERGM_07_precipitation
2025-02-01 00:00:00,0.1
2025-03-01 00:00:00,-9999.9
"""


def test_converts_rate_to_monthly_total(tmp_path):
    path = tmp_path / "g4.csv"
    path.write_text(SAMPLE, encoding="utf-8")
    meta, rows = parse_giovanni_csv(path)
    assert meta["Data Bounding Box"] == "0.85,52.65,0.95,52.75"
    total = [r for r in rows if r["parameter"] == "IMERG_PRECIP_MONTH_TOTAL"]
    assert len(total) == 1  # March is a fill value and is skipped
    assert total[0]["date"] == "2025-02"
    assert total[0]["value"] == 67.2  # 0.1 mm/hr x 28 days x 24 h
    assert total[0]["label"] == "calculated"

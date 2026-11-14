"""Shared test helpers.

The CSVs written here are SYNTHETIC test fixtures with round numbers so the
expected results can be checked by hand. They are not NASA data.
"""

from pathlib import Path

import pandas as pd
import pytest

SUMMER = (6, 7, 8)


@pytest.fixture
def make_csv(tmp_path):
    """Return a function that writes a POWER-style monthly CSV for 2001-2025."""

    def _make(
        name="farm.csv",
        temp_base=10.0,
        temp_recent=10.0,
        rain_base=50.0,  # mm in every non-summer month
        rain_recent=50.0,
        summer_base=None,  # mm in each summer month (defaults to the non-summer value)
        summer_recent=None,
        date_format="%Y-%m-%d",
        mutate=None,  # optional function(rows) -> rows, to inject problems
    ) -> Path:
        summer_base = rain_base if summer_base is None else summer_base
        summer_recent = rain_recent if summer_recent is None else summer_recent
        rows = []
        for year in range(2001, 2026):
            recent = year >= 2021
            for month in range(1, 13):
                date = pd.Timestamp(year=year, month=month, day=1).strftime(date_format)
                temp = temp_recent if recent else temp_base
                if month in SUMMER:
                    rain = summer_recent if recent else summer_base
                else:
                    rain = rain_recent if recent else rain_base
                rows.append((date, "T2M", temp, "C", "NASA POWER", "observed"))
                rows.append((date, "PRECTOTCORR_MONTH_TOTAL", rain, "mm", "NASA POWER", "observed"))
        if mutate:
            rows = mutate(rows)
        path = tmp_path / name
        pd.DataFrame(
            rows, columns=["date", "parameter", "value", "unit", "source", "label"]
        ).to_csv(path, index=False)
        return path

    return _make

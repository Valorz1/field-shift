"""Indicator calculations.

Implement validated baselines, anomaly calculations, uncertainty handling,
and risk categories with documented assumptions before production use.
"""
def classify_anomaly(z_score: float) -> str:
    magnitude = abs(z_score)
    if magnitude < 1:
        return "low"
    if magnitude < 2:
        return "moderate"
    return "high"

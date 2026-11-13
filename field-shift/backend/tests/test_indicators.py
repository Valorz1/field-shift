from app.services.indicators import classify_anomaly

def test_classify_anomaly():
    assert classify_anomaly(0.2) == "low"
    assert classify_anomaly(1.2) == "moderate"
    assert classify_anomaly(-2.1) == "high"

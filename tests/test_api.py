"""
Tests for the FastAPI backend endpoints.
Covers: health check, prediction, metrics, data summary, and chart routes.
"""
import pytest
from fastapi.testclient import TestClient

from api.main import app

SAMPLE_HOUSE = {
    "GrLivArea": 1710,
    "OverallQual": 7,
    "GarageCars": 2,
    "TotalBsmtSF": 856,
    "FullBath": 2,
    "BedroomAbvGr": 3,
}


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


# ── Health ────────────────────────────────────────────────────────────────────

def test_health_returns_ok(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["total_records"] >= 1000


# ── Prediction ────────────────────────────────────────────────────────────────

def test_predict_valid_house(client):
    response = client.post("/api/predict", json=SAMPLE_HOUSE)
    assert response.status_code == 200
    data = response.json()
    assert "estimated_price" in data
    assert "formatted_price" in data
    assert data["estimated_price"] > 50_000


def test_predict_invalid_quality_rejected(client):
    """OverallQual must be between 1 and 10 — expect 422 Unprocessable Entity."""
    bad_payload = {**SAMPLE_HOUSE, "OverallQual": 15}
    response = client.post("/api/predict", json=bad_payload)
    assert response.status_code == 422


def test_predict_missing_field_rejected(client):
    """Missing required field — expect 422 Unprocessable Entity."""
    incomplete = {k: v for k, v in SAMPLE_HOUSE.items() if k != "GrLivArea"}
    response = client.post("/api/predict", json=incomplete)
    assert response.status_code == 422


# ── Metrics ───────────────────────────────────────────────────────────────────

def test_metrics_returns_expected_keys(client):
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    for key in ("R2", "MAE", "RMSE"):
        assert key in data, f"Missing metric key: {key}"
    assert data["R2"] >= 0.70


# ── Data summary ──────────────────────────────────────────────────────────────

def test_data_summary_returns_valid_stats(client):
    response = client.get("/api/data/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 1000
    assert data["median_price"] > 50_000


# ── Chart endpoints ───────────────────────────────────────────────────────────

@pytest.mark.parametrize("route", [
    "/api/charts/price-distribution",
    "/api/charts/neighborhoods",
    "/api/charts/area-vs-price",
])
def test_chart_endpoints_return_data(client, route):
    response = client.get(route)
    assert response.status_code == 200
    body = response.json()
    assert body  # non-empty response

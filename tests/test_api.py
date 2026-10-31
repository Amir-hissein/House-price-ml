import pytest
from fastapi.testclient import TestClient

from api.main import app


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


def test_api_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["total_records"] >= 1000


def test_api_predict_endpoint_valid(client):
    payload = {
        "GrLivArea": 1710,
        "OverallQual": 7,
        "GarageCars": 2,
        "TotalBsmtSF": 856,
        "FullBath": 2,
        "BedroomAbvGr": 3
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "estimated_price" in data
    assert "formatted_price" in data
    assert "percentile" in data
    assert data["estimated_price"] > 50000


def test_api_predict_endpoint_invalid_features(client):
    # OverallQual doit être entre 1 et 10
    payload = {
        "GrLivArea": 1710,
        "OverallQual": 15,
        "GarageCars": 2,
        "TotalBsmtSF": 856,
        "FullBath": 2,
        "BedroomAbvGr": 3
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422  # Erreur de validation Pydantic


def test_api_metrics_endpoint(client):
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "R2" in data
    assert "MAE" in data
    assert data["R2"] >= 0.70


def test_api_data_summary_endpoint(client):
    response = client.get("/api/data/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 1000
    assert data["median_price"] > 50000


def test_api_charts_endpoints(client):
    r_dist = client.get("/api/charts/price-distribution")
    assert r_dist.status_code == 200
    assert "distribution" in r_dist.json()

    r_neigh = client.get("/api/charts/neighborhoods")
    assert r_neigh.status_code == 200
    assert len(r_neigh.json()) > 0

    r_area = client.get("/api/charts/area-vs-price")
    assert r_area.status_code == 200
    assert len(r_area.json()) > 0

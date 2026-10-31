import pytest
from pathlib import Path

from src.evaluate import evaluate_model, DEFAULT_METRICS_PATH


def test_evaluate_model_returns_metrics_dict():
    """Vérifie que evaluate_model retourne toutes les métriques requises."""
    metrics = evaluate_model()
    assert isinstance(metrics, dict)
    assert "R2" in metrics
    assert "MAE" in metrics
    assert "RMSE" in metrics
    assert "MAPE_pct" in metrics
    assert "Median_Accuracy_pct" in metrics


def test_evaluate_model_writes_json_file():
    """Vérifie la création effective de reports/metrics.json."""
    evaluate_model()
    assert DEFAULT_METRICS_PATH.exists()
    assert DEFAULT_METRICS_PATH.stat().st_size > 0


def test_evaluate_metrics_ranges():
    """Vérifie que les métriques se situent dans des plages cohérentes."""
    metrics = evaluate_model()
    assert 0.70 <= metrics["R2"] <= 1.0
    assert metrics["MAE"] > 0
    assert metrics["MAPE_pct"] < 30.0  # Erreur relative inférieure à 30%

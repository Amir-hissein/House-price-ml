import json
from pathlib import Path
import joblib
import pytest
from sklearn.pipeline import Pipeline

from src.train import main, MODEL_DIR, ROOT


def test_train_creates_model_file():
    """Vérifie que l'exécution de main() entraîne et sauvegarde le fichier joblib."""
    main()
    model_file = MODEL_DIR / "linear_regression.joblib"
    assert model_file.exists()
    assert model_file.stat().st_size > 0


def test_train_model_pipeline_structure():
    """Vérifie que le modèle sérialisé est un Pipeline valide avec imputer et regressor."""
    model_file = MODEL_DIR / "linear_regression.joblib"
    model = joblib.load(model_file)
    assert isinstance(model, Pipeline)
    assert "imputer" in model.named_steps
    assert "regressor" in model.named_steps


def test_train_produces_valid_metrics():
    """Vérifie que le modèle atteint un score R2 acceptable (> 0.70) sur le test set."""
    metrics_file = ROOT / "reports" / "metrics.json"
    assert metrics_file.exists()
    with open(metrics_file, "r", encoding="utf-8") as f:
        metrics = json.load(f)
    assert "R2" in metrics
    assert metrics["R2"] >= 0.70

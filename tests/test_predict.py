import pytest
import pandas as pd
import numpy as np

from src.predict import predict


def test_predict_single_dict():
    """Vérifie la prédiction sur un dictionnaire d'une maison standard."""
    sample = {
        "GrLivArea": 1500,
        "OverallQual": 6,
        "GarageCars": 2,
        "TotalBsmtSF": 800,
        "FullBath": 2,
        "BedroomAbvGr": 3
    }
    pred = predict(sample)
    assert isinstance(pred, np.ndarray)
    assert len(pred) == 1
    # Le prix estimé doit être réaliste (> 50k$ et < 800k$)
    assert 50000 < pred[0] < 800000


def test_predict_dataframe_batch():
    """Vérifie la prédiction par lot sur un DataFrame pandas."""
    df_sample = pd.DataFrame([
        {"GrLivArea": 1200, "OverallQual": 5, "GarageCars": 1, "TotalBsmtSF": 600, "FullBath": 1, "BedroomAbvGr": 2},
        {"GrLivArea": 2500, "OverallQual": 9, "GarageCars": 3, "TotalBsmtSF": 1500, "FullBath": 3, "BedroomAbvGr": 4}
    ])
    preds = predict(df_sample)
    assert len(preds) == 2
    # Une maison plus grande et de meilleure qualité doit valoir plus cher
    assert preds[1] > preds[0]


def test_predict_missing_feature_raises_error():
    """Vérifie qu'une exception ValueError est levée si une variable obligatoire manque."""
    incomplete_sample = {
        "GrLivArea": 1500,
        "OverallQual": 6
        # Variables manquantes volontairement
    }
    with pytest.raises(ValueError):
        predict(incomplete_sample)

import pytest
import pandas as pd
from pathlib import Path

from src.data_loader import load_house_data, DEFAULT_CSV_PATH
from src.train import FEATURES


def test_data_loader_returns_dataframe():
    """Vérifie que load_house_data retourne un DataFrame pandas non vide."""
    df = load_house_data()
    assert isinstance(df, pd.DataFrame)
    assert not df.empty
    assert len(df) >= 1000


def test_data_loader_has_required_features():
    """Vérifie la présence de toutes les variables nécessaires et de la cible SalePrice."""
    df = load_house_data()
    assert "SalePrice" in df.columns
    for feature in FEATURES:
        assert feature in df.columns, f"Variable manquante : {feature}"


def test_data_loader_price_consistency():
    """Vérifie que les prix sont positifs et cohérents avec un marché immobilier."""
    df = load_house_data()
    assert (df["SalePrice"] > 0).all()
    assert df["SalePrice"].median() > 50000

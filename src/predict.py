from pathlib import Path
from typing import Dict, Union
import joblib
import numpy as np
import pandas as pd

from src.train import FEATURES

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MODEL_PATH = ROOT / "models" / "linear_regression.joblib"


def load_model(model_path: Path = DEFAULT_MODEL_PATH):
    """Charge le modèle sérialisé (Pipeline)."""
    model_path = Path(model_path)
    if not model_path.exists():
        raise FileNotFoundError(f"Modèle introuvable à {model_path}. Lancez l'entraînement d'abord (src/train.py).")

    return joblib.load(model_path)


def predict(input_data: Union[Dict, pd.DataFrame], model_path: Path = DEFAULT_MODEL_PATH) -> np.ndarray:
    """
    Effectue une prédiction sur de nouvelles observations pour estimer SalePrice
    sur la base des 6 features :
    ['GrLivArea', 'OverallQual', 'GarageCars', 'TotalBsmtSF', 'FullBath', 'BedroomAbvGr']
    """
    model = load_model(model_path)

    if isinstance(input_data, dict):
        df = pd.DataFrame([input_data])
    else:
        df = input_data.copy()

    # Vérification et alignement des colonnes
    missing = [c for c in FEATURES if c not in df.columns]
    if missing:
        raise ValueError(f"Variables manquantes pour la prédiction : {missing}")

    X = df[FEATURES]
    predictions = model.predict(X)
    return predictions


if __name__ == "__main__":
    # Exemple représentatif avec les 6 features clés
    sample_house = {
        "GrLivArea": 1710,       # Surface habitable
        "OverallQual": 7,        # Qualité générale (1 à 10)
        "GarageCars": 2,         # Capacité du garage (2 voitures)
        "TotalBsmtSF": 856,      # Surface du sous-sol
        "FullBath": 2,           # Salles de bain complètes
        "BedroomAbvGr": 3        # Nombre de chambres à l'étage
    }

    try:
        predicted_price = predict(sample_house)[0]
        print("--- Inférence d'Exemple (House Prices - 6 Features) ---")
        print(f"Caractéristiques: {sample_house}")
        print(f"Prix de vente estimé (SalePrice) : ${predicted_price:,.2f}")
    except Exception as e:
        print(f"Erreur lors de la prédiction: {e}")

from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from src.data_loader import load_house_data
from src.train import FEATURES

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MODEL_PATH = ROOT / "models" / "linear_regression.joblib"
DEFAULT_METRICS_PATH = ROOT / "reports" / "metrics.json"


def evaluate_model(model_path: Path = DEFAULT_MODEL_PATH, metrics_path: Path = DEFAULT_METRICS_PATH) -> dict:
    """
    Évalue le modèle de régression linéaire sur le jeu de test (20% des données que le modèle n'a jamais vues)
    et calcule les indicateurs clés de fiabilité : R², MAE, RMSE, et précision moyenne.
    """
    model_path = Path(model_path)
    metrics_path = Path(metrics_path)

    if not model_path.exists():
        raise FileNotFoundError(f"Modèle introuvable à {model_path}. Exécutez d'abord python3 -m src.train.")

    model = joblib.load(model_path)
    df = load_house_data()

    X = df[FEATURES]
    y = df["SalePrice"]

    # Partitionnement identique à l'entraînement (random_state=42)
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Prédictions sur des maisons que le modèle n'a JAMAIS vues pendant l'apprentissage
    predictions = model.predict(X_test)

    # Calcul des métriques statistiques standard
    mae = float(mean_absolute_error(y_test, predictions))
    mse = float(mean_squared_error(y_test, predictions))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_test, predictions))

    # Métrique métier : Erreur relative médiane en % (ex: MAPE)
    percentage_errors = np.abs((y_test - predictions) / y_test) * 100
    mape = float(np.mean(percentage_errors))
    median_accuracy = float(100 - np.median(percentage_errors))

    metrics = {
        "R2": round(r2, 4),
        "MAE": round(mae, 2),
        "RMSE": round(rmse, 2),
        "MSE": round(mse, 2),
        "MAPE_pct": round(mape, 2),
        "Median_Accuracy_pct": round(median_accuracy, 2),
        "nb_test_samples": len(y_test)
    }

    metrics_path.parent.mkdir(parents=True, exist_ok=True)
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print("=========================================================")
    print("        RAPPORT D'ÉVALUATION DU MODÈLE DE MACHINE LEARNING")
    print("=========================================================")
    print(f"Échantillons de test évalués (maisons inconnues) : {metrics['nb_test_samples']}")
    print(f"1. Score R² (Coefficient de Détermination)      : {metrics['R2']} (soit {metrics['R2']*100:.1f}%)")
    print(f"2. MAE (Erreur moyenne absolue en $)             : ${metrics['MAE']:,.2f}")
    print(f"3. RMSE (Écart-type des erreurs en $)            : ${metrics['RMSE']:,.2f}")
    print(f"4. Précision médiane constatée                   : {metrics['Median_Accuracy_pct']}%")
    print(f"5. Erreur moyenne en pourcentage (MAPE)          : {metrics['MAPE_pct']}%")
    print("=========================================================")
    print(f"Métriques enregistrées dans : {metrics_path}")

    return metrics


if __name__ == "__main__":
    evaluate_model()

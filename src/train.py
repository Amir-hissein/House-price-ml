from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)

from src.data_loader import load_house_data

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / "models"
FIGURES_DIR = ROOT / "reports" / "figures"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
FIGURES_DIR.mkdir(parents=True, exist_ok=True)

FEATURES = [
    "GrLivArea",
    "OverallQual",
    "GarageCars",
    "TotalBsmtSF",
    "FullBath",
    "BedroomAbvGr",
]


def main():
    df = load_house_data()

    X = df[FEATURES].copy()
    y = df["SalePrice"].copy()

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
    )

    model = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("regressor", LinearRegression()),
    ])

    model.fit(X_train, y_train)
    predictions = model.predict(X_test)

    metrics = {
        "MAE": float(mean_absolute_error(y_test, predictions)),
        "RMSE": float(np.sqrt(
            mean_squared_error(y_test, predictions)
        )),
        "R2": float(r2_score(y_test, predictions)),
    }

    print("\nRésultats sur le jeu de test :")
    print(json.dumps(metrics, indent=2))

    joblib.dump(model, MODEL_DIR / "linear_regression.joblib")

    with open(ROOT / "reports" / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    # Graphique 1 : prix réel vs prix prédit
    plt.figure(figsize=(8, 6))
    sns.scatterplot(x=y_test, y=predictions)
    plt.xlabel("Prix réel ($)")
    plt.ylabel("Prix prédit ($)")
    plt.title("Prix réels vs prix prédits")
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "actual_vs_predicted.png")
    plt.close()

    # Graphique 2 : distribution des prix
    plt.figure(figsize=(8, 6))
    sns.histplot(y, bins=30, kde=True)
    plt.xlabel("Prix de vente ($)")
    plt.title("Distribution des prix des maisons")
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "price_distribution.png")
    plt.close()

    # Graphique 3 : erreurs de prédiction
    errors = y_test - predictions
    plt.figure(figsize=(8, 6))
    sns.scatterplot(x=predictions, y=errors)
    plt.axhline(0, linestyle="--")
    plt.xlabel("Prix prédit ($)")
    plt.ylabel("Erreur : prix réel - prix prédit")
    plt.title("Analyse des erreurs")
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "residuals.png")
    plt.close()

    print("\nModèle sauvegardé.")
    print("Graphiques enregistrés dans reports/figures/")


if __name__ == "__main__":
    main()

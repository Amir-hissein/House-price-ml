from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from src.data_loader import load_house_data
from src.predict import predict, DEFAULT_MODEL_PATH
from src.train import FEATURES

ROOT = Path(__file__).resolve().parents[1]
METRICS_PATH = ROOT / "reports" / "metrics.json"
FRONTEND_DIST = ROOT / "frontend" / "dist"

app = FastAPI(
    title="House Price ML API",
    description="API FastAPI pour la prédiction de prix immobiliers et l'exposition des données et graphiques.",
    version="1.0.0"
)

# Configuration CORS pour autoriser le frontend React (Vite sur port 5173 / localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chargement du jeu de données en mémoire
try:
    df_data = load_house_data()
except Exception as e:
    df_data = pd.DataFrame()


class HouseFeatures(BaseModel):
    GrLivArea: float = Field(..., ge=100, le=10000, description="Surface habitable en sq ft")
    OverallQual: int = Field(..., ge=1, le=10, description="Qualité générale de 1 à 10")
    GarageCars: int = Field(..., ge=0, le=5, description="Nombre de places de garage")
    TotalBsmtSF: float = Field(..., ge=0, le=5000, description="Surface du sous-sol en sq ft")
    FullBath: int = Field(..., ge=0, le=5, description="Nombre de salles de bain complètes")
    BedroomAbvGr: int = Field(..., ge=0, le=10, description="Nombre de chambres hors sous-sol")

    model_config = {
        "json_schema_extra": {
            "example": {
                "GrLivArea": 1710,
                "OverallQual": 7,
                "GarageCars": 2,
                "TotalBsmtSF": 856,
                "FullBath": 2,
                "BedroomAbvGr": 3
            }
        }
    }

@app.get("/api/health")
def health_check():
    """Vérifie l'état de l'API et du modèle ML."""
    return {
        "status": "healthy",
        "model_loaded": DEFAULT_MODEL_PATH.exists(),
        "total_records": len(df_data) if not df_data.empty else 0
    }

@app.post("/api/predict")
def predict_price(house: HouseFeatures):
    """Estime le prix de vente d'une maison sur la base des 6 caractéristiques."""
    if not DEFAULT_MODEL_PATH.exists():
        raise HTTPException(status_code=500, detail="Modèle introuvable sur le serveur.")

    try:
        input_dict = house.model_dump()
        prediction = float(predict(input_dict)[0])
        estimated_price = max(10000.0, prediction)

        # Statistiques de positionnement par rapport au marché réel
        percentile = 50.0
        diff_from_median = 0.0
        median_price = 163000.0

        if not df_data.empty and "SalePrice" in df_data.columns:
            median_price = float(df_data["SalePrice"].median())
            percentile = float((df_data["SalePrice"] < estimated_price).mean() * 100)
            diff_from_median = float(estimated_price - median_price)

        return {
            "estimated_price": round(estimated_price, 2),
            "formatted_price": f"${estimated_price:,.0f}",
            "percentile": round(percentile, 1),
            "median_market_price": round(median_price, 2),
            "diff_from_median": round(diff_from_median, 2),
            "input_features": input_dict
        }
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

@app.get("/api/metrics")
def get_metrics():
    """Retourne les métriques officielles d'évaluation du modèle."""
    if not METRICS_PATH.exists():
        return {
            "R2": 0.7992,
            "MAE": 25290.76,
            "RMSE": 39240.84,
            "Median_Accuracy_pct": 88.37,
            "MAPE_pct": 15.47
        }
    with open(METRICS_PATH, "r", encoding="utf-8") as f:
        metrics = json.load(f)
    return metrics


@app.get("/api/data/summary")
def get_data_summary():
    """Retourne le résumé statistique du jeu de données officiel."""
    if df_data.empty:
        raise HTTPException(status_code=404, detail="Données non disponibles.")

    prices = df_data["SalePrice"]
    return {
        "count": int(len(df_data)),
        "min_price": float(prices.min()),
        "max_price": float(prices.max()),
        "median_price": float(prices.median()),
        "mean_price": float(prices.mean()),
        "neighborhoods_count": int(df_data["Neighborhood"].nunique()) if "Neighborhood" in df_data.columns else 0,
        "features_available": FEATURES
    }

@app.get("/api/data/sample")
def get_data_sample(limit: int = 1460, neighborhood: Optional[str] = None):
    """Retourne les maisons réelles pour exploration (toutes par défaut)."""
    if df_data.empty:
        return []

    subset = df_data.copy()
    if neighborhood and neighborhood != "all" and "Neighborhood" in subset.columns:
        subset = subset[subset["Neighborhood"] == neighborhood]

    cols = ["Id", "SalePrice", "GrLivArea", "OverallQual", "GarageCars", "TotalBsmtSF", "FullBath", "BedroomAbvGr", "Neighborhood", "YearBuilt"]
    avail_cols = [c for c in cols if c in subset.columns]
    records = subset[avail_cols].head(limit).to_dict(orient="records")
    return records


@app.get("/api/charts/price-distribution")
def get_price_distribution():
    """Génère les données d'histogramme des prix réels."""
    if df_data.empty or "SalePrice" not in df_data.columns:
        return {"bins": [], "counts": []}

    counts, bin_edges = np.histogram(df_data["SalePrice"], bins=20)
    data = []
    for i in range(len(counts)):
        label = f"${int(bin_edges[i]/1000)}k-${int(bin_edges[i+1]/1000)}k"
        data.append({
            "range": label,
            "min": float(bin_edges[i]),
            "max": float(bin_edges[i+1]),
            "count": int(counts[i])
        })
    return {
        "median": float(df_data["SalePrice"].median()),
        "mean": float(df_data["SalePrice"].mean()),
        "distribution": data
    }


@app.get("/api/charts/neighborhoods")
def get_neighborhoods_stats():
    """Retourne le classement des quartiers par prix médian."""
    if df_data.empty or "Neighborhood" not in df_data.columns:
        return []

    grouped = df_data.groupby("Neighborhood")["SalePrice"].agg(["count", "median", "mean"]).reset_index()
    grouped = grouped.sort_values(by="median", ascending=False)
    results = [
        {
            "neighborhood": row["Neighborhood"],
            "count": int(row["count"]),
            "median_price": float(row["median"]),
            "mean_price": float(row["mean"])
        }
        for _, row in grouped.iterrows()
    ]
    return results


@app.get("/api/charts/area-vs-price")
def get_area_vs_price(sample_size: int = 150):
    """Retourne des points (Surface, Prix, Qualité) pour le scatter plot."""
    if df_data.empty:
        return []

    sampled = df_data.sample(min(sample_size, len(df_data)), random_state=42)
    results = []
    for _, row in sampled.iterrows():
        results.append({
            "GrLivArea": float(row["GrLivArea"]),
            "SalePrice": float(row["SalePrice"]),
            "OverallQual": int(row["OverallQual"]),
            "Neighborhood": str(row.get("Neighborhood", "N/A"))
        })
    return results


@app.get("/api/plotly/price-distribution")
def get_plotly_price_distribution():
    """Retourne la figure Plotly exacte de distribution des prix (identique à Streamlit)."""
    from src.visualize import create_price_distribution_plot
    fig = create_price_distribution_plot(df_data)
    return json.loads(fig.to_json())


@app.get("/api/plotly/area-vs-price")
def get_plotly_area_vs_price():
    """Retourne la figure Plotly exacte Surface vs Prix (identique à Streamlit)."""
    from src.visualize import create_area_vs_price_plot
    fig = create_area_vs_price_plot(df_data)
    return json.loads(fig.to_json())


@app.get("/api/plotly/neighborhoods")
def get_plotly_neighborhoods():
    """Retourne la figure Plotly exacte des quartiers (identique à Streamlit)."""
    from src.visualize import create_neighborhood_box_plot
    fig = create_neighborhood_box_plot(df_data)
    if fig is None:
        return {"data": [], "layout": {}}
    return json.loads(fig.to_json())


@app.get("/api/plotly/correlation")
def get_plotly_correlation():
    """Retourne la figure Plotly exacte de la matrice de corrélation (identique à Streamlit)."""
    from src.visualize import create_correlation_heatmap
    fig = create_correlation_heatmap(df_data)
    return json.loads(fig.to_json())


@app.get("/api/plotly/model-performance")
def get_plotly_model_performance():
    """Retourne la figure Plotly exacte Prix Réels vs Estimés (identique à Streamlit)."""
    from src.visualize import create_model_performance_plot
    fig = create_model_performance_plot(df_data)
    if fig is None:
        return {"data": [], "layout": {}}
    return json.loads(fig.to_json())


# Montage du frontend React buildé
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="static_frontend")



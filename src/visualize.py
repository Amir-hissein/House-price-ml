from pathlib import Path
import json
import joblib
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import matplotlib.pyplot as plt
import seaborn as sns

from src.data_loader import load_house_data
from src.train import FEATURES

ROOT = Path(__file__).resolve().parents[1]
FIGURES_DIR = ROOT / "reports" / "figures"
FIGURES_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = ROOT / "models" / "linear_regression.joblib"


def create_price_distribution_plot(df: pd.DataFrame) -> go.Figure:
    """Histogramme interactif de la distribution des vrais prix de vente."""
    median_val = df["SalePrice"].median()
    mean_val = df["SalePrice"].mean()

    fig = px.histogram(
        df,
        x="SalePrice",
        nbins=50,
        title="Distribution des Prix de Vente (SalePrice)",
        labels={"SalePrice": "Prix de Vente ($)"},
        color_discrete_sequence=["#2563EB"],
        opacity=0.85
    )
    # Ligne médiane unique, bien positionnée dans l'histogramme uniquement
    fig.add_vline(
        x=median_val,
        line_dash="dash",
        line_color="#DC2626",
        line_width=2,
        annotation_text=f"Médiane : ${median_val:,.0f}",
        annotation_position="top right",
        annotation=dict(font_size=12, font_color="#DC2626")
    )
    fig.add_vline(
        x=mean_val,
        line_dash="dot",
        line_color="#7C3AED",
        line_width=1.5,
        annotation_text=f"Moyenne : ${mean_val:,.0f}",
        annotation_position="top left",
        annotation=dict(font_size=11, font_color="#7C3AED")
    )
    fig.update_layout(
        template="plotly_white",
        bargap=0.05,
        xaxis_title="Prix de Vente ($)",
        yaxis_title="Nombre de maisons",
        showlegend=False
    )
    return fig


def create_area_vs_price_plot(df: pd.DataFrame) -> go.Figure:
    """Nuage de points interactif : Surface habitable vs Prix, coloré par la qualité globale."""
    hover_cols = ["Neighborhood", "YearBuilt", "FullBath", "GarageCars"]
    available_hover = [c for c in hover_cols if c in df.columns]

    fig = px.scatter(
        df,
        x="GrLivArea",
        y="SalePrice",
        color="OverallQual",
        size="TotalBsmtSF" if "TotalBsmtSF" in df.columns else None,
        hover_data=available_hover,
        title="Surface Habitable (GrLivArea) vs Prix de Vente réel",
        labels={
            "GrLivArea": "Surface Habitable (sq ft)",
            "SalePrice": "Prix de Vente ($)",
            "OverallQual": "Qualité (1-10)",
            "TotalBsmtSF": "Sous-sol (sq ft)"
        },
        color_continuous_scale="Plasma",
        opacity=0.8
    )
    fig.update_layout(template="plotly_white")
    return fig


def create_neighborhood_box_plot(df: pd.DataFrame) -> go.Figure:
    """Distribution des prix par quartier réel."""
    if "Neighborhood" not in df.columns:
        return None

    order = df.groupby("Neighborhood")["SalePrice"].median().sort_values(ascending=False).index

    fig = px.box(
        df,
        x="Neighborhood",
        y="SalePrice",
        color="Neighborhood",
        category_orders={"Neighborhood": order},
        title="Distribution Réelle des Prix par Quartier (Neighborhood)",
        labels={"SalePrice": "Prix de Vente ($)", "Neighborhood": "Quartier"},
    )
    fig.update_layout(template="plotly_white", showlegend=False, xaxis_tickangle=-45)
    return fig


def create_correlation_heatmap(df: pd.DataFrame) -> go.Figure:
    """Matrice de corrélation interactive sur les variables réelles."""
    numeric_df = df.select_dtypes(include=["int64", "float64"])
    if "Id" in numeric_df.columns:
        numeric_df = numeric_df.drop(columns=["Id"])

    if "SalePrice" in numeric_df.columns:
        top_corr = numeric_df.corr()["SalePrice"].abs().sort_values(ascending=False).head(10).index
        corr_matrix = numeric_df[top_corr].corr()
    else:
        corr_matrix = numeric_df.iloc[:, :10].corr()

    fig = px.imshow(
        corr_matrix,
        text_auto=".2f",
        aspect="auto",
        color_continuous_scale="RdBu_r",
        title="Matrice de Corrélation des Variables Clés avec SalePrice"
    )
    fig.update_layout(template="plotly_white")
    return fig


def create_model_performance_plot(df: pd.DataFrame) -> go.Figure:
    """Graphique interactif Comparaison Prix Réels vs Prix Prédits avec infobulles."""
    if not MODEL_PATH.exists():
        return None

    model = joblib.load(MODEL_PATH)
    X = df[FEATURES]
    y_true = df["SalePrice"]
    y_pred = model.predict(X)

    eval_df = pd.DataFrame({
        "Prix_Reel": y_true,
        "Prix_Predit": y_pred,
        "Erreur": y_true - y_pred,
        "Erreur_Absolue": np.abs(y_true - y_pred),
        "OverallQual": df["OverallQual"],
        "GrLivArea": df["GrLivArea"]
    })

    fig = px.scatter(
        eval_df,
        x="Prix_Reel",
        y="Prix_Predit",
        color="Erreur_Absolue",
        hover_data=["OverallQual", "GrLivArea", "Erreur"],
        labels={
            "Prix_Reel": "Prix Réel ($)",
            "Prix_Predit": "Prix Prédit ($)",
            "Erreur_Absolue": "Erreur ($)"
        },
        title="Performance Réelle : Prix Observés vs Prix Estimés par le Modèle",
        color_continuous_scale="Viridis",
        opacity=0.75
    )

    min_val = min(y_true.min(), y_pred.min())
    max_val = max(y_true.max(), y_pred.max())
    fig.add_shape(
        type="line",
        x0=min_val, y0=min_val,
        x1=max_val, y1=max_val,
        line=dict(color="#DC2626", dash="dash", width=2)
    )
    fig.update_layout(template="plotly_white")
    return fig


def export_all_static_and_interactive():
    """Exporte les visualisations statiques (PNG) et interactives (HTML)."""
    df = load_house_data()

    print("Génération des graphiques interactifs (Plotly)...")
    fig_dist = create_price_distribution_plot(df)
    fig_dist.write_html(str(FIGURES_DIR / "interactive_price_distribution.html"))

    fig_area = create_area_vs_price_plot(df)
    fig_area.write_html(str(FIGURES_DIR / "interactive_area_vs_price.html"))

    fig_neigh = create_neighborhood_box_plot(df)
    if fig_neigh:
        fig_neigh.write_html(str(FIGURES_DIR / "interactive_neighborhood_box.html"))

    fig_corr = create_correlation_heatmap(df)
    fig_corr.write_html(str(FIGURES_DIR / "interactive_correlation_heatmap.html"))

    fig_perf = create_model_performance_plot(df)
    if fig_perf:
        fig_perf.write_html(str(FIGURES_DIR / "interactive_model_performance.html"))

    print(f"Graphiques interactifs HTML enregistrés avec succès dans: {FIGURES_DIR}")


if __name__ == "__main__":
    export_all_static_and_interactive()

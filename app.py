from pathlib import Path
import json
import joblib
import pandas as pd
import streamlit as st

from src.data_loader import load_house_data
from src.visualize import (
    create_price_distribution_plot,
    create_area_vs_price_plot,
    create_neighborhood_box_plot,
    create_correlation_heatmap,
    create_model_performance_plot,
)

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "models" / "linear_regression.joblib"
METRICS_PATH = ROOT / "reports" / "metrics.json"

st.set_page_config(
    page_title="House Price Predictor",
    page_icon="🏠",
    layout="wide",
)

# Chargement du modèle
if MODEL_PATH.exists():
    model = joblib.load(MODEL_PATH)
else:
    model = None

# Chargement des données réelles avec cache
@st.cache_data
def get_data():
    return load_house_data()

try:
    df_real = get_data()
except Exception:
    df_real = pd.DataFrame()

st.title("🏠 House Price Predictor")
st.write("Estime le prix d'une maison avec un modèle de Machine Learning et explore les vraies données.")

# Navigation par onglets élégants
tab_pred, tab_charts, tab_eval, tab_data = st.tabs([
    "🔮 Prédire le prix",
    "📈 Graphiques des vraies données",
    "📊 Performances du modèle",
    "📁 Tableau des données"
])

# ==========================================
# 1. ONGLET : PRÉDICTION
# ==========================================
with tab_pred:
    col1, col2 = st.columns(2)

    with col1:
        area = st.number_input(
            "Surface habitable (sq ft)",
            min_value=100,
            max_value=10000,
            value=1500,
            step=50,
        )
        quality = st.slider(
            "Qualité générale",
            min_value=1,
            max_value=10,
            value=6,
        )
        garage = st.number_input(
            "Capacité du garage",
            min_value=0,
            max_value=5,
            value=2,
        )

    with col2:
        basement = st.number_input(
            "Surface du sous-sol (sq ft)",
            min_value=0,
            max_value=5000,
            value=800,
            step=50,
        )
        bathrooms = st.number_input(
            "Salles de bain complètes",
            min_value=0,
            max_value=5,
            value=2,
        )
        bedrooms = st.number_input(
            "Chambres",
            min_value=0,
            max_value=10,
            value=3,
        )

    if st.button("Prédire le prix", type="primary", width="stretch"):
        if model is None:
            st.error("Le modèle n'est pas encore entraîné. Exécutez `python3 -m src.train`.")
        else:
            house = pd.DataFrame([{
                "GrLivArea": area,
                "OverallQual": quality,
                "GarageCars": garage,
                "TotalBsmtSF": basement,
                "FullBath": bathrooms,
                "BedroomAbvGr": bedrooms,
            }])

            prediction = model.predict(house)[0]

            col_res1, col_res2 = st.columns([1, 1])
            with col_res1:
                st.metric(
                    "Prix estimé",
                    f"${prediction:,.0f}",
                )

            with col_res2:
                if not df_real.empty and "SalePrice" in df_real.columns:
                    percentile = (df_real["SalePrice"] < prediction).mean() * 100
                    median_price = df_real["SalePrice"].median()
                    diff_median = prediction - median_price
                    sign = "+" if diff_median >= 0 else ""
                    st.metric(
                        "Positionnement marché réel",
                        f"{percentile:.1f}% des maisons",
                        delta=f"{sign}${diff_median:,.0f} vs médiane (${median_price:,.0f})"
                    )

    st.caption(
        "Estimation expérimentale, pas une expertise immobilière."
    )

# ==========================================
# 2. ONGLET : GRAPHIQUES DES VRAIES DONNÉES (PLOTLY)
# ==========================================
with tab_charts:
    st.subheader("📊 Graphiques Interactifs (Plotly) sur les 1 460 Vraies Maisons")
    st.info("💡 Vous pouvez survoler chaque point, zoomer, déplacer ou masquer des séries directement sur le graphique.")

    if not df_real.empty:
        c1, c2 = st.columns(2)
        with c1:
            st.markdown("##### 💰 Distribution réelle des prix de vente")
            fig_dist = create_price_distribution_plot(df_real)
            st.plotly_chart(fig_dist, width="stretch")

        with c2:
            st.markdown("##### 📐 Surface habitable (sq ft) vs Prix réel")
            fig_area = create_area_vs_price_plot(df_real)
            st.plotly_chart(fig_area, width="stretch")

        c3, c4 = st.columns(2)
        with c3:
            st.markdown("##### 🏘️ Dispersion des prix par quartier")
            fig_neigh = create_neighborhood_box_plot(df_real)
            if fig_neigh:
                st.plotly_chart(fig_neigh, width="stretch")

        with c4:
            st.markdown("##### 🔥 Corrélations des variables clés avec SalePrice")
            fig_corr = create_correlation_heatmap(df_real)
            st.plotly_chart(fig_corr, width="stretch")
    else:
        st.warning("Données non chargées. Exécutez `python3 -m src.data_loader`.")

# ==========================================
# 3. ONGLET : PERFORMANCES DU MODÈLE
# ==========================================
with tab_eval:
    st.subheader("📊 Performances Réelles sur le Jeu de Test")

    if METRICS_PATH.exists():
        with open(METRICS_PATH, "r", encoding="utf-8") as f:
            metrics = json.load(f)

        m1, m2, m3 = st.columns(3)
        m1.metric("Score R²", f"{metrics.get('R2', 0):.4f}")
        m2.metric("RMSE", f"${metrics.get('RMSE', 0):,.2f}")
        m3.metric("MAE", f"${metrics.get('MAE', 0):,.2f}")

    if not df_real.empty:
        st.markdown("##### Prix Réels vs Prix Estimés par le modèle")
        fig_perf = create_model_performance_plot(df_real)
        if fig_perf:
            st.plotly_chart(fig_perf, width="stretch")

# ==========================================
# 4. ONGLET : TABLEAU DES DONNÉES
# ==========================================
with tab_data:
    st.subheader("📁 Tableau des Données Réelles")
    if not df_real.empty:
        col_f1, col_f2 = st.columns(2)
        with col_f1:
            all_neigh = sorted(df_real["Neighborhood"].dropna().unique())
            sel_neigh = st.multiselect("Filtrer par quartier", options=all_neigh)
        with col_f2:
            min_p = int(df_real["SalePrice"].min())
            max_p = int(df_real["SalePrice"].max())
            price_slider = st.slider("Plage de prix ($)", min_p, max_p, (min_p, max_p))

        filtered = df_real[
            (df_real["SalePrice"] >= price_slider[0]) &
            (df_real["SalePrice"] <= price_slider[1])
        ]
        if sel_neigh:
            filtered = filtered[filtered["Neighborhood"].isin(sel_neigh)]

        st.write(f"Affichage de **{len(filtered)}** maisons sur **{len(df_real)}** :")
        st.dataframe(filtered, width="stretch")

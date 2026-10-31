import pytest
import plotly.graph_objects as go

from src.data_loader import load_house_data
from src.visualize import (
    create_price_distribution_plot,
    create_area_vs_price_plot,
    create_neighborhood_box_plot,
    create_correlation_heatmap,
    create_model_performance_plot
)


@pytest.fixture(scope="module")
def real_data():
    return load_house_data()


def test_price_distribution_figure(real_data):
    """Vérifie la génération de la figure de distribution des prix."""
    fig = create_price_distribution_plot(real_data)
    assert isinstance(fig, go.Figure)
    assert len(fig.data) > 0


def test_area_vs_price_figure(real_data):
    """Vérifie le nuage de points surface vs prix."""
    fig = create_area_vs_price_plot(real_data)
    assert isinstance(fig, go.Figure)
    assert len(fig.data) > 0


def test_neighborhood_box_figure(real_data):
    """Vérifie les boîtes à moustaches par quartier."""
    fig = create_neighborhood_box_plot(real_data)
    assert isinstance(fig, go.Figure)
    assert len(fig.data) > 0


def test_correlation_heatmap_figure(real_data):
    """Vérifie la heatmap de corrélation."""
    fig = create_correlation_heatmap(real_data)
    assert isinstance(fig, go.Figure)
    assert len(fig.data) > 0


def test_model_performance_figure(real_data):
    """Vérifie le graphique réel vs prédit."""
    fig = create_model_performance_plot(real_data)
    assert isinstance(fig, go.Figure)
    assert len(fig.data) > 0

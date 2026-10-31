import React, { useState, useEffect } from 'react';
import { fetchPlotlyFigure } from '../services/api';
import PlotlyChart from './PlotlyChart';

export default function ChartsTab() {
  const [distFig, setDistFig] = useState(null);
  const [areaFig, setAreaFig] = useState(null);
  const [neighFig, setNeighFig] = useState(null);
  const [corrFig, setCorrFig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFigures() {
      setLoading(true);
      const [dist, area, neigh, corr] = await Promise.all([
        fetchPlotlyFigure('price-distribution'),
        fetchPlotlyFigure('area-vs-price'),
        fetchPlotlyFigure('neighborhoods'),
        fetchPlotlyFigure('correlation')
      ]);
      setDistFig(dist);
      setAreaFig(area);
      setNeighFig(neigh);
      setCorrFig(corr);
      setLoading(false);
    }
    loadFigures();
  }, []);

  return (
    <div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Chargement des graphiques Plotly...
        </div>
      ) : (
        /* Grille 2 en haut et 2 en bas comme dans Streamlit (c1, c2 / c3, c4) */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '24px'
        }}>
          {/* Ligne 1 - Gauche : Distribution des prix */}
          {distFig && (
            <PlotlyChart
              figure={distFig}
              title="Distribution des Prix de Vente (SalePrice)"
              minHeight="400px"
            />
          )}

          {/* Ligne 1 - Droite : Surface vs Prix */}
          {areaFig && (
            <PlotlyChart
              figure={areaFig}
              title="Surface Habitable (GrLivArea) vs Prix Réel de Vente"
              minHeight="400px"
            />
          )}

          {/* Ligne 2 - Gauche : Dispersion des prix par quartier */}
          {neighFig && (
            <PlotlyChart
              figure={neighFig}
              title="Dispersion Réelle des Prix par Quartier (Neighborhood)"
              minHeight="400px"
            />
          )}

          {/* Ligne 2 - Droite : Matrice de corrélation */}
          {corrFig && (
            <PlotlyChart
              figure={corrFig}
              title="Matrice de Corrélation des Variables Clés avec SalePrice"
              minHeight="400px"
            />
          )}
        </div>
      )}
    </div>
  );
}

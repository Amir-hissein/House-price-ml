import React, { useState, useEffect } from 'react';
import { fetchPlotlyFigure } from '../services/api';
import PlotlyChart from './PlotlyChart';
import { useLanguage } from '../context/LanguageContext';

export default function ChartsTab() {
  const { t } = useLanguage();
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
          {t('loadingCharts')}
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
              title={t('chartDistTitle')}
              minHeight="400px"
            />
          )}

          {/* Ligne 1 - Droite : Surface vs Prix */}
          {areaFig && (
            <PlotlyChart
              figure={areaFig}
              title={t('chartAreaTitle')}
              minHeight="400px"
            />
          )}

          {/* Ligne 2 - Gauche : Dispersion des prix par quartier */}
          {neighFig && (
            <PlotlyChart
              figure={neighFig}
              title={t('chartNeighTitle')}
              minHeight="400px"
            />
          )}

          {/* Ligne 2 - Droite : Matrice de corrélation */}
          {corrFig && (
            <PlotlyChart
              figure={corrFig}
              title={t('chartCorrTitle')}
              minHeight="400px"
            />
          )}
        </div>
      )}
    </div>
  );
}

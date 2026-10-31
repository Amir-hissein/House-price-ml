import React, { useState } from 'react';
import { predictPrice } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function PredictorTab() {
  const { t } = useLanguage();
  const [area, setArea] = useState(1500);
  const [quality, setQuality] = useState(6);
  const [garage, setGarage] = useState(2);
  const [basement, setBasement] = useState(800);
  const [bathrooms, setBathrooms] = useState(2);
  const [bedrooms, setBedrooms] = useState(3);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const house = {
        GrLivArea: parseFloat(area) || 1500,
        OverallQual: parseInt(quality, 10) || 6,
        GarageCars: parseInt(garage, 10) || 2,
        TotalBsmtSF: parseFloat(basement) || 800,
        FullBath: parseInt(bathrooms, 10) || 2,
        BedroomAbvGr: parseInt(bedrooms, 10) || 3,
      };
      const res = await predictPrice(house);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 2 colonnes → 1 colonne sur mobile */}
      <div className="predictor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Colonne 1 */}
        <div>
          <div className="st-form-group">
            <label className="st-label">{t('livingArea')}</label>
            <input
              type="number"
              className="st-input"
              min="100"
              max="10000"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>

          <div className="st-form-group">
            <label className="st-label">{t('overallQuality')}</label>
            <div className="st-slider-container">
              <input
                type="range"
                className="st-slider"
                min="1"
                max="10"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
              />
              <span className="st-slider-value">{quality}</span>
            </div>
          </div>

          <div className="st-form-group">
            <label className="st-label">{t('garageCapacity')}</label>
            <input
              type="number"
              className="st-input"
              min="0"
              max="5"
              value={garage}
              onChange={(e) => setGarage(e.target.value)}
            />
          </div>
        </div>

        {/* Colonne 2 */}
        <div>
          <div className="st-form-group">
            <label className="st-label">{t('basementArea')}</label>
            <input
              type="number"
              className="st-input"
              min="0"
              max="5000"
              value={basement}
              onChange={(e) => setBasement(e.target.value)}
            />
          </div>

          <div className="st-form-group">
            <label className="st-label">{t('fullBathrooms')}</label>
            <input
              type="number"
              className="st-input"
              min="0"
              max="5"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
            />
          </div>

          <div className="st-form-group">
            <label className="st-label">{t('bedrooms')}</label>
            <input
              type="number"
              className="st-input"
              min="0"
              max="10"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bouton d'action */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={handlePredict}
          className="st-button-primary"
          disabled={loading}
        >
          {loading ? t('calculating') : t('predictBtn')}
        </button>
      </div>

      {/* Résultat sous forme de carte métrique */}
      {result && (
        <div className="result-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div className="st-metric-card">
            <span className="st-metric-label">{t('estimatedPrice')}</span>
            <span className="st-metric-value">{result.formatted_price}</span>
          </div>

          <div className="st-metric-card">
            <span className="st-metric-label">{t('marketPosition')}</span>
            <span className="st-metric-value">{t('higherThan')} {result.percentile}% {t('ofHouses')}</span>
            <span className="st-metric-delta positive">
              {(result.diff_from_median >= 0 ? '+' : '')}${Math.round(result.diff_from_median).toLocaleString()} {t('vsMedianLabel')}
            </span>
          </div>
        </div>
      )}

      {/* Légende */}
      <p style={{ fontSize: '0.85rem', color: 'var(--text-caption)' }}>
        {t('disclaimer')}
      </p>
    </div>
  );
}

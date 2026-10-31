import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { useLanguage } from '../context/LanguageContext';

export default function PlotlyChart({ figure, title, minHeight = '380px' }) {
  const containerRef = useRef(null);
  const { language, t } = useLanguage();

  const displayTitle = title || (typeof figure?.layout?.title === 'string' ? figure.layout.title : figure?.layout?.title?.text);

  useEffect(() => {
    if (!containerRef.current || !figure || !figure.data) return;

    // Traduction intelligente des axes et annotations selon la langue active
    const translateLabel = (str) => {
      if (!str || typeof str !== 'string') return str;
      const lower = str.toLowerCase();
      if (lower.includes('prix de vente') || lower.includes('sale price') || lower.includes('satış fiyatı')) {
        return t('plotSalePrice');
      }
      if (lower.includes('nombre de maisons') || lower.includes('number of houses') || lower.includes('ev sayısı')) {
        return t('plotHouseCount');
      }
      if (lower.includes('surface habitable') || lower.includes('living area') || lower.includes('yaşam alanı')) {
        return t('plotLivingArea');
      }
      if (lower.includes('qualité') || lower.includes('quality') || lower.includes('kalite')) {
        return t('plotQuality');
      }
      if (lower.includes('sous-sol') || lower.includes('basement') || lower.includes('bodrum')) {
        return t('plotBasement');
      }
      if (lower.includes('quartier') || lower.includes('neighborhood') || lower.includes('mahalle')) {
        return t('plotNeighborhood');
      }
      if (lower.includes('prix réel') || lower.includes('actual price') || lower.includes('gerçek fiyat')) {
        return t('plotActualPrice');
      }
      if (lower.includes('prix prédit') || lower.includes('prix estimé') || lower.includes('predicted price') || lower.includes('tahmin edilen fiyat')) {
        return t('plotPredictedPrice');
      }
      if (lower.includes('erreur') || lower.includes('error') || lower.includes('hata')) {
        return t('plotError');
      }
      return str;
    };

    // Deep clone du layout
    const cleanLayout = JSON.parse(JSON.stringify(figure.layout || {}));
    cleanLayout.title = undefined; // Supprime le titre interne en doublon
    cleanLayout.autosize = true;
    cleanLayout.margin = { t: 15, r: 20, l: 60, b: 55, ...cleanLayout.margin, t: 15 };
    cleanLayout.paper_bgcolor = '#ffffff';
    cleanLayout.plot_bgcolor = '#ffffff';
    cleanLayout.font = {
      family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#262730',
      size: 12
    };

    // Traduction axes
    if (cleanLayout.xaxis) {
      if (typeof cleanLayout.xaxis.title === 'string') {
        cleanLayout.xaxis.title = translateLabel(cleanLayout.xaxis.title);
      } else if (cleanLayout.xaxis.title?.text) {
        cleanLayout.xaxis.title.text = translateLabel(cleanLayout.xaxis.title.text);
      }
    }
    if (cleanLayout.yaxis) {
      if (typeof cleanLayout.yaxis.title === 'string') {
        cleanLayout.yaxis.title = translateLabel(cleanLayout.yaxis.title);
      } else if (cleanLayout.yaxis.title?.text) {
        cleanLayout.yaxis.title.text = translateLabel(cleanLayout.yaxis.title.text);
      }
    }

    // Traduction annotations (ex: Médiane / Moyenne)
    if (Array.isArray(cleanLayout.annotations)) {
      cleanLayout.annotations = cleanLayout.annotations.map(ann => {
        let text = ann.text || '';
        if (text.includes('Médiane') || text.includes('Median') || text.includes('Medyan')) {
          const valMatch = text.match(/\$[\d,]+/);
          text = `${t('plotMedianPrefix')} ${valMatch ? valMatch[0] : ''}`.trim();
        } else if (text.includes('Moyenne') || text.includes('Mean') || text.includes('Ortalama')) {
          const valMatch = text.match(/\$[\d,]+/);
          text = `${t('plotMeanPrefix')} ${valMatch ? valMatch[0] : ''}`.trim();
        }
        return { ...ann, text };
      });
    }

    // Traduction traces / colorbars
    const cleanData = JSON.parse(JSON.stringify(figure.data || [])).map(trace => {
      if (trace.colorbar?.title) {
        if (typeof trace.colorbar.title === 'string') {
          trace.colorbar.title = translateLabel(trace.colorbar.title);
        } else if (trace.colorbar.title.text) {
          trace.colorbar.title.text = translateLabel(trace.colorbar.title.text);
        }
      }
      if (trace.name) {
        trace.name = translateLabel(trace.name);
      }
      return trace;
    });

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['sendDataToCloud', 'hoverClosestCartesian', 'hoverCompareCartesian']
    };

    Plotly.react(containerRef.current, cleanData, cleanLayout, config);

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [figure, language]);

  return (
    <div className="st-card" style={{ marginBottom: '20px' }}>
      {displayTitle && (
        <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-title)', marginBottom: '14px' }}>
          {displayTitle}
        </h3>
      )}
      <div ref={containerRef} style={{ width: '100%', minHeight }} />
    </div>
  );
}

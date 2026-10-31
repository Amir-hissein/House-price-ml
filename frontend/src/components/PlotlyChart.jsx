import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

export default function PlotlyChart({ figure, title, minHeight = '380px' }) {
  const containerRef = useRef(null);

  // Extrait le titre de la figure Plotly si aucun titre HTML explicite n'est passé
  const displayTitle = title || (typeof figure?.layout?.title === 'string' ? figure.layout.title : figure?.layout?.title?.text);

  useEffect(() => {
    if (!containerRef.current || !figure || !figure.data) return;

    // Suppression du titre interne de Plotly pour éviter tout doublon
    const cleanLayout = {
      ...figure.layout,
      title: undefined, // Supprime le titre interne en doublon dans le SVG Plotly
      autosize: true,
      margin: { t: 15, r: 20, l: 60, b: 55, ...figure.layout?.margin, t: 15 },
      paper_bgcolor: '#ffffff',
      plot_bgcolor: '#ffffff',
      font: {
        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#262730',
        size: 12
      }
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['sendDataToCloud', 'hoverClosestCartesian', 'hoverCompareCartesian']
    };

    Plotly.newPlot(containerRef.current, figure.data, cleanLayout, config);

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        Plotly.purge(containerRef.current);
      }
    };
  }, [figure]);

  return (
    <div className="st-card" style={{ marginBottom: '20px' }}>
      {displayTitle && (
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-title)', marginBottom: '14px' }}>
          {displayTitle}
        </h3>
      )}
      <div ref={containerRef} style={{ width: '100%', minHeight }} />
    </div>
  );
}

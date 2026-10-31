import React from 'react';

export default function Header({ apiStatus }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🏠</span> House Price Predictor
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Estime le prix d'une maison avec un modèle de Machine Learning et explore les vraies données.
          </p>
        </div>

        {/* Indicateur simple et discret */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '0.78rem',
          fontWeight: 500,
          backgroundColor: apiStatus === 'healthy' ? '#eaf8ee' : '#fff4e5',
          color: apiStatus === 'healthy' ? '#09ab3b' : '#b7791f',
          border: `1px solid ${apiStatus === 'healthy' ? '#c3ecd0' : '#fbd38d'}`
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: apiStatus === 'healthy' ? '#09ab3b' : '#b7791f'
          }} />
          <span>{apiStatus === 'healthy' ? 'API FastAPI Connectée' : 'Mode Autonome'}</span>
        </div>
      </div>
    </div>
  );
}

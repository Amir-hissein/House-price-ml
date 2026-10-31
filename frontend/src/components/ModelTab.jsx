import React, { useState, useEffect } from 'react';
import { getMetrics, fetchPlotlyFigure } from '../services/api';
import PlotlyChart from './PlotlyChart';

/* ───────────────────────────────────────────────
   Composants internes
─────────────────────────────────────────────── */

function MetricCard({ icon, label, value, sub, delta, deltaPositive }) {
  return (
    <div style={{
      background: '#f0f2f6',
      borderRadius: '8px',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      <span style={{
        fontSize: '0.82rem',
        fontWeight: 500,
        color: '#6b7280',
        marginBottom: '2px'
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '1.9rem',
        fontWeight: 700,
        color: '#262730',
        lineHeight: 1.15,
        letterSpacing: '-0.01em'
      }}>
        {value}
      </span>
      {delta && (
        <span style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: deltaPositive ? '#09ab3b' : '#6b7280',
          marginTop: '2px'
        }}>
          {delta}
        </span>
      )}
      {sub && !delta && (
        <span style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '2px' }}>
          {sub}
        </span>
      )}
    </div>
  );
}

function CoefficientRow({ rank, feature, coef, positive }) {
  const maxAbs = 49420; // Pour normaliser les barres
  const pct = Math.min(100, (Math.abs(coef) / maxAbs) * 100);

  return (
    <tr style={{ borderBottom: '1px solid #f0f2f6' }}>
      <td style={{ padding: '10px 16px', color: '#9ca3af', fontSize: '0.78rem', fontWeight: 600, textAlign: 'center', width: '32px' }}>
        {rank}
      </td>
      <td style={{ padding: '10px 16px', fontWeight: 600, color: '#262730', fontSize: '0.88rem' }}>
        {feature}
      </td>
      <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, fontSize: '0.88rem', color: '#262730' }}>
        {positive ? '+' : ''}{coef.toLocaleString('fr-FR')} $
      </td>
      <td style={{ padding: '10px 24px 10px 8px', width: '180px' }}>
        <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: '#9ca3af',
            borderRadius: '999px',
          }} />
        </div>
      </td>
    </tr>
  );
}

/* ───────────────────────────────────────────────
   Composant principal
─────────────────────────────────────────────── */
export default function ModelTab() {
  const [metrics, setMetrics] = useState(null);
  const [perfFig, setPerfFig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [m, fig] = await Promise.all([
        getMetrics(),
        fetchPlotlyFigure('model-performance')
      ]);
      setMetrics(m);
      setPerfFig(fig);
      setLoading(false);
    }
    load();
  }, []);

  const r2 = metrics?.R2 ?? 0.7992;
  const rmse = metrics?.RMSE ?? 39240.84;
  const mae = metrics?.MAE ?? 25290.76;
  const medAcc = metrics?.Median_Accuracy_pct ?? 88.37;
  const mape = metrics?.MAPE_pct ?? 15.47;



  const coefficients = [
    { rank: 1, feature: 'Surface habitable (GrLivArea)', coef: 49420, positive: true, unit: '/ sq ft' },
    { rank: 2, feature: 'Qualité générale (OverallQual)', coef: 22434, positive: true, unit: '/ point' },
    { rank: 3, feature: 'Surface sous-sol (TotalBsmtSF)', coef: 26.96, positive: true, unit: '/ sq ft' },
    { rank: 4, feature: 'Capacité garage (GarageCars)', coef: 18529, positive: true, unit: '/ véhicule' },
    { rank: 5, feature: 'Salles de bain (FullBath)', coef: 3605, positive: true, unit: '/ salle' },
    { rank: 6, feature: 'Chambres (BedroomAbvGr)', coef: -7277, positive: false, unit: '/ chambre' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── En-tête de section ── */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#262730', margin: 0 }}>
          Performances du modèle de régression linéaire
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#6b7280', margin: '4px 0 0' }}>
          Évaluation sur 1 460 maisons réelles — Jeu de données Ames Housing
        </p>
      </div>

      {/* ── Grille de métriques (5 cartes) ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Chargement des métriques…</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '16px'
        }}>
          <MetricCard
            label="Score R²"
            value={r2.toFixed(4)}
            delta="~80% de variance expliquée"
            deltaPositive={true}
          />
          <MetricCard
            label="Précision médiane"
            value={`${medAcc.toFixed(1)}%`}
            delta="Des prédictions à ±15% du réel"
            deltaPositive={true}
          />
          <MetricCard
            label="MAE ($)"
            value={`$${Math.round(mae).toLocaleString('en-US')}`}
            sub="Erreur absolue moyenne"
          />
          <MetricCard
            label="RMSE ($)"
            value={`$${Math.round(rmse).toLocaleString('en-US')}`}
            sub="Écart-type des erreurs"
          />
          <MetricCard
            label="MAPE (%)"
            value={`${mape.toFixed(1)}%`}
            sub="Erreur relative moyenne"
          />
        </div>
      )}



      {/* ── Graphique Scatter Plotly ── */}
      {perfFig && (
        <PlotlyChart
          figure={perfFig}
          title="Prix Réels vs Prix Estimés par le Modèle — Ligne parfaite y = x"
          minHeight="480px"
        />
      )}

      {/* ── Section coefficients + équation ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>

        {/* Tableau des coefficients */}
        <div style={{ border: '1px solid #e6e9ef', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{
            padding: '12px 16px',
            background: '#f0f2f6',
            borderBottom: '1px solid #e6e9ef'
          }}>
            <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#262730' }}>
              Impact de chaque variable
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>
              Coefficient appris par la régression linéaire
            </p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '8px 16px', color: '#9ca3af', fontWeight: 600, fontSize: '0.72rem', textAlign: 'center' }}>#</th>
                <th style={{ padding: '8px 16px', color: '#9ca3af', fontWeight: 600, fontSize: '0.72rem', textAlign: 'left' }}>VARIABLE</th>
                <th style={{ padding: '8px 16px', color: '#9ca3af', fontWeight: 600, fontSize: '0.72rem', textAlign: 'right' }}>IMPACT</th>
                <th style={{ padding: '8px 24px 8px 8px', color: '#9ca3af', fontWeight: 600, fontSize: '0.72rem' }}>POIDS</th>
              </tr>
            </thead>
            <tbody>
              {coefficients.map(c => (
                <CoefficientRow key={c.rank} {...c} />
              ))}
            </tbody>
          </table>
          <div style={{ padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #f0f2f6', fontSize: '0.75rem', color: '#9ca3af' }}>
            ℹ️ Constante d'interception : <strong>–$77 660</strong>
          </div>
        </div>

        {/* Équation + interprétation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Bloc équation */}
          <div style={{ border: '1px solid #e6e9ef', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{
              padding: '12px 16px',
              background: '#f0f2f6',
              borderBottom: '1px solid #e6e9ef'
            }}>
              <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#262730' }}>
                Équation du modèle
              </h3>
            </div>
            <div style={{ padding: '16px 20px', background: '#fafafa' }}>
              <code style={{
                display: 'block',
                fontFamily: '"SF Mono", Menlo, Monaco, "Cascadia Code", monospace',
                fontSize: '0.82rem',
                lineHeight: '2.0',
                color: '#262730',
                whiteSpace: 'pre'
              }}>
{`Prix  =  -77 660 $
  + 49.42   × GrLivArea
  + 22 434  × OverallQual
  + 18 529  × GarageCars
  + 26.96   × TotalBsmtSF
  +  3 605  × FullBath
  -  7 277  × BedroomAbvGr`}
              </code>
            </div>
          </div>

          {/* Interprétation métier */}
          <div style={{ border: '1px solid #e6e9ef', borderRadius: '8px', padding: '16px 20px', background: '#ffffff' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '0.88rem', fontWeight: 600, color: '#262730' }}>
              Interprétation métier
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { text: '+1 sq ft de surface habitable', impact: '+$49 en moyenne' },
                { text: '+1 point de qualité générale', impact: '+$22 434 en moyenne' },
                { text: '+1 place de garage', impact: '+$18 529 en moyenne' },
                { text: '+1 chambre supplémentaire', impact: '–$7 277 (corrélation négative)' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: '6px',
                  background: '#f0f2f6',
                  border: '1px solid #e6e9ef'
                }}>
                  <span style={{ fontSize: '0.82rem', color: '#374151' }}>{item.text}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#262730' }}>
                    {item.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

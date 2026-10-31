import React, { useState, useEffect } from 'react';
import { getMetrics, fetchPlotlyFigure } from '../services/api';
import PlotlyChart from './PlotlyChart';
import { useLanguage } from '../context/LanguageContext';

/* ───────────────────────────────────────────────
   Composants internes
─────────────────────────────────────────────── */

function MetricCard({ label, value, sub, delta, deltaPositive }) {
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
        {positive ? '+' : ''}{coef.toLocaleString('en-US')} $
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
  const { t, language } = useLanguage();
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
    { rank: 1, feature: t('featGrLivArea'), coef: 49.42, positive: true },
    { rank: 2, feature: t('featOverallQual'), coef: 22434, positive: true },
    { rank: 3, feature: t('featGarageCars'), coef: 18529, positive: true },
    { rank: 4, feature: t('featTotalBsmtSF'), coef: 26.96, positive: true },
    { rank: 5, feature: t('featFullBath'), coef: 3605, positive: true },
    { rank: 6, feature: t('featBedroomAbvGr'), coef: -7277, positive: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── En-tête de section ── */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#262730', margin: 0 }}>
          {t('modelPerfTitle')}
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#6b7280', margin: '4px 0 0' }}>
          {t('modelPerfSubtitle')}
        </p>
      </div>

      {/* ── Grille de métriques (5 cartes) ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>{t('calculating')}</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '16px'
        }}>
          <MetricCard
            label={t('r2Score')}
            value={r2.toFixed(4)}
            delta={t('r2Delta')}
            deltaPositive={true}
          />
          <MetricCard
            label={t('medianAccuracy')}
            value={`${medAcc.toFixed(1)}%`}
            delta={t('medAccDelta')}
            deltaPositive={true}
          />
          <MetricCard
            label={t('maeLabel')}
            value={`$${Math.round(mae).toLocaleString('en-US')}`}
            sub={t('maeSub')}
          />
          <MetricCard
            label={t('rmseLabel')}
            value={`$${Math.round(rmse).toLocaleString('en-US')}`}
            sub={t('rmseSub')}
          />
          <MetricCard
            label={t('mapeLabel')}
            value={`${mape.toFixed(1)}%`}
            sub={t('mapeSub')}
          />
        </div>
      )}

      {/* ── Graphique Scatter Plotly ── */}
      {perfFig && (
        <PlotlyChart
          figure={perfFig}
          title={t('scatterTitle')}
          minHeight="480px"
        />
      )}

      {/* ── Section coefficients + équation ── */}
      <div className="coef-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>

        {/* Tableau des coefficients */}
        <div style={{ border: '1px solid #e6e9ef', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{
            padding: '12px 16px',
            background: '#f0f2f6',
            borderBottom: '1px solid #e6e9ef'
          }}>
            <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#262730' }}>
              {t('featureImpactTitle')}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>
              {t('featureImpactSubtitle')}
            </p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '8px 16px', color: '#9ca3af', fontWeight: 600, fontSize: '0.72rem', textAlign: 'center' }}>{t('colRank')}</th>
                <th style={{ padding: '8px 16px', color: '#9ca3af', fontWeight: 600, fontSize: '0.72rem', textAlign: 'left' }}>{t('colVariable')}</th>
                <th style={{ padding: '8px 16px', color: '#9ca3af', fontWeight: 600, fontSize: '0.72rem', textAlign: 'right' }}>{t('colImpact')}</th>
                <th style={{ padding: '8px 24px 8px 8px', color: '#9ca3af', fontWeight: 600, fontSize: '0.72rem' }}>{t('colWeight')}</th>
              </tr>
            </thead>
            <tbody>
              {coefficients.map(c => (
                <CoefficientRow key={c.rank} {...c} />
              ))}
            </tbody>
          </table>
          <div style={{ padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #f0f2f6', fontSize: '0.75rem', color: '#9ca3af' }}>
            {t('interceptConst')} <strong>{language === 'en' ? '–$77,660' : (language === 'tr' ? '–77.660 $' : '–77 660 $')}</strong>
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
                {t('equationTitle')}
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
{`${t('equationPrice')}  =  ${language === 'en' ? '-$77,660' : (language === 'tr' ? '-77.660 $' : '-77 660 $')}
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
              {t('interpretationTitle')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { text: t('rule1Text'), impact: t('rule1Impact') },
                { text: t('rule2Text'), impact: t('rule2Impact') },
                { text: t('rule3Text'), impact: t('rule3Impact') },
                { text: t('rule4Text'), impact: t('rule4Impact') },
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

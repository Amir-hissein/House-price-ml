import React, { useState, useEffect, useMemo } from 'react';
import { getDataSample, getNeighborhoodsStats } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function DataExplorerTab() {
  const { t } = useLanguage();
  const [data, setData]                       = useState([]);
  const [neighborhoods, setNeighborhoods]     = useState([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('all');
  const [search, setSearch]                   = useState('');
  const [sortKey, setSortKey]                 = useState('Id');
  const [sortAsc, setSortAsc]                 = useState(true);
  const [loading, setLoading]                 = useState(false);

  /* ── Chargement initial (toutes les lignes) ─────────────────────────── */
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [sampleRes, neighRes] = await Promise.all([
        getDataSample(1460),
        getNeighborhoodsStats()
      ]);
      setData(sampleRes);
      setNeighborhoods(neighRes);
      setLoading(false);
    }
    fetchAll();
  }, []);

  /* ── Filtrage + tri ─────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let rows = data.filter(item => {
      const matchesN = selectedNeighborhood === 'all' || item.Neighborhood === selectedNeighborhood;
      const matchesS = search === '' || item.Neighborhood?.toLowerCase().includes(search.toLowerCase());
      return matchesN && matchesS;
    });

    rows = [...rows].sort((a, b) => {
      const va = a[sortKey] ?? 0;
      const vb = b[sortKey] ?? 0;
      if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });

    return rows;
  }, [data, selectedNeighborhood, search, sortKey, sortAsc]);

  /* ── Tri au clic de colonne ─────────────────────────────────────────── */
  function handleSort(key) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  }

  function SortIcon({ col }) {
    if (sortKey !== col) return <span style={{ opacity: 0.25, marginLeft: 4 }}>↕</span>;
    return <span style={{ marginLeft: 4, color: '#1f77b4' }}>{sortAsc ? '↑' : '↓'}</span>;
  }

  const TH = ({ label, col, center }) => (
    <th
      onClick={() => handleSort(col)}
      style={{
        padding: '10px 14px',
        fontWeight: 600,
        fontSize: '0.82rem',
        color: '#262730',
        background: '#f0f2f6',
        position: 'sticky',
        top: 0,
        zIndex: 2,
        cursor: 'pointer',
        userSelect: 'none',
        textAlign: center ? 'center' : 'left',
        borderBottom: '2px solid #d8dde6',
        whiteSpace: 'nowrap',
      }}
    >
      {label}<SortIcon col={col} />
    </th>
  );

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* En-tête */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#262730', margin: 0 }}>
          {t('dataTitle')}
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '4px 0 0' }}>
          {t('dataSubtitle')}
        </p>
      </div>

      {/* Filtres */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
            {t('filterNeighborhood')}
          </label>
          <select
            className="st-input"
            value={selectedNeighborhood}
            onChange={e => { setSelectedNeighborhood(e.target.value); }}
          >
            <option value="all">{t('allNeighborhoods', { count: neighborhoods.length })}</option>
            {neighborhoods.map((n, i) => (
              <option key={i} value={n.neighborhood}>{n.neighborhood}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
            {t('quickSearch')}
          </label>
          <input
            type="text"
            className="st-input"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Barre de stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        background: '#f0f2f6',
        borderRadius: '6px',
        fontSize: '0.83rem',
        color: '#374151',
      }}>
        <span>
          <strong>{filtered.length.toLocaleString()}</strong> {t('rowsDisplayed')}
          {filtered.length < data.length && (
            <span style={{ color: '#6b7280' }}> {t('outOfTotal', { total: data.length.toLocaleString() })}</span>
          )}
        </span>
        {(search || selectedNeighborhood !== 'all') && (
          <button
            onClick={() => { setSearch(''); setSelectedNeighborhood('all'); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.8rem', color: '#6b7280', textDecoration: 'underline',
            }}
          >
            {t('resetFilters')}
          </button>
        )}
      </div>

      {/* ── Tableau avec scroll vertical ─────────────────────────────────── */}
      <div style={{
        border: '1px solid #d8dde6',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        {/* Zone de scroll : hauteur fixe, overflow vertical */}
        <div className="data-table-wrapper" style={{
          maxHeight: '520px',
          overflowY: 'auto',
          overflowX: 'auto',
          /* Scrollbar discrète style Streamlit */
          scrollbarWidth: 'thin',
          scrollbarColor: '#c8cdd6 transparent',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.86rem',
            textAlign: 'left',
          }}>
            <thead>
              <tr>
                <TH label={t('colId')}          col="Id"           />
                <TH label={t('colQuartier')}    col="Neighborhood" />
                <TH label={t('colPrice')}       col="SalePrice"    />
                <TH label={t('colArea')}        col="GrLivArea"    />
                <TH label={t('colQuality')}     col="OverallQual"  center />
                <TH label={t('colGarage')}      col="GarageCars"   center />
                <TH label={t('colBasement')}    col="TotalBsmtSF"  />
                <TH label={t('colBath')}        col="FullBath"     center />
                <TH label={t('colYear')}        col="YearBuilt"    center />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    {t('loadingData')}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    {t('noDataFound')}
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => (
                  <tr
                    key={row.Id ?? idx}
                    style={{
                      borderBottom: '1px solid #f0f2f6',
                      background: idx % 2 === 0 ? '#ffffff' : '#fafbfc',
                    }}
                  >
                    <td style={{ padding: '8px 14px', color: '#9ca3af', fontVariantNumeric: 'tabular-nums' }}>
                      {row.Id ?? idx + 1}
                    </td>
                    <td style={{ padding: '8px 14px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {row.Neighborhood}
                    </td>
                    <td style={{ padding: '8px 14px', fontWeight: 600, color: '#262730', fontVariantNumeric: 'tabular-nums' }}>
                      ${row.SalePrice?.toLocaleString('en-US')}
                    </td>
                    <td style={{ padding: '8px 14px', fontVariantNumeric: 'tabular-nums' }}>
                      {row.GrLivArea?.toLocaleString('en-US')}
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                      {row.OverallQual}/10
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                      {row.GarageCars}
                    </td>
                    <td style={{ padding: '8px 14px', fontVariantNumeric: 'tabular-nums' }}>
                      {row.TotalBsmtSF?.toLocaleString('en-US')}
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                      {row.FullBath}
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'center', color: '#6b7280' }}>
                      {row.YearBuilt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pied de tableau */}
        {!loading && filtered.length > 0 && (
          <div style={{
            padding: '8px 14px',
            background: '#f0f2f6',
            borderTop: '1px solid #d8dde6',
            fontSize: '0.78rem',
            color: '#9ca3af',
            textAlign: 'right',
          }}>
            {filtered.length.toLocaleString()} {t('rowsDisplayed')} · {t('sortedBy')} <strong>{sortKey}</strong> ({sortAsc ? t('ascending') : t('descending')})
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { getDataSample, getNeighborhoodsStats } from '../services/api';

export default function DataExplorerTab() {
  const [data, setData] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [sampleRes, neighRes] = await Promise.all([
        getDataSample(100),
        getNeighborhoodsStats()
      ]);
      setData(sampleRes);
      setNeighborhoods(neighRes);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const filtered = data.filter(item => {
    const matchesN = selectedNeighborhood === 'all' || item.Neighborhood === selectedNeighborhood;
    const matchesS = search === '' || item.Neighborhood?.toLowerCase().includes(search.toLowerCase());
    return matchesN && matchesS;
  });

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-title)', marginBottom: '16px' }}>
        Aperçu du jeu de données (house_prices.csv)
      </h2>

      {/* Filtres simples style Streamlit */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label className="st-label">Filtrer par quartier</label>
          <select
            className="st-input"
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
          >
            <option value="all">Tous les quartiers ({neighborhoods.length})</option>
            {neighborhoods.map((n, i) => (
              <option key={i} value={n.neighborhood}>{n.neighborhood}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="st-label">Recherche rapide</label>
          <input
            type="text"
            className="st-input"
            placeholder="Ex: CollgCr, Veenker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
        Affichage de <strong>{filtered.length}</strong> maisons sur <strong>1 460</strong> :
      </p>

      {/* Tableau clair et propre */}
      <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-title)' }}>ID</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-title)' }}>Quartier</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-title)' }}>Prix Réel ($)</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-title)' }}>Surface (sq ft)</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-title)' }}>Qualité</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-title)' }}>Garage</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-title)' }}>Sous-sol</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-title)' }}>Année</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Chargement des données...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Aucune ligne ne correspond aux filtres.
                </td>
              </tr>
            ) : (
              filtered.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '9px 14px', color: 'var(--text-muted)' }}>{row.Id || idx + 1}</td>
                  <td style={{ padding: '9px 14px', fontWeight: 500 }}>{row.Neighborhood}</td>
                  <td style={{ padding: '9px 14px', fontWeight: 600, color: '#09ab3b' }}>
                    ${row.SalePrice?.toLocaleString()}
                  </td>
                  <td style={{ padding: '9px 14px' }}>{row.GrLivArea}</td>
                  <td style={{ padding: '9px 14px' }}>{row.OverallQual}/10</td>
                  <td style={{ padding: '9px 14px' }}>{row.GarageCars}</td>
                  <td style={{ padding: '9px 14px' }}>{row.TotalBsmtSF}</td>
                  <td style={{ padding: '9px 14px', color: 'var(--text-muted)' }}>{row.YearBuilt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

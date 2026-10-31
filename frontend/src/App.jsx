import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PredictorTab from './components/PredictorTab';
import ChartsTab from './components/ChartsTab';
import ModelTab from './components/ModelTab';
import DataExplorerTab from './components/DataExplorerTab';
import { checkHealth } from './services/api';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('predict');
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    async function verify() {
      const res = await checkHealth();
      setApiStatus(res.status === 'healthy' ? 'healthy' : 'offline');
    }
    verify();
  }, []);

  const tabs = [
    { id: 'predict', label: 'Prédire le prix', icon: '🔮' },
    { id: 'charts', label: 'Graphiques des données', icon: '📈' },
    { id: 'model', label: 'Performances du modèle', icon: '📊' },
    { id: 'data', label: 'Tableau des données', icon: '📁' },
  ];

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '36px 24px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header apiStatus={apiStatus} />

      {/* Onglets horizontaux exactement comme st.tabs dans Streamlit */}
      <nav className="st-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`st-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="st-tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Contenu de l'onglet actif */}
      <main style={{ flex: 1 }}>
        {activeTab === 'predict' && <PredictorTab />}
        {activeTab === 'charts' && <ChartsTab />}
        {activeTab === 'model' && <ModelTab />}
        {activeTab === 'data' && <DataExplorerTab />}
      </main>

      <footer style={{ marginTop: '48px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '0.82rem', color: 'var(--text-caption)', textAlign: 'center' }}>
        Projet Machine Learning House Price — Connecté à FastAPI et Scikit-Learn
      </footer>
    </div>
  );
}

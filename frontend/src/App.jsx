import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PredictorTab from './components/PredictorTab';
import ChartsTab from './components/ChartsTab';
import ModelTab from './components/ModelTab';
import DataExplorerTab from './components/DataExplorerTab';
import { checkHealth } from './services/api';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import './index.css';

/* ── Icônes SVG professionnelles ────────────────────────────────────────── */
const IconPredict = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);
const IconCharts = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconModel = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconData = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/>
  </svg>
);

function MainContent() {
  const [activeTab, setActiveTab] = useState('predict');
  const { t } = useLanguage();

  const tabs = [
    { id: 'predict', label: t('tabPredict'), Icon: IconPredict },
    { id: 'charts',  label: t('tabCharts'),  Icon: IconCharts  },
    { id: 'model',   label: t('tabModel'),   Icon: IconModel   },
    { id: 'data',    label: t('tabData'),    Icon: IconData    },
  ];

  return (
    <div className="app-wrapper" style={{ maxWidth: '1360px', margin: '0 auto', padding: '36px 24px', minHeight: '100vh' }}>
      <Header />

      {/* Onglets */}
      <nav className="st-tabs">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`st-tab ${activeTab === id ? 'active' : ''}`}
          >
            <span className="st-tab-icon"><Icon /></span>
            <span className="st-tab-label">{label}</span>
          </button>
        ))}
      </nav>

      {/* Contenu */}
      <main>
        {activeTab === 'predict' && <PredictorTab />}
        {activeTab === 'charts'  && <ChartsTab />}
        {activeTab === 'model'   && <ModelTab />}
        {activeTab === 'data'    && <DataExplorerTab />}
      </main>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    checkHealth().catch(() => {});
  }, []);

  return (
    <LanguageProvider>
      <MainContent />
    </LanguageProvider>
  );
}

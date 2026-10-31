import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const IconHouse = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#262730" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
    <polyline points="9 21 9 12 15 12 15 21"/>
  </svg>
);

const languages = [
  { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'Français' },
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'tr', label: 'TR', flag: '🇹🇷', name: 'Türkçe' },
];

export default function Header() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="app-header" style={{ marginBottom: '28px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Logo & Titre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="app-header-icon" style={{
            width: '48px', height: '48px',
            background: '#f0f2f6',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <IconHouse />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#262730', margin: 0, lineHeight: 1.2 }}>
              {t('appTitle')}
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#6b7280', margin: '4px 0 0' }}>
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Bouton de sélection de langue (FR / EN / TR) */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#f0f2f6',
          borderRadius: '20px',
          padding: '3px',
          border: '1px solid #e6e9ef'
        }}>
          {languages.map((l) => {
            const active = language === l.code;
            return (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                title={l.name}
                style={{
                  background: active ? '#ffffff' : 'transparent',
                  color: active ? '#ff4b4b' : '#6b7280',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.82rem',
                  border: active ? '1px solid #d8dde6' : '1px solid transparent',
                  borderRadius: '16px',
                  padding: '5px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

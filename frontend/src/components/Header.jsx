import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const IconHouse = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#262730" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
    <polyline points="9 21 9 12 15 12 15 21"/>
  </svg>
);

const IconGlobe = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

export default function Header() {
  const { language, setLanguage, t, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  // Fermer la petite fenêtre si on clique en dehors ou appuie sur Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="app-header" style={{ marginBottom: '28px', position: 'relative' }}>
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

        {/* Bouton ouvrant la "petite fenêtre" de changement de langue */}
        <div style={{ position: 'relative' }} ref={popoverRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: isOpen ? '#ffffff' : '#f0f2f6',
              border: '1px solid',
              borderColor: isOpen ? '#ff4b4b' : '#d8dde6',
              borderRadius: '24px',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#262730',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: isOpen ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <span style={{ color: '#ff4b4b', display: 'flex' }}><IconGlobe /></span>
            <span style={{ fontSize: '1rem' }}>{currentLang.flag}</span>
            <span>{currentLang.label}</span>
            <span style={{ fontSize: '0.72rem', color: '#6b7280', marginLeft: '2px' }}>
              {isOpen ? '▲' : '▼'}
            </span>
          </button>

          {/* ── La petite fenêtre (Modal / Popover flottante) ── */}
          {isOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '280px',
              background: '#ffffff',
              border: '1px solid #e6e9ef',
              borderRadius: '12px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)',
              padding: '14px',
              zIndex: 1000,
              animation: 'fadeIn 0.15s ease-out'
            }}>
              {/* En-tête de la petite fenêtre */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                paddingBottom: '10px',
                marginBottom: '10px',
                borderBottom: '1px solid #f0f2f6'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#262730' }}>
                    {t('languageModalTitle')}
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#808495' }}>
                    {t('languageModalSubtitle')}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: '#9ca3af',
                    padding: '2px 6px',
                    lineHeight: 1
                  }}
                  title="Fermer"
                >
                  ✕
                </button>
              </div>

              {/* Liste des langues */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {languages.map((l) => {
                  const isSelected = language === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setIsOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: isSelected ? '#f0f4ff' : 'transparent',
                        border: isSelected ? '1px solid #c7d2fe' : '1px solid transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>{l.flag}</span>
                        <div>
                          <div style={{
                            fontSize: '0.88rem',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#1e40af' : '#262730'
                          }}>
                            {l.label}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                            {l.sub}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <span style={{
                          color: '#2563eb',
                          fontWeight: 700,
                          fontSize: '1rem'
                        }}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

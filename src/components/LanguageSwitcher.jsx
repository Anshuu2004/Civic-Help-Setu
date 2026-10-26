import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { FALLBACK_NOTE, getLanguageAnnouncement, getUiCoverage } from '../utils/translationCoverage';

const LanguageSwitcher = ({ variant = 'default', defaultOpen = false }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [announcement, setAnnouncement] = useState('');
  const containerRef = useRef(null);

  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <span
        role="status"
        aria-live="polite"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}
      >
        {announcement}
      </span>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Select interface language. Currently ${activeLang.native} (${activeLang.label})`}
        aria-expanded={isOpen}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: variant === 'mobile' ? '0.55rem 0.95rem' : '0.4rem 0.85rem',
          borderRadius: '99px',
          background: 'var(--glass-bg)',
          border: isOpen ? '1px solid var(--accent-main)' : '1px solid var(--border-light)',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <Globe size={16} color="var(--accent-main)" />
        <span>{activeLang.native}</span>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '0.1rem 0.35rem',
            borderRadius: '4px',
            background: 'rgba(56, 189, 248, 0.15)',
            color: 'var(--accent-main)',
            fontWeight: '700',
          }}
        >
          {activeLang.badge}
        </span>
      </button>

      {isOpen && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 1000,
            width: 'min(300px, calc(100vw - 2rem))',
            padding: '0.5rem',
            borderRadius: '0.75rem',
            background: 'var(--bg-card, var(--bg-secondary))',
            border: '1px solid var(--border-main)',
            boxShadow: 'var(--shadow-lg, 0 10px 25px -5px rgba(0,0,0,0.5))',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <div style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.5px' }}>
            Choose Language / भाषा चुनें
          </div>
          {SUPPORTED_LANGUAGES.map((l) => {
            const isSelected = l.code === language;
            const coverage = getUiCoverage(l.code);
            return (
              <button
                key={l.code}
                type="button"
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => {
                  setLanguage(l.code);
                  setAnnouncement(getLanguageAnnouncement(l, coverage));
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.5rem 0.65rem',
                  borderRadius: '0.45rem',
                  border: 'none',
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: isSelected ? 'var(--accent-main)' : 'var(--text-primary)',
                  fontWeight: isSelected ? '700' : '500',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseOver={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseOut={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', minWidth: 0, overflowWrap: 'anywhere' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span>{l.native}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>({l.label})</span>
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '500', color: 'var(--text-tertiary)' }}>
                    {coverage.isComplete
                      ? 'Interface fully translated'
                      : `Interface partly translated (${coverage.translated} of ${coverage.total} labels)`}
                  </span>
                </div>
                {isSelected && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                    <Check size={14} color="var(--accent-main)" aria-hidden="true" /> Active
                  </span>
                )}
              </button>
            );
          })}
          <div
            style={{
              margin: '0.25rem 0.25rem 0',
              padding: '0.5rem 0.6rem',
              borderTop: '1px solid var(--border-light)',
              fontSize: '0.72rem',
              lineHeight: 1.45,
              color: 'var(--text-secondary)',
              overflowWrap: 'anywhere',
            }}
          >
            {FALLBACK_NOTE}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

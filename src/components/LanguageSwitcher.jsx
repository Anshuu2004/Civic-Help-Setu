import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';

const LanguageSwitcher = ({ variant = 'default' }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
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
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Select interface language. Currently ${activeLang.native}`}
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
            minWidth: '180px',
            padding: '0.5rem',
            borderRadius: '0.75rem',
            background: 'var(--bg-card, #131b2e)',
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
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLanguage(l.code);
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{l.native}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>({l.label})</span>
                </div>
                {isSelected && <Check size={14} color="var(--accent-main)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

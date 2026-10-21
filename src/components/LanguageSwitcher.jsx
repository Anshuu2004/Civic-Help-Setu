import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = ({ variant = 'default' }) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={`Switch language to ${language === 'en' ? 'Hindi' : 'English'}`}
      title={`Current: ${language === 'en' ? 'English' : 'हिन्दी'}. Click to switch.`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: variant === 'mobile' ? '0.5rem 0.85rem' : '0.35rem 0.75rem',
        borderRadius: '99px',
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-light)',
        color: 'var(--text-primary)',
        fontSize: '0.85rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-main)';
        e.currentTarget.style.background = 'var(--glass-bg-hover)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-light)';
        e.currentTarget.style.background = 'var(--glass-bg)';
      }}
    >
      <Globe size={15} color="var(--accent-main)" />
      <span>{language === 'en' ? 'EN' : 'हिन्दी'}</span>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
        {language === 'en' ? 'हिं' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;

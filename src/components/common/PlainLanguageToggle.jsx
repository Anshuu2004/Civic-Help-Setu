import { useState } from 'react';
import { BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import CivicGlossaryModal from './CivicGlossaryModal';

const PlainLanguageToggle = () => {
  const { isPlainLanguage, togglePlainLanguage, language } = useLanguage();
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  return (
    <>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={togglePlainLanguage}
          title={isPlainLanguage ? 'Disable plain language simplified summaries' : 'Enable plain language citizen simplified explanations'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '99px',
            background: isPlainLanguage ? 'rgba(56, 189, 248, 0.2)' : 'var(--glass-bg)',
            border: isPlainLanguage ? '1px solid var(--accent-main)' : '1px solid var(--border-light)',
            color: isPlainLanguage ? 'var(--accent-main)' : 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: isPlainLanguage ? '700' : '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Sparkles size={14} color="var(--accent-main)" />
          <span>{isPlainLanguage ? 'Plain Language: ON' : 'Plain Language'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsGlossaryOpen(true)}
          title="Open Civic Terms & Jargon Dictionary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.65rem',
            borderRadius: '99px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <BookOpen size={14} color="var(--accent-main)" />
          <span>Civic Dictionary</span>
        </button>
      </div>

      <CivicGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />
    </>
  );
};

export default PlainLanguageToggle;

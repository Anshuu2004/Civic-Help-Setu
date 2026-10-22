import { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const PlainLanguageTooltip = ({
  term,
  definition,
  definitionHi,
  definitionBn,
  definitionTa,
  children,
}) => {
  const { language, isPlainLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Pick definition based on current language
  let activeDef = definition;
  if (language === 'hi' && definitionHi) activeDef = definitionHi;
  else if (language === 'bn' && definitionBn) activeDef = definitionBn;
  else if (language === 'ta' && definitionTa) activeDef = definitionTa;

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'baseline',
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <span
        style={{
          borderBottom: isPlainLanguage ? '2px dashed var(--accent-main)' : '1px dotted var(--text-tertiary)',
          color: isPlainLanguage ? 'var(--accent-main)' : 'inherit',
          fontWeight: isPlainLanguage ? '600' : 'inherit',
          cursor: 'help',
        }}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {children || term}
      </span>

      {isOpen && (
        <span
          className="animate-fade-in"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1050,
            width: '260px',
            padding: '0.65rem 0.85rem',
            borderRadius: '0.6rem',
            background: 'var(--bg-card, #131b2e)',
            border: '1px solid var(--accent-main)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.6)',
            fontSize: '0.78rem',
            lineHeight: '1.4',
            color: 'var(--text-primary)',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontWeight: '700',
              color: 'var(--accent-main)',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
            }}
          >
            <Info size={12} /> Plain Language Explanation:
          </span>
          <span style={{ display: 'block', color: 'var(--text-secondary)' }}>
            {activeDef || definition}
          </span>
        </span>
      )}
    </span>
  );
};

export default PlainLanguageTooltip;

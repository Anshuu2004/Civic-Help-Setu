import { useLanguage } from '../../context/LanguageContext';
import { isServiceContentTranslated } from '../../utils/translationCoverage';

// Small label for service content (names, steps, fees, official text) that
// has no translation, so a translated interface is not mistaken for a
// translated guide. Renders nothing in English.
const UntranslatedBadge = () => {
  const { language } = useLanguage();
  if (isServiceContentTranslated(language)) return null;

  return (
    <span
      className="untranslated-badge"
      title="This service content has not been translated. It is shown in English."
      style={{
        display: 'inline-block',
        marginBottom: '0.75rem',
        padding: '0.15rem 0.55rem',
        borderRadius: '99px',
        border: '1px dashed var(--border-main)',
        background: 'var(--glass-bg)',
        color: 'var(--text-secondary)',
        fontSize: '0.75rem',
        fontWeight: '600',
      }}
    >
      English only, not translated
    </span>
  );
};

export default UntranslatedBadge;

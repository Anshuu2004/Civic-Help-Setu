import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="container pt-20 pb-24" style={{ textAlign: 'center', maxWidth: '40rem' }}>
      <p style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--accent-main)', margin: 0 }} aria-hidden="true">
        404
      </p>
      <h1 className="text-4xl font-bold mb-4">{t('notFound.title')}</h1>
      <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
        {t('notFound.message')}
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn-primary">{t('notFound.home')}</Link>
        <Link to="/services" className="btn">{t('notFound.services')}</Link>
      </div>
    </div>
  );
};

export default NotFound;

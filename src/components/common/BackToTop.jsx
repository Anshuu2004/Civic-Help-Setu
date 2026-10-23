import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const SHOW_AFTER = 300;

const BackToTop = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      className="back-to-top"
      onClick={handleClick}
      aria-label={t('common.backToTop')}
      title={t('common.backToTop')}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
};

export default BackToTop;

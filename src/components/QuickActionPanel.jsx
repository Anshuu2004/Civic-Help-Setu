import { Link } from 'react-router-dom';
import { Search, ClipboardCheck, MapPin, Activity, Bookmark, FolderLock, ArrowRight } from 'lucide-react';
import { QUICK_ACTIONS } from '../utils/quickActions';

const ICONS = {
  'find-service': Search,
  'check-eligibility': ClipboardCheck,
  'locate-office': MapPin,
  'track-application': Activity,
  'continue-saved': Bookmark,
  'keep-documents': FolderLock,
};

const QuickActionPanel = ({ actions = QUICK_ACTIONS }) => (
  <section className="section quick-actions" aria-labelledby="quick-actions-title">
    <div className="container">
      <h2 id="quick-actions-title" className="quick-actions__title">What would you like to do?</h2>
      <ul className="quick-actions__list">
        {actions.map((action) => {
          const Icon = ICONS[action.id] || ArrowRight;
          return (
            <li key={action.id}>
              <Link to={action.to} className="quick-action">
                <span className="quick-action__icon" aria-hidden="true"><Icon size={22} /></span>
                <span className="quick-action__text">
                  <span className="quick-action__label">{action.label}</span>
                  <span className="quick-action__hint">{action.hint}</span>
                </span>
                <ArrowRight size={18} className="quick-action__arrow" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);

export default QuickActionPanel;

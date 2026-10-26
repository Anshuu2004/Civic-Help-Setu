import { Scale, X, ArrowRight } from 'lucide-react';
import { MAX_COMPARE_LIMIT } from '../../services/comparisonService';

const ComparisonFloatingTray = ({ comparedServices, onOpenModal, onClear, onRemove }) => {
  if (!comparedServices || comparedServices.length === 0) return null;

  return (
    <section className="compare-tray" aria-label="Services selected for comparison">
      <Scale size={18} aria-hidden="true" className="compare-tray-icon" />
      <ul className="compare-tray-chips">
        {comparedServices.map((service) => (
          <li key={service.id}>
            <span>{service.name}</span>
            <button
              type="button"
              onClick={() => onRemove(service.id)}
              aria-label={`Remove ${service.name} from comparison`}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <div className="compare-tray-actions">
        <button type="button" className="compare-link-btn" onClick={onClear}>
          Clear all
        </button>
        <button type="button" className="btn btn-primary" onClick={onOpenModal}>
          Compare ({comparedServices.length}/{MAX_COMPARE_LIMIT}) <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};

export default ComparisonFloatingTray;

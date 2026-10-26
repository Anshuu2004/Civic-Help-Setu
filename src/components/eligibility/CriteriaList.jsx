import { CheckCircle2, XCircle, CircleHelp, ClipboardCheck, PencilLine } from 'lucide-react';
import { CRITERION_STATE_LABELS, summarizeCriteria } from '../../services/eligibilityCriteria';

// Each state has its own icon shape and a text label, so colour is only a hint.
const STATE_STYLES = {
  satisfied: { icon: CheckCircle2, color: 'var(--success, #10b981)', border: 'rgba(16, 185, 129, 0.35)' },
  missing: { icon: XCircle, color: 'var(--error, #ef4444)', border: 'rgba(239, 68, 68, 0.35)' },
  unknown: { icon: CircleHelp, color: 'var(--text-secondary)', border: 'var(--border-main)' },
  confirm: { icon: ClipboardCheck, color: 'var(--warning, #f59e0b)', border: 'rgba(245, 158, 11, 0.35)' },
};

const CriteriaList = ({ schemeId, schemeName, criteria = [], onReview }) => {
  const counts = summarizeCriteria(criteria);
  const summary = ['satisfied', 'missing', 'unknown', 'confirm']
    .filter((state) => counts[state] > 0)
    .map((state) => `${counts[state]} ${CRITERION_STATE_LABELS[state].toLowerCase()}`)
    .join(', ');
  const headingId = `criteria-${schemeId}`;

  return (
    <section aria-labelledby={headingId} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <h4 id={headingId} style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
        Requirements checked against your answers
        <span className="sr-only"> for {schemeName}</span>
        <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}> ({summary})</span>
      </h4>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {criteria.map((c) => {
          const style = STATE_STYLES[c.state] || STATE_STYLES.unknown;
          const Icon = style.icon;
          return (
            <li
              key={c.id}
              data-state={c.state}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem 0.75rem',
                padding: '0.6rem 0.8rem',
                borderRadius: '0.6rem',
                borderLeft: `4px ${c.state === 'unknown' ? 'dashed' : 'solid'} ${style.border}`,
                background: 'var(--glass-bg-subtle)',
              }}
            >
              <div style={{ display: 'flex', gap: '0.6rem', flex: '1 1 14rem', minWidth: 0 }}>
                <Icon size={18} color={style.color} aria-hidden="true" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-primary)' }}>
                    {CRITERION_STATE_LABELS[c.state]}
                    <span className="sr-only">:</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>{c.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>{c.detail}</div>
                </div>
              </div>

              {c.state !== 'satisfied' && c.field && onReview && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onReview(c)}
                  aria-label={`Review answers for ${c.label}`}
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem', gap: '0.35rem' }}
                >
                  <PencilLine size={13} aria-hidden="true" />
                  <span>Review answers</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default CriteriaList;

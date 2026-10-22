import { AlertTriangle, Clock, Calendar, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExpiringDocumentsAlert = ({
  expiringList = [],
}) => {
  if (expiringList.length === 0) return null;

  return (
    <div
      className="animate-fade-in"
      style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '1rem',
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        marginBottom: '2rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.5rem', borderRadius: '0.5rem' }}>
          <AlertTriangle size={22} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ color: '#f59e0b', fontWeight: '800', margin: 0, fontSize: '1.05rem' }}>
              Credential Expiration Alerts ({expiringList.length})
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Avoid statutory service rejections
            </span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0.85rem' }}>
            The following stored documents require renewal or re-validation to prevent delays in government filings:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {expiringList.map(({ doc, daysLeft, status }) => {
              const isExpired = status === 'expired';
              return (
                <div
                  key={doc.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.6rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {doc.type}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '99px',
                        background: isExpired ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: isExpired ? '#ef4444' : '#f59e0b',
                        fontWeight: '700',
                      }}
                    >
                      {isExpired ? 'EXPIRED' : `${daysLeft} days left`}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    No: <span style={{ fontFamily: 'monospace' }}>{doc.number}</span> • Exp: {doc.expiryDate}
                  </div>

                  {doc.type.toLowerCase().includes('driving') && (
                    <Link
                      to="/services/driving-license"
                      style={{
                        marginTop: '0.25rem',
                        fontSize: '0.75rem',
                        color: 'var(--accent-main)',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        textDecoration: 'none',
                      }}
                    >
                      <span>Renew on Parivahan</span>
                      <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpiringDocumentsAlert;

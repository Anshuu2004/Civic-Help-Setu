import { STATUS_META, getStatusMeta } from '../../services/trackingService';
import { Activity, Clock, AlertTriangle, CheckCircle, Plus, FileText } from 'lucide-react';

const ActiveApplicationsSummaryGrid = ({
  metrics,
  applications = [],
  selectedId,
  onSelectApplication = () => {},
  onOpenAddModal = () => {},
}) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Top Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div
          className="card"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            borderLeft: '4px solid var(--accent-main)',
          }}
        >
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-main)', padding: '0.6rem', borderRadius: '0.5rem' }}>
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', lineHeight: 1 }}>{metrics.total}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Total Tracked</div>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            borderLeft: `4px solid ${STATUS_META.submitted.color}`,
          }}
        >
          <div style={{ background: STATUS_META.submitted.background, color: STATUS_META.submitted.color, padding: '0.6rem', borderRadius: '0.5rem' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', lineHeight: 1 }}>{metrics.submitted}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{STATUS_META.submitted.label}</div>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            borderLeft: '4px solid #38bdf8',
          }}
        >
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.6rem', borderRadius: '0.5rem' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', lineHeight: 1 }}>{metrics.inProgress}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{STATUS_META['in-progress'].label}</div>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            borderLeft: '4px solid #ef4444',
          }}
        >
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.6rem', borderRadius: '0.5rem' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', lineHeight: 1, color: metrics.actionRequired > 0 ? '#ef4444' : 'inherit' }}>
              {metrics.actionRequired}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{STATUS_META['action-required'].label}</div>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            borderLeft: '4px solid #10b981',
          }}
        >
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.6rem', borderRadius: '0.5rem' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', lineHeight: 1, color: '#10b981' }}>{metrics.completed}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{STATUS_META.completed.label}</div>
          </div>
        </div>
      </div>

      {/* Quick Selection Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '0.6rem 0.85rem',
          borderRadius: '0.6rem',
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-light)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', maxWidth: '100%' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
            Quick Select:
          </span>
          {applications.map((app) => {
            const isSelected = selectedId?.toUpperCase() === app.id.toUpperCase();
            const isActionReq = app.status === 'action-required';
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => onSelectApplication(app)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '99px',
                  border: isSelected ? '1px solid var(--accent-main)' : '1px solid var(--border-light)',
                  background: isSelected
                    ? 'rgba(56, 189, 248, 0.2)'
                    : isActionReq
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'var(--bg-main)',
                  color: isSelected
                    ? 'var(--accent-main)'
                    : isActionReq
                    ? '#ef4444'
                    : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                {app.id} • {app.serviceName} ({getStatusMeta(app.status).label})
                {isActionReq && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      display: 'inline-block',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="btn btn-primary"
          style={{
            padding: '0.35rem 0.85rem',
            fontSize: '0.8rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={14} /> Add Application
        </button>
      </div>
    </div>
  );
};

export default ActiveApplicationsSummaryGrid;

import { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Trash2, Edit3 } from 'lucide-react';

const ReportResolutionModal = ({ report, isOpen, onClose, onResolve, onDismiss, onEditService }) => {
  const [resolutionNotes, setResolutionNotes] = useState('Reviewed portal guidelines and corrected information.');

  if (!isOpen || !report) return null;

  const handleResolve = () => {
    onResolve(report.id, resolutionNotes);
    onClose();
  };

  const handleDismiss = () => {
    onDismiss(report.id);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-main)',
          position: 'relative',
          padding: '2rem',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'var(--glass-bg)',
            border: 'none',
            color: 'var(--text-secondary)',
            padding: '0.5rem',
            borderRadius: '50%',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--warning, #f59e0b)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Moderation Queue
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.2rem' }}>
            Review Error Report
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Reported by: <strong>{report.reporterEmail}</strong> ({report.createdAt})
          </p>
        </div>

        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--glass-bg)',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-light)',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Target Service</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-main)' }}>{report.serviceName}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Issue Type</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>{report.issueType}</span>
          </div>

          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>Citizen Comment</span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.5' }}>
              "{report.description}"
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Resolution Log Note
          </label>
          <input
            type="text"
            className="input-field"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            style={{ padding: '0.65rem 0.85rem', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleDismiss}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}
          >
            <Trash2 size={15} /> Dismiss
          </button>

          {onEditService && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditService(report.serviceId);
              }}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem' }}
            >
              <Edit3 size={15} /> Edit Guide
            </button>
          )}

          <button
            type="button"
            onClick={handleResolve}
            className="btn btn-primary"
            style={{ flex: 1.2, padding: '0.65rem', fontSize: '0.85rem' }}
          >
            <CheckCircle2 size={15} /> Mark Resolved
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportResolutionModal;

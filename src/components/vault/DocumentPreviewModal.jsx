import { X, ShieldCheck, Calendar, Trash2, Building, Hash, FileText } from 'lucide-react';
import FilePreviewPanel from './FilePreviewPanel';
import { getExpiryStatus } from '../../services/vaultStorage';

const DocumentPreviewModal = ({ doc, isOpen, onClose, onDelete }) => {
  if (!isOpen || !doc) return null;

  const expiryStatus = getExpiryStatus(doc.expiryDate);

  const getExpiryBadge = () => {
    if (expiryStatus === 'expired') {
      return (
        <span style={{ padding: '0.2rem 0.65rem', borderRadius: '99px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--error, #ef4444)', fontSize: '0.75rem', fontWeight: '700' }}>
          EXPIRED
        </span>
      );
    }
    if (expiryStatus === 'expiring-soon') {
      return (
        <span style={{ padding: '0.2rem 0.65rem', borderRadius: '99px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning, #f59e0b)', fontSize: '0.75rem', fontWeight: '700' }}>
          EXPIRING SOON
        </span>
      );
    }
    if (expiryStatus === 'active') {
      return (
        <span style={{ padding: '0.2rem 0.65rem', borderRadius: '99px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success, #10b981)', fontSize: '0.75rem', fontWeight: '700' }}>
          ACTIVE
        </span>
      );
    }
    return null;
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
          aria-label="Close modal"
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '0.75rem',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={26} color="var(--accent-main)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{doc.type}</h2>
              {getExpiryBadge()}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Category: {doc.category || 'Identity'}
            </p>
          </div>
        </div>

        <div
          style={{
            background: 'var(--glass-bg-subtle)',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-light)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Hash size={14} /> Document Number
            </span>
            <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>
              {doc.number}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Building size={14} /> Issuing Authority
            </span>
            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {doc.issuer || 'Govt. Authority'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} /> Verification Status
            </span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: doc.verified ? 'var(--success, #10b981)' : 'var(--text-tertiary)',
              }}
            >
              {doc.verified ? 'Government Authenticated' : 'Self-declared / Pending'}
            </span>
          </div>

          {doc.expiryDate && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} /> Expiration Date
              </span>
              <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {doc.expiryDate}
              </span>
            </div>
          )}

        </div>

        <FilePreviewPanel doc={doc} />

        {doc.notes && (
          <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.75rem', background: 'var(--glass-bg)', borderRadius: '0.5rem' }}>
            <strong>Notes:</strong> {doc.notes}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${doc.type}?`)) {
                onDelete(doc.id);
                onClose();
              }
            }}
            className="btn"
            style={{
              padding: '0.65rem 1rem',
              fontSize: '0.875rem',
              color: 'var(--error, #ef4444)',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <Trash2 size={16} /> Delete Document
          </button>

        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;

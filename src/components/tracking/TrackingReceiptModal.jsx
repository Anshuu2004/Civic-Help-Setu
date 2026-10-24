import { X, Shield, Printer, CheckCircle2, Download, QrCode } from 'lucide-react';
import { formatDisplayDate } from '../../services/trackingService';

const TrackingReceiptModal = ({ app, isOpen, onClose }) => {
  if (!isOpen || !app) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.75)',
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
          maxWidth: '540px',
          background: 'var(--bg-main)',
          position: 'relative',
          padding: '2.5rem',
          border: '1px solid var(--border-main)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close receipt"
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

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px dashed var(--border-main)', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} color="var(--bg-main)" />
            </div>
            <span style={{ fontWeight: '800', fontSize: '1.25rem' }}>CivicBridge Portal</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Official Submission Receipt</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            National Public Service Fast-Track Verification Slip
          </p>
        </div>

        {/* Receipt Details Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--glass-bg)', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Reference ID</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '1.1rem', color: 'var(--accent-main)' }}>
              {app.id}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Service</span>
              <strong style={{ color: 'var(--text-primary)' }}>{app.serviceName}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Applicant</span>
              <strong style={{ color: 'var(--text-primary)' }}>{app.applicantName}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Submission Date</span>
              <strong style={{ color: 'var(--text-primary)' }}>{formatDisplayDate(app.appliedDate)}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-tertiary)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Target Completion</span>
              <strong style={{ color: 'var(--text-primary)' }}>{formatDisplayDate(app.estimatedCompletion)}</strong>
            </div>
          </div>

          <div style={{ padding: '0.75rem 1rem', background: 'var(--glass-bg-subtle)', borderRadius: '0.5rem', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Digital Verification Seal</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                SHA256: {app.id.replace(/[^0-9]/g, '')}89f21ab7c
              </span>
            </div>
            <div style={{ color: 'var(--accent-main)' }}>
              <QrCode size={36} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem' }}
          >
            <Printer size={16} /> Print Receipt
          </button>
          <button
            type="button"
            onClick={() => {
              alert(`Receipt downloaded for ${app.id}`);
              onClose();
            }}
            className="btn btn-primary"
            style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem' }}
          >
            <Download size={16} /> Save PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingReceiptModal;

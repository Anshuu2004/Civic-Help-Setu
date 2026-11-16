import { useState } from 'react';
import {
  X,
  Search,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { trackReportByToken } from '../../services/streetlightService';
import {
  REPORT_STATUS_LABELS,
  FAULT_CATEGORY_LABELS,
} from '../../services/streetlightConstants';

export default function StreetlightTrackModal({ onClose }) {
  const [tokenInput, setTokenInput] = useState('');
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError('Please enter a tracking token.');
      return;
    }

    setError('');
    setIsSearching(true);
    try {
      const res = trackReportByToken(tokenInput.trim());
      setReport(res);
    } catch (err) {
      setReport(null);
      setError(err?.message || 'Report not found for this token.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="track-modal-title"
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'var(--bg-primary, #ffffff)',
          borderRadius: '0.85rem',
          padding: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-main, #e2e8f0)',
            paddingBottom: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={18} style={{ color: '#2563eb' }} aria-hidden="true" />
            <h2 id="track-modal-title" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              Track Streetlight Repair Status
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.35rem', borderRadius: '50%' }}
            aria-label="Close modal"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSearch} style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="e.g. TRK-STLT-789123"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              style={{
                flex: 1,
                padding: '0.45rem 0.75rem',
                borderRadius: '0.4rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                fontFamily: 'monospace',
              }}
              aria-label="Tracking Token"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="btn btn-primary btn-sm"
              style={{ background: '#2563eb', padding: '0 1rem' }}
            >
              {isSearching ? 'Checking...' : 'Lookup'}
            </button>
          </div>
        </form>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: '0.4rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <AlertCircle size={16} aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {report && (
          <div
            style={{
              background: 'var(--bg-secondary, #f8fafc)',
              border: '1px solid var(--border-main, #e2e8f0)',
              borderRadius: '0.5rem',
              padding: '1rem',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>
                {report.trackingToken}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  background: report.status === 'resolved' ? '#ecfdf5' : '#eff6ff',
                  color: report.status === 'resolved' ? '#065f46' : '#1e40af',
                }}
              >
                {REPORT_STATUS_LABELS[report.status] || report.status}
              </span>
            </div>

            <div style={{ display: 'grid', gap: '0.5rem', color: '#334155' }}>
              <div>
                <strong>Fault Type:</strong> {FAULT_CATEGORY_LABELS[report.faultCategory] || report.faultCategory}
              </div>
              {report.assetId && (
                <div>
                  <strong>Pole ID:</strong> {report.assetId}
                </div>
              )}
              {report.location?.landmark && (
                <div>
                  <strong>Location:</strong> {report.location.landmark}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.775rem', marginTop: '0.35rem' }}>
                <Clock size={13} aria-hidden="true" />
                Reported on: {new Date(report.reportedAt).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

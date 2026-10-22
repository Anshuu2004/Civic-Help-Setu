import { useState } from 'react';
import { AlertTriangle, CheckCircle, ArrowRight, UploadCloud, X } from 'lucide-react';

const ActionRequiredAlert = ({
  action,
  appId,
  onResolve = () => {},
}) => {
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  if (!action) return null;

  const handleSubmitResolution = (e) => {
    e.preventDefault();
    onResolve(appId, resolutionNote || 'Uploaded required document.');
    setIsResolving(false);
    setResolutionNote('');
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        padding: '1.25rem',
        borderRadius: '0.85rem',
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            display: 'flex',
          }}
        >
          <AlertTriangle size={22} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ color: '#ef4444', fontWeight: '800', margin: 0, fontSize: '1rem' }}>
              Action Required: {action.title}
            </h4>
            {action.deadline && (
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '99px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  fontWeight: '700',
                }}
              >
                Deadline: {action.deadline}
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0.75rem', lineHeight: '1.5' }}>
            {action.description}
          </p>

          {action.documentRequired && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                background: 'var(--glass-bg)',
                padding: '0.3rem 0.65rem',
                borderRadius: '0.4rem',
                border: '1px solid var(--border-light)',
                marginBottom: '0.75rem',
              }}
            >
              <strong>Document needed:</strong> {action.documentRequired}
            </div>
          )}

          {!isResolving ? (
            <div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsResolving(true)}
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem',
                  background: '#ef4444',
                  borderColor: '#ef4444',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <UploadCloud size={16} /> Resolve Action Now
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmitResolution}
              style={{
                marginTop: '0.75rem',
                padding: '0.85rem',
                background: 'var(--bg-main)',
                borderRadius: '0.6rem',
                border: '1px solid var(--border-light)',
              }}
            >
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                Resolution description or uploaded document confirmation:
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Uploaded re-scanned hospital birth card with clear official seal."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                style={{ width: '100%', marginBottom: '0.75rem', fontSize: '0.85rem' }}
                required
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', background: '#10b981', borderColor: '#10b981' }}
                >
                  <CheckCircle size={15} /> Mark Action Completed
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsResolving(false)}
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionRequiredAlert;

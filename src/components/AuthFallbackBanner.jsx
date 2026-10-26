import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, X, ShieldAlert, AlertTriangle, RefreshCw, Home, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Inline recovery state for a sign-in that did not finish.
 * `failure` comes from classifyAuthFailure(), so it only ever holds fixed,
 * safe wording. Retryable failures get a Try again button, every failure gets
 * a way back to the public home page.
 */
export const AuthFailureNotice = ({ failure, onRetry, retrying = false }) => {
  if (!failure) return null;
  const canRetry = failure.retryable && typeof onRetry === 'function';

  return (
    <div
      role="alert"
      data-testid="auth-failure-notice"
      data-failure-kind={failure.kind}
      style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
        padding: '0.9rem 1rem',
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        borderRadius: '0.75rem',
        fontSize: '0.875rem',
        textAlign: 'left',
      }}
    >
      <AlertTriangle size={18} color="var(--error, #ef4444)" style={{ flexShrink: 0, marginTop: '0.1rem' }} aria-hidden="true" />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{failure.title}</p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{failure.message}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem 1rem', marginTop: '0.75rem' }}>
          {canRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              aria-busy={retrying}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {retrying ? <Loader2 size={14} aria-hidden="true" /> : <RefreshCw size={14} aria-hidden="true" />}
              {retrying ? 'Trying again…' : 'Try again'}
            </button>
          )}
          <Link
            to="/"
            style={{ color: 'var(--accent-main)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Home size={14} aria-hidden="true" /> Return home
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * Without props this is the demo / local mode banner. With a `failure` it shows
 * the sign-in recovery state instead.
 */
const AuthFallbackBanner = ({ failure = null, onRetry, retrying = false }) => {
  const { isDemoMode, user, signInAsDemo } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (failure) return <AuthFailureNotice failure={failure} onRetry={onRetry} retrying={retrying} />;
  if (!isDemoMode || dismissed) return null;

  return (
    <aside
      aria-label="Development Authentication Mode"
      style={{
        background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.12), rgba(129, 140, 248, 0.12))',
        borderBottom: '1px solid var(--border-light)',
        padding: '0.6rem 1.25rem',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        zIndex: 40,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'var(--accent-light)',
            color: 'var(--accent-main)',
            padding: '0.2rem 0.55rem',
            borderRadius: '99px',
            fontWeight: '600',
            fontSize: '0.75rem',
          }}
        >
          <Info size={13} /> Demo / Local Mode
        </span>
        <span>
          Clerk key not detected. Running with simulated local sessions. All routes & vaults are fully testable.
        </span>
        {!user && signInAsDemo && (
          <div style={{ display: 'inline-flex', gap: '0.5rem', marginLeft: '0.25rem' }}>
            <button
              type="button"
              onClick={() => signInAsDemo({ role: 'citizen' })}
              style={{
                color: 'var(--accent-main)',
                textDecoration: 'underline',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Quick Login as Citizen
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => signInAsDemo({ role: 'admin' })}
              style={{
                color: 'var(--accent-main)',
                textDecoration: 'underline',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Login as Admin
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss banner"
        style={{
          color: 'var(--text-tertiary)',
          display: 'flex',
          alignItems: 'center',
          padding: '0.2rem',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'color 0.2s',
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
      >
        <X size={16} />
      </button>
    </aside>
  );
};

export default AuthFallbackBanner;

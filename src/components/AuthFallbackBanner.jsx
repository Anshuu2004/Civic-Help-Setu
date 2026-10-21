import { useState } from 'react';
import { Info, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthFallbackBanner = () => {
  const { isDemoMode, user, signInAsDemo } = useAuth();
  const [dismissed, setDismissed] = useState(false);

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

import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { buildAuthPath, describeProtectedPath } from '../../utils/authRedirect';

/**
 * Explains why the user landed on the sign in / sign up page after trying to
 * open a protected page, and where they'll go once they're done.
 * Renders nothing when there is no protected destination.
 */
const AuthRedirectNotice = ({ redirectTo, mode = 'signin' }) => {
  const label = describeProtectedPath(redirectTo);
  if (!label) return null;

  const isSignUp = mode === 'signup';

  return (
    <div
      role="status"
      data-testid="auth-redirect-notice"
      style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
        padding: '0.9rem 1rem',
        marginBottom: '1.5rem',
        background: 'var(--accent-light)',
        border: '1px solid rgba(56,189,248,0.3)',
        borderRadius: '0.75rem',
        fontSize: '0.875rem',
        textAlign: 'left',
      }}
    >
      <Lock size={18} color="var(--accent-main)" style={{ flexShrink: 0, marginTop: '0.1rem' }} aria-hidden="true" />
      <div>
        <p style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          {isSignUp ? `Create a free account to open ${label}` : `Sign in to open ${label}`}
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          This page is tied to your account, so we need to know it's you first.
          {' '}{isSignUp ? 'Once your account is ready' : 'After you sign in'}, we'll take you straight back to{' '}
          <strong style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{redirectTo}</strong>.
        </p>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {isSignUp ? 'Already have an account? ' : 'New here? '}
          <Link
            to={buildAuthPath(isSignUp ? '/login' : '/signup', redirectTo)}
            state={{ from: redirectTo }}
            style={{ color: 'var(--accent-main)', fontWeight: '600' }}
          >
            {isSignUp ? 'Sign in instead' : 'Create a free account'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthRedirectNotice;

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { buildAuthPath, locationToPath } from '../../utils/authRedirect';

/**
 * Route protection component for authenticated and role-restricted views.
 * Handles loading transitions and unauthorized role states gracefully.
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '1rem',
          color: 'var(--text-secondary)'
        }}
        role="status"
        aria-live="polite"
      >
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-main)' }} />
        <p style={{ fontSize: '0.95rem' }}>Verifying authentication credentials...</p>
      </div>
    );
  }

  if (!user) {
    // Keep the destination in the URL too, so it survives a refresh and the
    // Google sign-in round trip (router state does not).
    return (
      <Navigate
        to={buildAuthPath('/login', locationToPath(location))}
        state={{ from: location }}
        replace
      />
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', maxWidth: '640px', margin: '0 auto' }}>
        <div 
          className="card-glass"
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            borderRadius: '1.25rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'var(--glass-bg)'
          }}
        >
          <div 
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              color: 'var(--error, #ef4444)'
            }}
          >
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Access Restricted
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.75rem' }}>
            This section requires <strong>{requiredRole}</strong> clearance. Your current role is registered as <em>{user.role || 'citizen'}</em>.
          </p>
          <a 
            href="/"
            className="btn btn-primary"
            style={{ display: 'inline-block', padding: '0.65rem 1.5rem', textDecoration: 'none' }}
          >
            Return to Safety
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, KeyRound, User, Users, Lock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { SignIn, useSignIn } from '@clerk/react';
import { dark } from '@clerk/themes';
import { useTheme } from '../context/ThemeContext';

// Google 4-color SVG Brand Icon
const GoogleLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

// One-click Google sign in button powered by Clerk
const ClerkGoogleButton = ({ disabled }) => {
  const { signIn, isLoaded } = useSignIn();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return;
    try {
      setLoading(true);
      setError('');
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError(err?.errors?.[0]?.message || 'Google sign-in could not be initiated.');
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={disabled || loading || !isLoaded}
        className="google-signin-btn"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '0.9rem 1.25rem',
          borderRadius: '0.85rem',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid var(--border-light)',
          color: 'var(--text-primary)',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'var(--shadow-sm)',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
          e.currentTarget.style.borderColor = 'var(--accent-main)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.borderColor = 'var(--border-light)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <GoogleLogo size={22} />
        {loading ? 'Opening Google Sign-in...' : 'Continue with Google'}
      </button>
      {error && (
        <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  );
};

const Login = () => {
  const [activeTab, setActiveTab] = useState('citizen'); // 'citizen' or 'admin'
  const [authMode, setAuthMode] = useState('google'); // 'google' | 'clerk_form' | 'demo'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login, logout, isClerkConfigured } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Demo Citizen Quick Sign-In
  const handleQuickCitizenDemo = async () => {
    setError('');
    setLoading(true);
    try {
      await login('demo_citizen', 'civic123');
      navigate(from, { replace: true });
    } catch {
      setError('Quick sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(username, password);

      if (activeTab === 'admin' && res.role !== 'admin') {
        throw new Error('Access Denied: Admin privileges required');
      }

      if (res.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.message === 'Access Denied: Admin privileges required') {
        setError(err.message);
      } else {
        setError('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, show status
  if (user) {
    return (
      <div className="section flex-center" style={{ minHeight: '85vh' }}>
        <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid var(--accent-main)' }}>
            {user.imageUrl ? (
              <img src={user.imageUrl} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <CheckCircle2 size={36} color="var(--accent-main)" />
            )}
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>You're Signed In</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Logged in as <strong style={{ color: 'var(--text-primary)' }}>{user.username}</strong>
          </p>
          {user.email && (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {user.email}
            </p>
          )}
          <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '600', background: user.role === 'admin' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(52, 211, 153, 0.15)', color: user.role === 'admin' ? 'var(--accent-main)' : 'var(--success)', marginBottom: '2rem' }}>
            {user.role === 'admin' ? 'Administrator' : 'Verified Citizen'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {user.role === 'admin' ? (
              <button onClick={() => navigate('/admin')} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
                Go to Admin Portal <ArrowRight size={18} />
              </button>
            ) : (
              <button onClick={() => navigate(from)} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
                Continue to CivicBridge <ArrowRight size={18} />
              </button>
            )}
            <button onClick={logout} className="btn btn-secondary" style={{ width: '100%', padding: '0.875rem' }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section flex-center" style={{ minHeight: '85vh', position: 'relative' }}>
      <div
        className="glow-blob animate-fade-in"
        style={{
          width: '500px',
          height: '500px',
          background: activeTab === 'admin' ? 'var(--accent-main)' : 'rgba(56, 189, 248, 0.25)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.12,
          transition: 'background 0.5s ease',
        }}
      />

      <div className="glass-panel animate-fade-in delay-100" style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 10, padding: '2.5rem' }}>
        {/* Toggle Citizen vs Admin */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', background: 'var(--glass-bg-subtle)', padding: '0.4rem', borderRadius: '1rem', border: '1px solid var(--border-main)' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('citizen'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              fontSize: '0.95rem',
              transition: 'all 0.3s',
              background: activeTab === 'citizen' ? 'var(--glass-bg-hover)' : 'transparent',
              color: activeTab === 'citizen' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'citizen' ? 'var(--shadow-sm)' : 'none',
              border: activeTab === 'citizen' ? '1px solid var(--border-light)' : '1px solid transparent',
              cursor: 'pointer',
            }}
          >
            <Users size={18} /> Citizen
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              fontSize: '0.95rem',
              transition: 'all 0.3s',
              background: activeTab === 'admin' ? 'var(--accent-main)' : 'transparent',
              color: activeTab === 'admin' ? 'var(--bg-main)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'admin' ? '0 0 15px rgba(56,189,248,0.4)' : 'none',
              border: '1px solid transparent',
              cursor: 'pointer',
            }}
          >
            <Shield size={18} /> Admin
          </button>
        </div>

        {/* Header Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.75rem' }}>
          {activeTab === 'admin' ? (
            <div style={{ width: '3.75rem', height: '3.75rem', borderRadius: '1.25rem', background: 'var(--accent-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: 'var(--shadow-glow)' }}>
              <Lock size={28} color="var(--bg-main)" />
            </div>
          ) : (
            <div style={{ width: '3.75rem', height: '3.75rem', borderRadius: '1.25rem', background: 'var(--glass-bg-hover)', border: '1px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Sparkles size={28} color="var(--accent-main)" />
            </div>
          )}
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>
            {activeTab === 'admin' ? 'Admin Portal' : 'Citizen Access'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', textAlign: 'center', fontSize: '0.9rem' }}>
            {activeTab === 'admin'
              ? 'Enter administrative credentials'
              : 'Sign in to access document vault and track civic applications'}
          </p>
        </div>

        {error && (
          <div className="animate-fade-in" style={{ padding: '0.875rem', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', color: 'var(--error)', borderRadius: '0.75rem', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500' }}>
            {error}
          </div>
        )}

        {/* Citizen Authentication Flow */}
        {activeTab === 'citizen' && (
          <div>
            {isClerkConfigured ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Primary Google Login Button */}
                <ClerkGoogleButton disabled={loading} />

                {/* Sub-selector for Full Clerk vs Quick Demo */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-main)' }} />
                  <span style={{ padding: '0 0.75rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    or continue with
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-main)' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'clerk_form' ? 'google' : 'clerk_form')}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.65rem 0.5rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      borderColor: authMode === 'clerk_form' ? 'var(--accent-main)' : 'var(--border-main)',
                      background: authMode === 'clerk_form' ? 'rgba(56, 189, 248, 0.1)' : 'var(--glass-bg)',
                    }}
                  >
                    <User size={15} /> Clerk Form
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickCitizenDemo}
                    disabled={loading}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.65rem 0.5rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Sparkles size={15} color="var(--accent-main)" /> 1-Click Demo
                  </button>
                </div>

                {authMode === 'clerk_form' && (
                  <div className="animate-fade-in" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <SignIn
                      routing="hash"
                      signUpUrl="/signup"
                      appearance={{
                        baseTheme: theme === 'dark' ? dark : undefined,
                        variables: {
                          colorPrimary: '#38bdf8',
                        },
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Fallback when Clerk publishable key is not set yet in .env */
              <div>
                <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  <p style={{ fontWeight: '600', color: 'var(--accent-main)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={16} /> Clerk & Google Auth Ready
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Add <code>VITE_CLERK_PUBLISHABLE_KEY</code> in <code>.env</code> to activate live Google login via Clerk.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={handleQuickCitizenDemo}
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem' }}
                  >
                    <Sparkles size={18} /> Continue with Citizen Demo
                  </button>

                  <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>— OR CUSTOM LOGIN —</span>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Citizen Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      className="input-field"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '0.875rem' }} disabled={loading}>
                      {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin Authentication Flow */}
        {activeTab === 'admin' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                <User size={18} />
              </div>
              <input
                type="text"
                className="input-field"
                placeholder="Admin Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '3rem' }}
                required
              />
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                <KeyRound size={18} />
              </div>
              <input
                type="password"
                className="input-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '3rem' }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '1.1rem',
                background: 'var(--text-primary)',
                color: 'var(--bg-main)',
                border: 'none',
              }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Secure Admin Login'}
            </button>

            <div className="animate-fade-in" style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              <p>Demo hint: use <span style={{ color: 'var(--accent-main)', fontWeight: '600' }}>esha</span> / <span style={{ color: 'var(--accent-main)', fontWeight: '600' }}>opensource</span></p>
            </div>
          </form>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-main)', fontWeight: '600' }}>
            Sign up with Google
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

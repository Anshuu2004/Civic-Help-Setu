import { useSignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { dark } from '@clerk/themes';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

const SignUpPage = () => {
  const { theme } = useTheme();
  const { isClerkConfigured } = useAuth();
  const navigate = useNavigate();
  const { isLoaded, signUp } = useSignUp();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      // Create user with email and password
      await signUp.create({ emailAddress: email, password });
      // Optionally set username if provided
      if (username) {
        await signUp.update({ username });
      }
      // Prepare email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err?.errors?.[0]?.message || 'Sign‑up failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isClerkConfigured) {
    return (
      <div className="section flex-center" style={{ minHeight: '85vh' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '420px' }}>
          <Shield size={36} color="var(--accent-main)" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.5rem' }}>Clerk Registration</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Add <code>VITE_CLERK_PUBLISHABLE_KEY</code> in <code>.env</code> to activate live Clerk Sign‑up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="section flex-center" style={{ minHeight: '85vh', position: 'relative' }}>
      <div className="glow-blob animate-fade-in" style={{
        width: '500px',
        height: '500px',
        background: 'var(--accent-main)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.1,
      }} />

      <div className="glass-panel animate-fade-in delay-100" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', position: 'relative', zIndex: 10 }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', textAlign: 'center', marginBottom: '1rem' }}>Create your account</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Welcome! Please fill in the details to get started.
        </p>
        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--error)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Username (optional)"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-main)', background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
          />
          <input
            type="email"
            placeholder="Email address"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-main)', background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-main)', background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.9rem', fontSize: '1rem' }}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Already have an account? <a href="/login" style={{ color: 'var(--accent-main)', fontWeight: '600' }}>Sign in</a>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

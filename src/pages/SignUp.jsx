import { SignUp } from '@clerk/react';
import { dark } from '@clerk/themes';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const SignUpPage = () => {
  const { theme } = useTheme();
  const { isClerkConfigured } = useAuth();

  return (
    <div className="section flex-center" style={{ minHeight: '85vh', position: 'relative' }}>
      <div 
        className="glow-blob animate-fade-in" 
        style={{ 
          width: '500px', 
          height: '500px', 
          background: 'var(--accent-main)', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          opacity: 0.1 
        }} 
      />
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {isClerkConfigured ? (
          <SignUp
            routing="path"
            path="/signup"
            signInUrl="/login"
            forceRedirectUrl="/"
            appearance={{
              baseTheme: theme === 'dark' ? dark : undefined,
              variables: {
                colorPrimary: '#38bdf8',
              },
            }}
          />
        ) : (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', width: '100%' }}>
            <Shield size={36} color="var(--accent-main)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Clerk Registration</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Add your <code>VITE_CLERK_PUBLISHABLE_KEY</code> in <code>.env</code> to activate live Clerk Sign-up and Google Auth.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
              Go to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;

import { AuthenticateWithRedirectCallback } from '@clerk/react';
import { Loader2, ShieldCheck } from 'lucide-react';

const SSOCallback = () => {
  return (
    <div className="section flex-center" style={{ minHeight: '85vh', textAlign: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem 2.5rem', maxWidth: '420px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={36} color="var(--accent-main)" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.5rem' }}>Authenticating with Google</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          Connecting your Google profile with Clerk to secure your civic session...
        </p>
        <Loader2 size={32} className="animate-spin" color="var(--accent-main)" style={{ marginTop: '0.5rem' }} />
        <div style={{ marginTop: '0.5rem', opacity: 0, height: 0, overflow: 'hidden' }}>
          <AuthenticateWithRedirectCallback signInForceRedirectUrl="/" signUpForceRedirectUrl="/" />
        </div>
      </div>
    </div>
  );
};

export default SSOCallback;

import { useState } from 'react';
import { Search, CheckCircle2, Circle, Clock, FileText, ArrowRight, Copy } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Track = () => {
  const [appId, setAppId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);
  const { toast } = useToast();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!appId.trim()) {
      toast.warning('Please enter an application reference ID to track status.');
      return;
    }
    
    setIsSearching(true);
    setResult(null);
    
    // Simulate network lookup
    setTimeout(() => {
      setResult({
        id: appId.toUpperCase().trim(),
        service: 'Income Certificate',
        date: 'Oct 02, 2024',
        status: 'in-progress',
        estimatedCompletion: 'Oct 12, 2024'
      });
      setIsSearching(false);
      toast.success('Application record retrieved successfully.', 'Record Found');
    }, 900);
  };

  const handleCopyId = () => {
    if (!result) return;
    navigator.clipboard?.writeText(result.id);
    toast.info(`Reference ID ${result.id} copied to clipboard.`);
  };

  return (
    <div className="section animate-fade-in" style={{ paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>Track Application</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
            Enter your 10-digit application reference number to check the live status.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '4rem', background: 'var(--glass-bg)', padding: '0.75rem', borderRadius: '99px', border: '1px solid var(--border-main)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ paddingLeft: '1rem', display: 'flex', alignItems: 'center', color: 'var(--text-tertiary)' }}>
            <Search size={24} />
          </div>
          <input
            type="text"
            placeholder="E.g. SRV-98234710"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            className="input-field"
            style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: '0.5rem', fontSize: '1.25rem', flex: 1 }}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSearching}
            style={{ padding: '0 2rem', borderRadius: '99px' }}
          >
            {isSearching ? 'Tracking...' : 'Track Now'}
          </button>
        </form>

        {result && (
          <div className="glass-panel animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--accent-main)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Application Found
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.5rem', color: 'var(--text-primary)' }}>{result.service}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <p style={{ color: 'var(--text-tertiary)', margin: 0, fontSize: '1rem' }}>Ref ID: {result.id}</p>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    title="Copy Reference ID"
                    aria-label="Copy Reference ID"
                    style={{
                      background: 'var(--border-light)',
                      border: 'none',
                      borderRadius: '0.375rem',
                      padding: '0.2rem 0.4rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <Copy size={13} /> Copy
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Applied on</span>
                <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '1.125rem' }}>{result.date}</p>
              </div>
            </div>

            <div style={{ position: 'relative', padding: '2rem 0 2rem 2rem' }}>
              <div style={{ position: 'absolute', left: '2.6rem', top: '3rem', bottom: '3rem', width: '2px', background: 'var(--border-main)' }}></div>
              
              <div style={{ position: 'relative', display: 'flex', gap: '2rem', marginBottom: '3rem', zIndex: 1 }}>
                <div style={{ background: 'var(--bg-main)', borderRadius: '50%', padding: '0.25rem' }}>
                  <CheckCircle2 size={32} color="var(--success, #10b981)" fill="rgba(16, 185, 129, 0.2)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>Application Submitted</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Your application and documents have been received.</p>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', display: 'block', marginTop: '0.5rem' }}>Oct 02, 10:45 AM</span>
                </div>
              </div>

              <div style={{ position: 'relative', display: 'flex', gap: '2rem', marginBottom: '3rem', zIndex: 1 }}>
                <div style={{ background: 'var(--bg-main)', borderRadius: '50%', padding: '0.25rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '4px solid var(--accent-main)', borderTopColor: 'transparent', animation: 'spin 1.5s linear infinite' }}></div>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-main)' }}>Document Verification</h3>
                  <p style={{ color: 'var(--text-primary)', marginTop: '0.25rem' }}>An officer is currently verifying your submitted documents.</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem', marginTop: '1rem', color: 'var(--accent-main)', fontSize: '0.875rem', fontWeight: '600' }}>
                    <Clock size={16} /> Estimated wait: 2 days
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative', display: 'flex', gap: '2rem', zIndex: 1 }}>
                <div style={{ background: 'var(--bg-main)', borderRadius: '50%', padding: '0.25rem' }}>
                  <Circle size={32} color="var(--text-tertiary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-tertiary)' }}>Final Approval & Issuance</h3>
                  <p style={{ color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Awaiting clearance from verification officer.</p>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <FileText size={24} color="var(--text-secondary)" />
                <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>View submitted documents</span>
              </div>
              <button
                type="button"
                onClick={() => toast.info('Official receipt copy available in your Documents Vault.', 'Receipt Available')}
                style={{ background: 'none', border: 'none', color: 'var(--accent-main)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}
              >
                View Receipt <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Track;

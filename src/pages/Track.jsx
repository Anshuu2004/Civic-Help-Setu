import { useState } from 'react';
import { Search, CheckCircle2, Circle, Clock, FileText, ArrowRight, Copy } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Track = () => {
  const location = useLocation();
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
    setNotFound(false);
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
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-main)', fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
            <ShieldCheck size={18} /> Live Service Tracker
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.25rem)', fontWeight: '800', marginBottom: '0.75rem' }}>
            Track Application Status
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)' }}>
            Enter your application reference number (e.g. SRV-98234710) for real-time progress.
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            background: 'var(--glass-bg)',
            padding: '0.6rem 0.75rem',
            borderRadius: '99px',
            border: '1px solid var(--border-main)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ paddingLeft: '1rem', display: 'flex', alignItems: 'center', color: 'var(--text-tertiary)' }}>
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Enter reference ID (e.g. SRV-98234710)"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            className="input-field"
            style={{
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
              padding: '0.5rem',
              fontSize: '1.1rem',
              flex: 1,
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSearching}
            style={{ padding: '0 1.75rem', borderRadius: '99px', fontSize: '1rem' }}
          >
            {isSearching ? 'Checking...' : 'Track Now'}
          </button>
        </form>

        {/* Quick select recent applications */}
        {recentApps.length > 0 && (
          <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: '600' }}>Recent records:</span>
            {recentApps.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => handleSelectRecent(app.id)}
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '99px',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--accent-main)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
              >
                {app.id} ({app.serviceName})
              </button>
            ))}
          </div>
        )}

        {/* Not Found Alert */}
        {notFound && (
          <div
            className="glass-panel animate-fade-in"
            style={{
              padding: '2rem',
              textAlign: 'center',
              borderLeft: '4px solid var(--error, #ef4444)',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', color: 'var(--error, #ef4444)', marginBottom: '0.75rem' }}>
              <AlertCircle size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.35rem' }}>
              No Application Found
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
              We could not find an application with reference number <strong>"{appId}"</strong>. Please verify the ID or submit a fast-track application through any service guide.
            </p>
          </div>
        )}

        {/* Active Application Result Panel */}
        {result && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '2rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid var(--border-light)',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: 'var(--accent-main)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Application Status
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
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Target Completion</span>
                <p style={{ fontWeight: '700', color: 'var(--accent-main)', fontSize: '1.1rem' }}>
                  {result.estimatedCompletion}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '0.35rem',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '99px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    background: result.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                    color: result.status === 'completed' ? 'var(--success, #10b981)' : 'var(--accent-main)',
                  }}
                >
                  {result.status === 'completed' ? 'Dispatched / Ready' : 'In Progress'}
                </span>
              </div>
            </div>

            {/* Dynamic Stage Timeline */}
            <ApplicationTimeline stages={result.stages} />

            {/* Receipt and Details Footer */}
            <div
              style={{
                marginTop: '2.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <FileText size={20} color="var(--text-secondary)" />
                <span style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Applied: {result.appliedDate}
                </span>
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

        {/* Digital Receipt Modal */}
        <TrackingReceiptModal
          app={result}
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
        />
      </div>
    </div>
  );
};

export default Track;

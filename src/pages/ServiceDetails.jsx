import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_SERVICES } from '../data/services';
import Checklist from '../components/Checklist';
import SourceCard from '../components/SourceCard';
import { ArrowLeft, Clock, CreditCard, AlertTriangle, Bookmark, Flag, Zap, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitErrorReport } from '../services/adminService';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [service, setService] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyStep, setApplyStep] = useState(1); // 1: form, 2: success
  const [generatedAppId, setGeneratedAppId] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleReportInaccuracy = () => {
    if (!service) return;
    const comment = window.prompt(`Describe any inaccuracy or broken links on the "${service.name}" guide:`, 'Outdated portal link or fee structure.');
    if (comment && comment.trim()) {
      submitErrorReport({
        serviceId: service.id,
        serviceName: service.name,
        issueType: 'Community Report',
        description: comment.trim(),
        reporterEmail: user?.email || 'citizen.reporter@civicbridge.org',
      });
      setReportSubmitted(true);
      setTimeout(() => setReportSubmitted(false), 4000);
    }
  };

  useEffect(() => {
    const found = MOCK_SERVICES.find(s => s.id === id);
    setService(found);
    const saved = JSON.parse(localStorage.getItem('civicbridge_saved') || '[]');
    if (saved.some(s => s.id === id)) setIsSaved(true);
  }, [id]);

  const toggleSave = () => {
    if (!service) return;
    let saved = JSON.parse(localStorage.getItem('civicbridge_saved') || '[]');
    if (isSaved) saved = saved.filter(s => s.id !== service.id);
    else saved.push({ id: service.id, name: service.name, category: service.category });
    localStorage.setItem('civicbridge_saved', JSON.stringify(saved));
    setIsSaved(!isSaved);
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    setApplyStep(2);
    setGeneratedAppId('SRV-' + Math.floor(10000000 + Math.random() * 90000000));
  };

  if (!service) return (
    <div className="section container" style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Service not found</h2>
      <Link to="/services" className="btn btn-secondary">Return to directory</Link>
    </div>
  );

  return (
    <>
      <div className="section animate-fade-in" style={{ paddingBottom: '6rem' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <Link to="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500', transition: 'color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <ArrowLeft size={18} /> Back to Services
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
            {/* Background Glow */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)', zIndex: 0, opacity: 0.5, pointerEvents: 'none' }}></div>
            
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', background: 'var(--accent-light)', color: 'var(--accent-main)', borderRadius: '99px', fontSize: '0.875rem', fontWeight: '600' }}>{service.category}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: '500' }}>{service.type}</span>
                </div>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', lineHeight: '1.2', marginBottom: '1rem' }}>{service.name}</h1>
                <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '600px' }}>{service.shortDescription}</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
                <button 
                  onClick={() => user ? setShowApplyModal(true) : navigate('/login')}
                  className="btn btn-primary"
                  style={{ padding: '1rem 2rem', fontSize: '1.125rem', background: 'var(--accent-main)', color: 'var(--bg-main)' }}
                >
                  <Zap size={20} fill="currentColor" />
                  Fast-Track Apply
                </button>
                <button 
                  onClick={toggleSave}
                  className="btn btn-secondary"
                  style={{ 
                    background: isSaved ? 'rgba(56, 189, 248, 0.1)' : 'var(--glass-bg)',
                    borderColor: isSaved ? 'var(--accent-main)' : 'var(--border-main)',
                    color: isSaved ? 'var(--accent-main)' : 'var(--text-primary)'
                  }}
                >
                  <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? 'Saved' : 'Save Guide'}
                </button>
              </div>
            </div>

            <div className="grid-2" style={{ position: 'relative', zIndex: 1, marginBottom: '2.5rem' }}>
              <div style={{ background: 'var(--glass-bg-subtle)', border: '1px solid var(--border-light)', padding: '1.5rem', borderRadius: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <CreditCard size={24} color="var(--text-tertiary)" />
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Expected Fees</h4>
                  <p style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>{service.fees}</p>
                </div>
              </div>
              <div style={{ background: 'var(--glass-bg-subtle)', border: '1px solid var(--border-light)', padding: '1.5rem', borderRadius: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Clock size={24} color="var(--text-tertiary)" />
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Processing Time</h4>
                  <p style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>{service.processingTime}</p>
                </div>
              </div>
            </div>

            {service.warnings && service.warnings.length > 0 && (
              <div style={{ position: 'relative', zIndex: 1, padding: '1.5rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '1rem', marginBottom: '2.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: '#fbbf24', marginBottom: '1rem', fontSize: '1.125rem' }}>
                  <AlertTriangle size={20} /> Important Notice
                </h3>
                <ul style={{ paddingLeft: '1.5rem', color: '#fcd34d', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {service.warnings.map((warning, idx) => <li key={idx} style={{ listStyleType: 'disc' }}>{warning}</li>)}
                </ul>
              </div>
            )}

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '4rem' }}>
              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-main)' }}>Eligibility</h2>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {service.eligibility.map((item, idx) => <li key={idx} style={{ listStyleType: 'disc' }}>{item}</li>)}
                </ul>
              </section>

              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-main)' }}>Required Documents</h2>
                <Checklist items={service.documents} />
              </section>

              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-main)' }}>Steps</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {service.steps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1.5rem' }}>
                      <div style={{ width: '3rem', height: '3rem', flexShrink: 0, borderRadius: '50%', background: 'var(--glass-bg)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div style={{ paddingTop: '0.25rem' }}>
                        <h3 style={{ fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{step.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-main)' }}>Official Resources</h2>
                <div className="grid-2">
                  {service.officialSources.map((source, idx) => (
                    <SourceCard key={idx} source={source} />
                  ))}
                </div>
              </section>
            </div>

            <div style={{ position: 'relative', zIndex: 1, marginTop: '4rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-main)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Last Verified: {service.lastVerified}</div>
              {reportSubmitted ? (
                <span style={{ fontSize: '0.85rem', color: 'var(--success, #10b981)', fontWeight: '600' }}>
                  ✓ Report submitted to moderator queue. Thank you!
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleReportInaccuracy}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', transition: 'color 0.3s' }}
                  onMouseOver={(e) => (e.currentTarget.style.color = 'var(--error)')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                >
                  <Flag size={14} /> Report incorrect information
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fast-Track Apply Modal */}
      {showApplyModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '600px', background: 'var(--bg-main)', position: 'relative' }}>
            <button 
              onClick={() => { setShowApplyModal(false); setApplyStep(1); }} 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--glass-bg)', border: 'none', color: 'var(--text-secondary)', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {applyStep === 1 ? (
              <div style={{ padding: '1rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Universal Fast-Track</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Applying digitally for: <strong style={{ color: 'var(--text-primary)' }}>{service.name}</strong></p>
                
                <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name (as per ID)</label>
                    <input type="text" className="input-field" required placeholder="John Doe" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Aadhaar Number / Virtual ID</label>
                    <input type="text" className="input-field" required placeholder="XXXX XXXX XXXX" />
                  </div>
                  <div style={{ padding: '1.5rem', border: '1px dashed var(--border-main)', borderRadius: '1rem', textAlign: 'center', background: 'var(--glass-bg-subtle)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>Upload the Required Documents mentioned in the guide</p>
                    <input type="file" required style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.125rem' }}>
                    Submit Secure Application
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                  <CheckCircle2 size={48} />
                </div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Application Sent!</h2>
                <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                  Your digital application for {service.name} has been securely submitted.
                </p>
                <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-main)', width: '100%', marginBottom: '2.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Reference ID</span>
                  <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent-main)', marginTop: '0.5rem', fontFamily: 'monospace' }}>
                    {generatedAppId}
                  </p>
                </div>
                <Link to="/track" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
                  Track Application Status
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceDetails;

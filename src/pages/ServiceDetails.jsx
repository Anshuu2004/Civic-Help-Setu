import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_SERVICES } from '../data/services';
import Checklist from '../components/Checklist';
import SourceCard from '../components/SourceCard';
import { ArrowLeft, Clock, CreditCard, AlertTriangle, Bookmark, Flag } from 'lucide-react';

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

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

  if (!service) return (
    <div className="section container" style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Service not found</h2>
      <Link to="/services" className="btn btn-secondary">Return to directory</Link>
    </div>
  );

  return (
    <div className="section animate-fade-in" style={{ paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500', transition: 'color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <ArrowLeft size={18} /> Back to Services
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <span style={{ padding: '0.25rem 0.75rem', background: 'var(--accent-light)', color: 'var(--accent-main)', borderRadius: '99px', fontSize: '0.875rem', fontWeight: '600' }}>{service.category}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: '500' }}>{service.type}</span>
              </div>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', lineHeight: '1.2', marginBottom: '1rem' }}>{service.name}</h1>
              <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '600px' }}>{service.shortDescription}</p>
            </div>
            
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

          <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
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
            <div style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '1rem', marginBottom: '2.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: '#fbbf24', marginBottom: '1rem', fontSize: '1.125rem' }}>
                <AlertTriangle size={20} /> Important Notice
              </h3>
              <ul style={{ paddingLeft: '1.5rem', color: '#fcd34d', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {service.warnings.map((warning, idx) => <li key={idx} style={{ listStyleType: 'disc' }}>{warning}</li>)}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
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

          <div style={{ marginTop: '4rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-main)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Last Verified: {service.lastVerified}</div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', transition: 'color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--error)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}>
              <Flag size={14} /> Report incorrect information
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;

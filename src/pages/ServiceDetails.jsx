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
    // Mock fetching data
    const found = MOCK_SERVICES.find(s => s.id === id);
    setService(found);

    // Check if saved in localStorage
    const saved = JSON.parse(localStorage.getItem('civicbridge_saved') || '[]');
    if (saved.some(s => s.id === id)) {
      setIsSaved(true);
    }
  }, [id]);

  const toggleSave = () => {
    if (!service) return;
    
    let saved = JSON.parse(localStorage.getItem('civicbridge_saved') || '[]');
    if (isSaved) {
      saved = saved.filter(s => s.id !== service.id);
    } else {
      saved.push({ id: service.id, name: service.name, category: service.category });
    }
    localStorage.setItem('civicbridge_saved', JSON.stringify(saved));
    setIsSaved(!isSaved);
  };

  if (!service) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Service not found</h2>
        <Link to="/services" className="text-accent hover:underline">Return to directory</Link>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl pt-20 pb-24">
      <div className="mb-8">
        <Link to="/services" className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Back to Services
        </Link>
      </div>

      <div className="card mb-8 p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="badge">{service.category}</span>
              <span className="text-sm text-muted">{service.type}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 leading-tight">{service.name}</h1>
            <p className="text-lg text-muted">{service.shortDescription}</p>
          </div>
          <button 
            onClick={toggleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-light bg-secondary hover:bg-main transition-colors text-sm font-medium"
            style={{ 
              borderColor: isSaved ? 'var(--accent-main)' : 'var(--border-light)',
              color: isSaved ? 'var(--accent-main)' : 'inherit'
            }}
          >
            <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
            {isSaved ? 'Saved' : 'Save Guide'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-tertiary rounded-lg border border-light">
          <div className="flex items-start gap-3">
            <CreditCard className="text-muted mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-sm">Expected Fees</h4>
              <p className="text-sm">{service.fees}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="text-muted mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-sm">Processing Time</h4>
              <p className="text-sm">{service.processingTime}</p>
            </div>
          </div>
        </div>

        {service.warnings && service.warnings.length > 0 && (
          <div className="mb-8 p-4 rounded-lg bg-orange-50 border border-orange-200" style={{ backgroundColor: '#fff7ed', borderColor: '#ffedd5' }}>
            <h3 className="flex items-center gap-2 font-bold text-orange-800 mb-2">
              <AlertTriangle size={20} /> Important
            </h3>
            <ul className="list-disc pl-5 text-orange-800 space-y-1">
              {service.warnings.map((warning, idx) => (
                <li key={idx} className="text-sm">{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-light">Eligibility</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted">
              {service.eligibility.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-light">Required Documents</h2>
            <Checklist items={service.documents} />
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-light">Steps</h2>
            <div className="space-y-6">
              {service.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-light text-accent flex items-center justify-center font-bold text-sm">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{step.title}</h3>
                    <p className="text-muted">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-light">Official Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {service.officialSources.map((source, idx) => (
                <SourceCard key={idx} source={source} />
              ))}
            </div>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-light flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted">
          <div>Last Verified: {service.lastVerified}</div>
          <button className="flex items-center gap-2 text-muted hover:text-error transition-colors">
            <Flag size={16} /> Report incorrect information
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;

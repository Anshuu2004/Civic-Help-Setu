import React, { useState, useEffect } from 'react';
import { MOCK_SERVICES } from '../data/services';
import ServiceCard from '../components/ServiceCard';
import { BookmarkMinus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Saved = () => {
  const [savedServices, setSavedServices] = useState([]);

  useEffect(() => {
    const savedIds = JSON.parse(localStorage.getItem('civicbridge_saved') || '[]').map(s => s.id);
    const services = MOCK_SERVICES.filter(s => savedIds.includes(s.id));
    setSavedServices(services);
  }, []);

  const clearSaved = () => {
    if (confirm('Are you sure you want to clear all saved guides?')) {
      localStorage.removeItem('civicbridge_saved');
      setSavedServices([]);
    }
  };

  return (
    <div className="container pt-20 pb-24">
      <div className="flex justify-between items-end mb-12 border-b border-light pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Saved Guides</h1>
          <p className="text-muted">Quickly access guides you've bookmarked.</p>
        </div>
        
        {savedServices.length > 0 && (
          <button 
            onClick={clearSaved}
            className="flex items-center gap-2 text-sm text-muted hover:text-error transition-colors"
          >
            <BookmarkMinus size={16} /> Clear All
          </button>
        )}
      </div>

      {savedServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedServices.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-secondary rounded-lg border border-light">
          <BookmarkMinus size={48} className="mx-auto text-tertiary mb-4" />
          <h2 className="text-xl font-bold mb-2">No saved guides</h2>
          <p className="text-muted mb-6">You haven't saved any guides yet.</p>
          <Link to="/services" className="btn btn-primary">
            Explore Services
          </Link>
        </div>
      )}
    </div>
  );
};

export default Saved;

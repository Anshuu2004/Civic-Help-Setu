import React, { useState } from 'react';
import { MOCK_SERVICES } from '../data/services';
import ServiceCard from '../components/ServiceCard';
import SearchBox from '../components/SearchBox';

const Services = () => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(MOCK_SERVICES.map(s => s.category))];
  const filteredServices = filter === 'All' ? MOCK_SERVICES : MOCK_SERVICES.filter(s => s.category === filter);

  return (
    <div className="section animate-fade-in">
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>Service Directory</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '800px' }}>
            Browse our comprehensive, simplified guides for government and public services.
          </p>
          <div style={{ maxWidth: '800px', marginBottom: '3rem' }}>
            <SearchBox placeholder="Search the directory..." size="large" />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '3rem' }}>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '99px',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                background: filter === cat ? 'var(--text-primary)' : 'var(--glass-bg)',
                color: filter === cat ? 'var(--bg-main)' : 'var(--text-secondary)',
                border: filter === cat ? '1px solid transparent' : '1px solid var(--border-main)',
                cursor: 'pointer',
                boxShadow: filter === cat ? '0 0 15px var(--glass-border-strong)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredServices.length > 0 ? (
          <div className="grid-3 pb-12">
            {filteredServices.map((service, index) => (
              <div key={service.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                 <ServiceCard service={service} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: '600' }}>No services found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Services;

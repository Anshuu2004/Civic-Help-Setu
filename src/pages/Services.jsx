import React, { useState } from 'react';
import { MOCK_SERVICES } from '../data/services';
import ServiceCard from '../components/ServiceCard';
import SearchBox from '../components/SearchBox';

const Services = () => {
  const [filter, setFilter] = useState('All');
  
  const categories = ['All', ...new Set(MOCK_SERVICES.map(s => s.category))];

  const filteredServices = filter === 'All' 
    ? MOCK_SERVICES 
    : MOCK_SERVICES.filter(s => s.category === filter);

  return (
    <div className="container pt-20 pb-24">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Service Directory</h1>
        <p className="text-xl text-muted mb-10 max-w-3xl">
          Browse our collection of simplified guides for government and public services.
        </p>
        
        <div className="max-w-2xl">
          <SearchBox placeholder="Search the directory..." size="large" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-12">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2.5 rounded-full text-base font-bold transition-all shadow-sm ${
              filter === cat 
                ? 'bg-accent-main text-white transform scale-105' 
                : 'bg-white text-muted hover:text-accent hover:border-accent-light border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredServices.length > 0 ? (
        <div className="masonry-grid pb-12">
          {filteredServices.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary rounded-3xl border border-light">
          <p className="text-xl text-muted font-bold">No services found for this category.</p>
        </div>
      )}
    </div>
  );
};

export default Services;

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';

const ServiceCard = ({ service }) => {
  return (
    <Link 
      to={`/services/${service.id}`} 
      className="card flex flex-col justify-between h-full hover:animate-float-hover group block"
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <span className="badge" style={{ transform: 'translateY(-5px) translateX(-5px)' }}>
            {service.category}
          </span>
          <span className="text-sm font-bold text-muted bg-secondary px-3 py-1 rounded-full">{service.type}</span>
        </div>
        <h3 className="text-2xl font-bold mb-3 leading-tight group-hover:text-accent transition-colors">{service.name}</h3>
        <p className="text-muted mb-6 text-lg">{service.shortDescription}</p>
      </div>
      
      <div className="mt-4 pt-6" style={{ borderTop: '2px dashed var(--border-light)' }}>
        <div className="flex items-center justify-between font-bold text-accent group-hover:text-accent-hover transition-colors">
          <span className="flex items-center gap-2"><BookOpen size={20} /> View Guide</span>
          <div className="bg-accent-light p-2 rounded-full group-hover:bg-accent-main group-hover:text-white transition-all">
            <ArrowRight size={20} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;

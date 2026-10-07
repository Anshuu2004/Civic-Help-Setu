import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';

const ServiceCard = ({ service }) => {
  return (
    <Link 
      to={`/services/${service.id}`} 
      className="card"
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', textDecoration: 'none' }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <span style={{ padding: '0.25rem 0.75rem', background: 'var(--accent-light)', color: 'var(--accent-main)', borderRadius: '99px', fontSize: '0.875rem', fontWeight: '600', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            {service.category}
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-tertiary)', background: 'var(--glass-bg)', padding: '0.25rem 0.75rem', borderRadius: '99px', border: '1px solid var(--border-light)' }}>
            {service.type}
          </span>
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--accent-main)'} onMouseOut={(e) => e.target.style.color = 'var(--text-primary)'}>{service.name}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', lineHeight: '1.6' }}>{service.shortDescription}</p>
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: 'var(--accent-main)', fontSize: '0.875rem' }}>
          <BookOpen size={18} /> View Guide
        </span>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', transition: 'all 0.3s' }}>
          <ArrowRight size={18} />
        </div>
      </div>
    </Link>
  );
};
export default ServiceCard;

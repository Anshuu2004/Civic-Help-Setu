import React from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';

const SourceCard = ({ source }) => {
  return (
    <a 
      href={source.url} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderRadius: '1rem', textDecoration: 'none', transition: 'all 0.3s ease',
        background: 'var(--glass-bg-subtle)', border: '1px solid var(--border-main)'
      }}
      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
      onMouseOut={(e) => { e.currentTarget.style.background = 'var(--glass-bg-subtle)'; e.currentTarget.style.borderColor = 'var(--border-main)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {source.verified ? (
          <CheckCircle size={20} color="var(--success)" fill="rgba(52, 211, 153, 0.1)" />
        ) : (
          <ExternalLink size={20} color="var(--text-tertiary)" />
        )}
        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '1rem' }}>{source.name}</span>
      </div>
      <ExternalLink size={16} color="var(--text-tertiary)" />
    </a>
  );
};
export default SourceCard;

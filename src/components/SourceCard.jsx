import React from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';

const SourceCard = ({ source }) => {
  return (
    <a 
      href={source.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-start gap-4 p-5 rounded-2xl border-2 border-light bg-white hover:border-accent-light hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-3">
        {source.verified ? (
          <CheckCircle size={20} style={{ color: 'var(--success)' }} />
        ) : (
          <ExternalLink size={20} className="text-muted" />
        )}
        <span className="font-medium">{source.name}</span>
      </div>
      <ExternalLink size={16} className="text-muted" />
    </a>
  );
};

export default SourceCard;

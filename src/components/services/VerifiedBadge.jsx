import React from 'react';
import { ShieldCheck } from 'lucide-react';

const VerifiedBadge = () => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.15rem 0.5rem',
        borderRadius: '999px',
        background: 'rgba(52, 211, 153, 0.15)',
        color: 'var(--success, #10b981)',
        fontSize: '0.725rem',
        fontWeight: '600'
      }}
      title="Citizen completed this civic service application"
    >
      <ShieldCheck size={12} />
      <span>Verified Applicant</span>
    </span>
  );
};

export default VerifiedBadge;

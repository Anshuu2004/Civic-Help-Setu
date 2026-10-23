import React from 'react';
import { BadgePercent, HelpCircle } from 'lucide-react';

const ConcessionEligibilityBadge = ({ onOpenCalculator }) => {
  return (
    <div
      onClick={onOpenCalculator}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.35rem 0.75rem',
        borderRadius: '999px',
        background: 'rgba(52, 211, 153, 0.12)',
        border: '1px solid rgba(52, 211, 153, 0.3)',
        color: 'var(--success, #10b981)',
        fontSize: '0.8rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      title="Click to calculate your discounted fee and concessions"
    >
      <BadgePercent size={14} />
      <span>Fee Concessions Available (BPL, PwD, Seniors, Students)</span>
      <HelpCircle size={12} style={{ opacity: 0.75 }} />
    </div>
  );
};

export default ConcessionEligibilityBadge;

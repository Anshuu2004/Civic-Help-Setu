import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

const EligibilityBadge = ({ status = 'not-checked', size = 'normal' }) => {
  const configs = {
    eligible: {
      label: 'Eligible to Apply',
      color: 'var(--success, #10b981)',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.3)',
      icon: <CheckCircle2 size={size === 'large' ? 18 : 14} />,
    },
    conditional: {
      label: 'Action / Prerequisite Needed',
      color: 'var(--warning, #f59e0b)',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)',
      icon: <AlertTriangle size={size === 'large' ? 18 : 14} />,
    },
    ineligible: {
      label: 'Criteria Not Met',
      color: 'var(--error, #ef4444)',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.3)',
      icon: <XCircle size={size === 'large' ? 18 : 14} />,
    },
    'not-checked': {
      label: 'Interactive Eligibility Available',
      color: 'var(--accent-main)',
      bg: 'rgba(56, 189, 248, 0.1)',
      border: 'rgba(56, 189, 248, 0.25)',
      icon: <HelpCircle size={size === 'large' ? 18 : 14} />,
    },
  };

  const current = configs[status] || configs['not-checked'];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: size === 'large' ? '0.35rem 0.85rem' : '0.2rem 0.6rem',
        borderRadius: '99px',
        fontSize: size === 'large' ? '0.85rem' : '0.75rem',
        fontWeight: '700',
        background: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
      }}
    >
      {current.icon}
      <span>{current.label}</span>
    </span>
  );
};

export default EligibilityBadge;

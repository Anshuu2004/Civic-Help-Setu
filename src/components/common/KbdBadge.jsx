import React from 'react';

const KbdBadge = ({ children }) => {
  return (
    <kbd
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '20px',
        height: '20px',
        padding: '0 5px',
        fontSize: '0.7rem',
        fontWeight: '700',
        fontFamily: 'monospace',
        color: 'var(--text-secondary)',
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid var(--border-light, rgba(255, 255, 255, 0.15))',
        borderBottom: '2px solid var(--border-light, rgba(255, 255, 255, 0.25))',
        borderRadius: '4px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
        lineHeight: 1
      }}
    >
      {children}
    </kbd>
  );
};

export default KbdBadge;

import React from 'react';
import { Scale, X, ArrowRight } from 'lucide-react';

const ComparisonFloatingTray = ({ comparedServices, onOpenModal, onClear, onRemove }) => {
  if (!comparedServices || comparedServices.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: 'calc(100% - 2rem)',
        maxWidth: '680px',
        animation: 'fadeInUp 0.3s ease-out'
      }}
    >
      <div
        className="card-glass"
        style={{
          padding: '0.75rem 1.25rem',
          borderRadius: '999px',
          background: 'rgba(17, 24, 39, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--accent-main, #38bdf8)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        {/* Left: Indicator & Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <div
            style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '50%',
              background: 'rgba(56, 189, 248, 0.2)',
              color: 'var(--accent-main, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Scale size={18} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.2rem 0' }}>
            {comparedServices.map(service => (
              <div
                key={service.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.25rem 0.65rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  maxWidth: '160px'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {service.title}
                </span>
                <button
                  onClick={() => onRemove(service.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '0.1rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Remove"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          <button
            onClick={onClear}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              padding: '0.35rem 0.5rem'
            }}
          >
            Clear
          </button>
          <button
            onClick={onOpenModal}
            className="btn btn-primary"
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '999px'
            }}
          >
            <span>Compare ({comparedServices.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonFloatingTray;

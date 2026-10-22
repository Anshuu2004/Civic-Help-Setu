import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle, ChevronRight, Zap } from 'lucide-react';

const EstimatedTimelineWidget = ({ processingTime = '15 working days', onOpenCalculator }) => {
  const [mode, setMode] = useState('online');

  // Parse days from string
  const match = processingTime.match(/(\d+)/);
  const baseDays = match ? parseInt(match[1], 10) : 15;
  const effectiveDays = mode === 'online' ? Math.max(3, Math.floor(baseDays * 0.8)) : baseDays;

  return (
    <div
      style={{
        background: 'var(--glass-bg-subtle, rgba(255, 255, 255, 0.02))',
        border: '1px solid var(--border-light, rgba(255, 255, 255, 0.08))',
        borderRadius: '1rem',
        padding: '1.25rem 1.5rem',
        marginTop: '1.5rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} color="var(--accent-main)" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Turnaround Timeline & Milestones
          </h4>
        </div>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', background: 'var(--glass-bg)', borderRadius: '999px', padding: '0.2rem', border: '1px solid var(--border-light)' }}>
          <button
            type="button"
            onClick={() => setMode('online')}
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              border: 'none',
              background: mode === 'online' ? 'var(--accent-main)' : 'transparent',
              color: mode === 'online' ? 'var(--bg-main)' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Online Portal (~{Math.max(3, Math.floor(baseDays * 0.8))}d)
          </button>
          <button
            type="button"
            onClick={() => setMode('counter')}
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              border: 'none',
              background: mode === 'counter' ? 'var(--accent-main)' : 'transparent',
              color: mode === 'counter' ? 'var(--bg-main)' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Physical Desk (~{baseDays}d)
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', background: 'var(--glass-bg)', borderRadius: '0.5rem', borderLeft: '3px solid var(--accent-main)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Step 1: Day 1</div>
          <div style={{ fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-primary)', marginTop: '0.2rem' }}>Filing & Receipt</div>
        </div>
        <div style={{ padding: '0.75rem', background: 'var(--glass-bg)', borderRadius: '0.5rem', borderLeft: '3px solid var(--accent-main)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Step 2: Day {Math.max(2, Math.floor(effectiveDays * 0.4))}</div>
          <div style={{ fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-primary)', marginTop: '0.2rem' }}>Scrutiny & Review</div>
        </div>
        <div style={{ padding: '0.75rem', background: 'var(--glass-bg)', borderRadius: '0.5rem', borderLeft: '3px solid var(--accent-main)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Step 3: Day {Math.max(3, Math.floor(effectiveDays * 0.75))}</div>
          <div style={{ fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-primary)', marginTop: '0.2rem' }}>Authority Signoff</div>
        </div>
        <div style={{ padding: '0.75rem', background: 'var(--glass-bg)', borderRadius: '0.5rem', borderLeft: '3px solid var(--success, #10b981)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--success, #10b981)', textTransform: 'uppercase' }}>Final: Day {effectiveDays}</div>
          <div style={{ fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-primary)', marginTop: '0.2rem' }}>Certificate Delivery</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span>Estimated completion based on state citizen charters.</span>
        {onOpenCalculator && (
          <button
            type="button"
            onClick={onOpenCalculator}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-main)',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <span>Estimate fees & fast-track options</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default EstimatedTimelineWidget;

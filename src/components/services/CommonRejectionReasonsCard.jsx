import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, AlertTriangle, Info } from 'lucide-react';
import { getRejectionReasonsForService } from '../../data/rejectionReasons';

const CommonRejectionReasonsCard = ({ serviceId, serviceCategory, serviceName }) => {
  const reasons = getRejectionReasonsForService(serviceId, serviceCategory);
  const [expandedId, setExpandedId] = useState(reasons[0]?.id || null);
  const [checkedItems, setCheckedItems] = useState({});

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const totalChecks = reasons.length;
  const passedChecks = Object.values(checkedItems).filter(Boolean).length;
  const auditPercent = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)', label: 'Critical Pitfall' };
      case 'high':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)', label: 'High Risk' };
      default:
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)', label: 'Moderate Risk' };
    }
  };

  return (
    <div 
      className="card"
      style={{
        border: '1px solid var(--border-main)',
        background: 'var(--bg-surface, var(--bg-main))',
        borderRadius: '1rem',
        padding: '1.75rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-main)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
              Rejection Prevention Guide
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Avoid the top reasons government offices reject {serviceName || 'this service'} applications
            </p>
          </div>
        </div>

        {/* Audit Score Pill */}
        <div style={{ background: 'var(--glass-bg)', padding: '0.5rem 0.85rem', borderRadius: '2rem', border: '1px solid var(--border-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Pre-Submit Audit:</span>
          <span style={{ fontSize: '0.875rem', fontWeight: '700', color: auditPercent === 100 ? '#10b981' : auditPercent >= 50 ? '#f59e0b' : '#ef4444' }}>
            {passedChecks}/{totalChecks} Verified ({auditPercent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'var(--border-main)', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div 
          style={{ 
            width: `${auditPercent}%`, 
            height: '100%', 
            background: auditPercent === 100 ? '#10b981' : auditPercent >= 50 ? '#f59e0b' : '#ef4444',
            transition: 'width 0.4s ease, background 0.4s ease'
          }} 
        />
      </div>

      {/* Rejection Reasons Accordion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {reasons.map((reason) => {
          const isExpanded = expandedId === reason.id;
          const isChecked = !!checkedItems[reason.id];
          const badge = getSeverityBadge(reason.severity);

          return (
            <div 
              key={reason.id}
              style={{
                border: `1px solid ${isExpanded ? 'var(--accent-main, #3b82f6)' : 'var(--border-main)'}`,
                borderRadius: '0.75rem',
                background: isExpanded ? 'var(--glass-bg)' : 'transparent',
                transition: 'all 0.2s ease',
                overflow: 'hidden'
              }}
            >
              {/* Row Header */}
              <div 
                onClick={() => toggleExpand(reason.id)}
                style={{
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <button
                    type="button"
                    aria-label={`Verify check for ${reason.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCheck(reason.id);
                    }}
                    style={{
                      background: isChecked ? '#10b981' : 'transparent',
                      border: isChecked ? 'none' : '2px solid var(--border-main)',
                      color: isChecked ? '#fff' : 'transparent',
                      width: '1.35rem',
                      height: '1.35rem',
                      borderRadius: '0.35rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <CheckCircle2 size={14} style={{ color: isChecked ? '#fff' : 'var(--text-tertiary)' }} />
                  </button>

                  <span style={{ fontWeight: '600', fontSize: '0.95rem', color: isChecked ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: isChecked ? 'line-through' : 'none' }}>
                    {reason.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span 
                    style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '700', 
                      padding: '0.2rem 0.55rem', 
                      borderRadius: '0.35rem', 
                      background: badge.bg, 
                      color: badge.text,
                      border: `1px solid ${badge.border}`
                    }}
                  >
                    {badge.label}
                  </span>
                  {isExpanded ? <ChevronUp size={18} color="var(--text-secondary)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div style={{ padding: '0 1rem 1rem 1rem', borderTop: '1px solid var(--border-main)', paddingTop: '0.85rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>
                        Typical Rejection Notice:
                      </strong>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontStyle: 'italic', background: 'var(--glass-bg-subtle)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', borderLeft: '3px solid #ef4444' }}>
                        "{reason.departmentNotice}"
                      </p>
                    </div>

                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>
                        Primary Root Cause:
                      </strong>
                      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                        {reason.cause}
                      </p>
                    </div>

                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <strong style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                        <CheckCircle2 size={16} /> How to Prevent / Fix:
                      </strong>
                      <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {reason.prevention}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        Frequency: <strong>{reason.frequency}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleCheck(reason.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        {isChecked ? 'Unmark Audit Check' : 'Mark as Verified ✓'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommonRejectionReasonsCard;

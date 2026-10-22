import React, { useState } from 'react';
import { X, Trash2, ExternalLink, Printer, Plus, Scale, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { comparisonService } from '../../services/comparisonService';
import { services } from '../../data/services';

const ServiceComparisonModal = ({ isOpen, onClose, comparedServices, onUpdateList }) => {
  const [highlightDiffs, setHighlightDiffs] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState('');

  if (!isOpen) return null;

  const matrix = comparisonService.buildComparisonMatrix(comparedServices);

  const handleRemove = (id) => {
    const updated = comparisonService.removeService(id);
    onUpdateList(comparedServices.filter(s => s.id !== id));
  };

  const handleAdd = (e) => {
    const id = e.target.value;
    if (!id) return;
    const res = comparisonService.addService(id);
    if (res.success) {
      onUpdateList(comparisonService.getComparedServices());
      setSelectedToAdd('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Find services not yet in comparison
  const availableServices = services.filter(
    s => !comparedServices.some(cs => cs.id === s.id)
  );

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
    >
      <div 
        className="card-glass animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '1080px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '1.25rem',
          background: 'var(--bg-card, #111827)',
          border: '1px solid var(--border-light, rgba(255, 255, 255, 0.1))',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-light, rgba(255, 255, 255, 0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--glass-bg, rgba(255, 255, 255, 0.02))'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div 
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.75rem',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--accent-main, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Scale size={20} />
            </div>
            <div>
              <h2 id="compare-modal-title" style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Side-by-Side Service Comparison
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Comparing {comparedServices.length} civic services to evaluate fees, requirements, and turnaround.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
              title="Print Comparison"
            >
              <Printer size={16} />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.5rem'
              }}
              aria-label="Close Comparison"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div 
          style={{
            padding: '0.75rem 1.75rem',
            background: 'var(--glass-bg-subtle, rgba(255, 255, 255, 0.01))',
            borderBottom: '1px solid var(--border-light, rgba(255, 255, 255, 0.05))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <input 
              type="checkbox"
              checked={highlightDiffs}
              onChange={(e) => setHighlightDiffs(e.target.checked)}
              style={{ accentColor: 'var(--accent-main)' }}
            />
            <span>Highlight distinct differences</span>
          </label>

          {comparedServices.length < 3 && availableServices.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} color="var(--accent-main)" />
              <select
                value={selectedToAdd}
                onChange={handleAdd}
                style={{
                  background: 'var(--glass-bg, #1f2937)',
                  border: '1px solid var(--border-light, rgba(255, 255, 255, 0.15))',
                  borderRadius: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="">+ Add service to compare...</option>
                {availableServices.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.department || s.category})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Content Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem' }}>
          {comparedServices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <Scale size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
              <p>No services selected for comparison.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Select up to 3 services from the directory to view side-by-side specs.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '220px', padding: '1rem', textAlign: 'left', borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                      Comparison Feature
                    </th>
                    {comparedServices.map(service => (
                      <th 
                        key={service.id} 
                        style={{
                          padding: '1rem',
                          textAlign: 'left',
                          borderBottom: '2px solid var(--border-light)',
                          background: 'var(--glass-bg-subtle)',
                          borderRadius: '0.75rem 0.75rem 0 0',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                              {service.title}
                            </h3>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-main)', fontWeight: '600' }}>
                              {service.category}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemove(service.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              padding: '0.25rem'
                            }}
                            title="Remove from comparison"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row, idx) => {
                    const isDifferent = new Set(row.values).size > 1;
                    const rowBg = highlightDiffs && isDifferent ? 'rgba(56, 189, 248, 0.08)' : 'transparent';

                    return (
                      <tr key={idx} style={{ background: rowBg, transition: 'background 0.2s' }}>
                        <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-light)', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {row.attribute}
                        </td>
                        {row.values.map((val, colIdx) => (
                          <td 
                            key={colIdx} 
                            style={{
                              padding: '0.85rem 1rem',
                              borderBottom: '1px solid var(--border-light)',
                              color: 'var(--text-secondary)',
                              fontSize: '0.875rem',
                              background: highlightDiffs && isDifferent ? 'rgba(56, 189, 248, 0.04)' : 'transparent'
                            }}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  <tr>
                    <td style={{ padding: '1.25rem 1rem', borderBottom: 'none', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Quick Actions
                    </td>
                    {comparedServices.map(service => (
                      <td key={service.id} style={{ padding: '1.25rem 1rem', borderBottom: 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <Link
                            to={`/services/${service.id}`}
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem', textAlign: 'center', textDecoration: 'none' }}
                            onClick={onClose}
                          >
                            View Full Service Guide
                          </Link>
                          {service.onlinePortalUrl && (
                            <a
                              href={service.onlinePortalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline"
                              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', textDecoration: 'none' }}
                            >
                              <span>Official Portal</span>
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceComparisonModal;

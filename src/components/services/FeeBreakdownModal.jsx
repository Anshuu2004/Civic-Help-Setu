import React, { useState } from 'react';
import { X, Calculator, Check, Printer, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { APPLICANT_CATEGORIES, PROCESSING_TIERS } from '../../data/feeConcessionRules';
import { feeCalculatorService } from '../../services/feeCalculatorService';

const FeeBreakdownModal = ({ isOpen, onClose, service }) => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedTier, setSelectedTier] = useState('standard');
  const [includeNotary, setIncludeNotary] = useState(false);
  const [includeDelivery, setIncludeDelivery] = useState(true);

  if (!isOpen) return null;

  const rawFee = service?.fees || service?.fee || '₹100';
  const calculation = feeCalculatorService.calculateBreakdown({
    baseFeeRaw: rawFee,
    categoryId: selectedCategory,
    tierId: selectedTier,
    includeNotary,
    includeDelivery
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fee-calculator-title"
    >
      <div
        className="card-glass animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '620px',
          borderRadius: '1.25rem',
          background: 'var(--bg-card, #111827)',
          border: '1px solid var(--border-light, rgba(255, 255, 255, 0.1))',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
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
            background: 'var(--glass-bg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.75rem',
                background: 'rgba(52, 211, 153, 0.15)',
                color: 'var(--success, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Calculator size={20} />
            </div>
            <div>
              <h2 id="fee-calculator-title" style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Statutory Fee & Concession Calculator
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {service ? service.name : 'Public Service Cost Estimator'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
              title="Print Fee Estimate Slip"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem 1.75rem', maxHeight: '75vh', overflowY: 'auto' }}>
          {/* Controls Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Applicant Category (Welfare / Concession Eligibility)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.5rem',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              >
                {APPLICANT_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label} ({cat.discountRate > 0 ? `${cat.discountRate * 100}% Exemption` : 'Standard'})
                  </option>
                ))}
              </select>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                {calculation.category.description}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Processing Speed Tier
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {PROCESSING_TIERS.slice(0, 2).map(tier => {
                  const isSelected = selectedTier === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedTier(tier.id)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--glass-bg)',
                        border: isSelected ? '1px solid var(--accent-main)' : '1px solid var(--border-light)',
                        color: isSelected ? 'var(--accent-main)' : 'var(--text-primary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{tier.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {tier.extraCharge > 0 ? `+ ₹${tier.extraCharge} surcharge` : 'No additional charge'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '0.75rem', background: 'var(--glass-bg-subtle)', borderRadius: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeNotary}
                  onChange={(e) => setIncludeNotary(e.target.checked)}
                  style={{ accentColor: 'var(--accent-main)' }}
                />
                <span>Include Estimated Notary / Stamp Paper Fee (+₹100)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeDelivery}
                  onChange={(e) => setIncludeDelivery(e.target.checked)}
                  style={{ accentColor: 'var(--accent-main)' }}
                />
                <span>Include Speed Post Physical Dispatch (+₹50)</span>
              </label>
            </div>
          </div>

          {/* Itemized Invoice Receipt */}
          <div
            style={{
              padding: '1.25rem',
              background: 'var(--glass-bg)',
              borderRadius: '1rem',
              border: '1px solid var(--border-light)'
            }}
          >
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="var(--accent-main)" />
              <span>Estimated Cost Breakdown</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Standard Statutory Base Fee</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>₹{calculation.baseFee}</span>
              </div>

              {calculation.totalSavings > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success, #10b981)' }}>
                  <span>Welfare Concession ({calculation.category.label})</span>
                  <span style={{ fontWeight: '600' }}>- ₹{calculation.totalSavings}</span>
                </div>
              )}

              {calculation.convenienceCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Portal Maintenance & Verification Surcharge</span>
                  <span>₹{calculation.convenienceCharge}</span>
                </div>
              )}

              {calculation.expressCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Tatkaal / Expedited Surcharge</span>
                  <span>₹{calculation.expressCharge}</span>
                </div>
              )}

              {calculation.notaryCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Notary & Self-Attestation Stamping</span>
                  <span>₹{calculation.notaryCharge}</span>
                </div>
              )}

              {calculation.deliveryCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>India Post Registered Dispatch</span>
                  <span>₹{calculation.deliveryCharge}</span>
                </div>
              )}

              <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.5rem 0' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '1.15rem', fontWeight: '800' }}>
                <span style={{ color: 'var(--text-primary)' }}>Total Estimated Out-of-Pocket:</span>
                <span style={{ color: 'var(--accent-main)', fontSize: '1.35rem' }}>₹{calculation.totalPayable}</span>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '1.25rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
            <span>
              Disclaimer: Statutory government fees are subject to state Gazette notifications. Concession applicants must present a valid BPL card, PwD UDID, or Senior Citizen proof during physical counter submission.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeBreakdownModal;

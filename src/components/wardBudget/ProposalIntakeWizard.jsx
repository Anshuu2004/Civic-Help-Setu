import { useState } from 'react';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import {
  PROPOSAL_CATEGORIES,
  checkForForbiddenPII,
  validateProposalPayload,
} from '../../data/wardBudgetContract.js';
import { findDuplicateCandidates } from '../../services/proposalClusteringService.js';

export default function ProposalIntakeWizard({
  isOpen,
  onClose,
  onSubmitProposal,
  existingProposals = [],
  currentWard = 'Ward 150 - Bellandur',
  isOffline = false,
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: 'roads_footpaths',
    ward: currentWard,
    approximateLocation: '',
    description: '',
    costMin: '500000',
    costMax: '800000',
    costBasis: 'BBMP Schedule of Rates for pedestrian walkway repairs',
    evidenceLabel: '',
    evidenceUrl: '',
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [duplicateAssessment, setDuplicateAssessment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const handleNext = () => {
    // Step validation
    const errors = [];
    if (step === 1) {
      if (!formData.title || formData.title.trim().length < 10) {
        errors.push('Proposal title must be at least 10 characters.');
      }
      const piiTitle = checkForForbiddenPII(formData.title);
      if (piiTitle) errors.push(`Title ${piiTitle}`);
    } else if (step === 2) {
      if (!formData.approximateLocation || formData.approximateLocation.trim().length < 5) {
        errors.push('Approximate location or landmark must be at least 5 characters.');
      }
      if (!formData.description || formData.description.trim().length < 30) {
        errors.push('Description of public utility must be at least 30 characters.');
      }
      const piiDesc = checkForForbiddenPII(formData.description);
      if (piiDesc) errors.push(`Description ${piiDesc}`);
    } else if (step === 3) {
      const min = Number(formData.costMin);
      const max = Number(formData.costMax);
      if (Number.isNaN(min) || Number.isNaN(max) || min <= 0 || max < min) {
        errors.push('Valid cost range is required (max >= min > 0).');
      } else if (max > 50000000) {
        errors.push('Proposal cost exceeds the ₹5 Crore municipal ward cap.');
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    // When moving to step 4 or 5, compute duplicate suggestions
    if (step === 3) {
      const assessment = findDuplicateCandidates(
        {
          title: formData.title,
          category: formData.category,
          ward: formData.ward,
          approximateLocation: formData.approximateLocation,
          description: formData.description,
        },
        existingProposals
      );
      setDuplicateAssessment(assessment);
    }

    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setValidationErrors([]);
    setStep((s) => s - 1);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setValidationErrors([]);

    const payload = {
      title: formData.title,
      category: formData.category,
      ward: formData.ward,
      approximateLocation: formData.approximateLocation,
      description: formData.description,
      costEstimateRange: {
        min: Number(formData.costMin),
        max: Number(formData.costMax),
        basis: formData.costBasis,
      },
      supportingEvidence: formData.evidenceLabel
        ? [
            {
              id: `EV-${Date.now()}`,
              label: formData.evidenceLabel,
              sourceUrl: formData.evidenceUrl || 'https://civic-data.gov.in/uploads/survey.pdf',
              type: 'citizen_upload',
            },
          ]
        : [],
    };

    const clientErrors = validateProposalPayload(payload);
    if (clientErrors.length > 0) {
      setValidationErrors(clientErrors);
      setSubmitting(false);
      return;
    }

    try {
      await onSubmitProposal(payload);
      onClose();
    } catch (err) {
      setValidationErrors([err.message || 'Failed to submit proposal.']);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: '1rem',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="intake-wizard-title"
    >
      <div
        className="modal-content"
        style={{
          background: 'var(--bg-card, #ffffff)',
          color: 'var(--text-primary, #0f172a)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-main, #2563eb)' }}>
              Step {step} of 4 • Citizen Proposal Intake
            </span>
            <h2 id="intake-wizard-title" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
              {step === 1 && 'Basic Title & Municipal Category'}
              {step === 2 && 'Location & Scope of Improvement'}
              {step === 3 && 'Cost Range & Estimation Basis'}
              {step === 4 && 'Duplicate Review & Final Submission'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
            aria-label="Cancel proposal intake"
          >
            ✕
          </button>
        </div>

        {/* Wizard Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {isOffline && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 0.8rem',
                borderRadius: '0.375rem',
                background: '#fef3c7',
                color: '#92400e',
                fontSize: '0.8rem',
                marginBottom: '1rem',
              }}
            >
              <AlertTriangle size={16} />
              <span>You are currently offline. Your proposal will be securely queued locally and synced when connection returns.</span>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Proposal Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Pedestrian Walkway Restoration and Tactile Paving on 14th Main"
                  maxLength={120}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>10-120 characters</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Civic Works Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                >
                  {Object.entries(PROPOSAL_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.label} — {cat.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Designated Ward Jurisdiction *
                </label>
                <input
                  type="text"
                  value={formData.ward}
                  onChange={(e) => handleChange('ward', e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Approximate Street Address / Landmark *
                </label>
                <input
                  type="text"
                  value={formData.approximateLocation}
                  onChange={(e) => handleChange('approximateLocation', e.target.value)}
                  placeholder="e.g. 14th Main Road between Green Glen Layout & ORR Underpass"
                  maxLength={200}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Public Benefit &amp; Scope of Works *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Detail the issue, who is affected (e.g., pedestrians, senior citizens), and what specific civil improvements are needed (do NOT include personal phone or identity numbers)..."
                  maxLength={2000}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', resize: 'vertical' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Minimum 30 characters</span>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Estimated Minimum (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="10000"
                    max="50000000"
                    step="10000"
                    value={formData.costMin}
                    onChange={(e) => handleChange('costMin', e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Estimated Maximum (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="10000"
                    max="50000000"
                    step="10000"
                    value={formData.costMax}
                    onChange={(e) => handleChange('costMax', e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Cost Basis / Estimation Source
                </label>
                <input
                  type="text"
                  value={formData.costBasis}
                  onChange={(e) => handleChange('costBasis', e.target.value)}
                  placeholder="e.g. Municipal Schedule of Rates 2025-26 or quotation by local contractor"
                  maxLength={300}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                  Supporting Document or Photo Survey (Optional)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input
                    type="text"
                    value={formData.evidenceLabel}
                    onChange={(e) => handleChange('evidenceLabel', e.target.value)}
                    placeholder="Document Label (e.g. Photo Survey of Potholes)"
                    style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.82rem' }}
                  />
                  <input
                    type="text"
                    value={formData.evidenceUrl}
                    onChange={(e) => handleChange('evidenceUrl', e.target.value)}
                    placeholder="URL or file reference"
                    style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-light)', fontSize: '0.82rem' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: DUPLICATE CLUSTERING & CONFIRMATION */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {duplicateAssessment && duplicateAssessment.candidates.length > 0 ? (
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <Sparkles size={16} color="#2563eb" />
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1e40af' }}>
                      Duplicate Clustering Notice ({duplicateAssessment.candidates.length} potential matches found)
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#1e3a8a', margin: '0 0 0.75rem 0' }}>
                    Similar proposals exist in your ward. Reviewing them helps consolidate citizen votes so the Ward Committee prioritizes a unified project.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {duplicateAssessment.candidates.map((cand) => (
                      <div
                        key={cand.proposalId}
                        style={{
                          padding: '0.6rem 0.8rem',
                          borderRadius: '0.375rem',
                          background: '#ffffff',
                          border: '1px solid #93c5fd',
                          fontSize: '0.82rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span>{cand.title}</span>
                          <span style={{ color: '#2563eb' }}>{cand.similarityScore}% match</span>
                        </div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                          Factors: {cand.influencingFactors.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '0.85rem',
                    borderRadius: '0.5rem',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    fontSize: '0.85rem',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <CheckCircle size={18} />
                  <span>No duplicate proposals detected in this location category. Ready for fresh submission!</span>
                </div>
              )}

              {/* Review Summary */}
              <div style={{ padding: '0.85rem', borderRadius: '0.5rem', background: 'var(--bg-tag)', fontSize: '0.85rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.88rem', fontWeight: 700 }}>
                  Submission Summary
                </h4>
                <p style={{ margin: '0 0 0.25rem 0' }}><strong>Title:</strong> {formData.title}</p>
                <p style={{ margin: '0 0 0.25rem 0' }}><strong>Category:</strong> {PROPOSAL_CATEGORIES[formData.category]?.label}</p>
                <p style={{ margin: '0 0 0.25rem 0' }}><strong>Location:</strong> {formData.approximateLocation} ({formData.ward})</p>
                <p style={{ margin: 0 }}><strong>Cost Estimate:</strong> ₹{Number(formData.costMin).toLocaleString('en-IN')} - ₹{Number(formData.costMax).toLocaleString('en-IN')}</p>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', margin: 0 }}>
                By submitting, you confirm that these works benefit public civic infrastructure and contain no personal contact or financial identifiers.
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-tag, #f8fafc)',
          }}
        >
          {step > 1 ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleBack}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ fontSize: '0.85rem' }}>
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}
            >
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              className="btn btn-primary"
              onClick={handleFinalSubmit}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}
            >
              <CheckCircle size={14} />
              <span>{submitting ? 'Submitting Proposal...' : 'Publish to Deliberation'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

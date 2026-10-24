import { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, CheckCircle2, ExternalLink, Flag, Info, Loader2 } from 'lucide-react';
import {
  submitOutdatedReport,
  validateReportInput,
  ISSUE_CATEGORIES,
  ISSUE_CATEGORY_LABELS,
} from '../../services/reportService';

const ReportOutdatedInfoModal = ({ isOpen, onClose, service, initialUserEmail = '' }) => {
  const [formData, setFormData] = useState({
    issueCategory: ISSUE_CATEGORIES.FEES_CHANGED,
    description: '',
    officialSourceUrl: '',
    reporterEmail: initialUserEmail || '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        issueCategory: ISSUE_CATEGORIES.FEES_CHANGED,
        description: '',
        officialSourceUrl: '',
        reporterEmail: initialUserEmail || '',
      });
      setErrors({});
      setSubmitResult(null);
      setIsSubmitting(false);

      // Focus management
      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, initialUserEmail]);

  // Keyboard navigation: Escape closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      serviceId: service.id,
      serviceName: service.name,
      ...formData,
    };

    const validation = validateReportInput(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    // Simulate natural processing delay
    setTimeout(() => {
      const res = submitOutdatedReport(payload);
      setIsSubmitting(false);
      if (res.ok) {
        setSubmitResult({
          ok: true,
          referenceId: res.referenceId,
          message: res.message,
        });
      } else {
        setErrors({ form: res.message || 'Submission failed. Please check inputs.' });
      }
    }, 400);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      ref={modalRef}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '620px',
          background: 'var(--bg-main, #0f172a)',
          border: '1px solid var(--border-main)',
          borderRadius: '1.25rem',
          padding: '2rem',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close report dialog"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'var(--glass-bg)',
            border: 'none',
            color: 'var(--text-secondary)',
            padding: '0.5rem',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <X size={20} />
        </button>

        {!submitResult ? (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Flag size={24} />
              </div>
              <div>
                <h3 id="report-modal-title" style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  Report Outdated or Inaccurate Information
                </h3>
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Help keep this public guide accurate for all citizens.
                </p>
              </div>
            </div>

            {/* Service Banner */}
            <div
              style={{
                background: 'var(--glass-bg, rgba(255,255,255,0.04))',
                border: '1px solid var(--border-main)',
                padding: '0.85rem 1.15rem',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: '700', letterSpacing: '0.5px' }}>
                  Target Civic Guide
                </span>
                <p style={{ margin: '0.2rem 0 0 0', fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem' }}>
                  {service.name}
                </p>
              </div>
              {service.category && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '99px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-main)',
                    color: 'var(--accent-main)',
                    fontWeight: '600',
                  }}
                >
                  {service.category}
                </span>
              )}
            </div>

            {/* Error Banner */}
            {errors.form && (
              <div
                role="alert"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertTriangle size={18} />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Category Selector */}
              <div>
                <label
                  htmlFor="report-category"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}
                >
                  Discrepancy Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  id="report-category"
                  ref={firstInputRef}
                  value={formData.issueCategory}
                  onChange={(e) => handleChange('issueCategory', e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  {Object.entries(ISSUE_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value} style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.issueCategory && (
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>
                    {errors.issueCategory}
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label htmlFor="report-description" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Detailed Discrepancy Description <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: formData.description.length > 1500 ? '#ef4444' : 'var(--text-tertiary)',
                    }}
                  >
                    {formData.description.length} / 1500 chars
                  </span>
                </div>
                <textarea
                  id="report-description"
                  rows={4}
                  className="input-field"
                  placeholder="Explain what has changed (e.g., 'The processing fee was increased from ₹150 to ₹250 as per latest municipal circular. Also, physical xerox is no longer needed')."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  style={{
                    width: '100%',
                    resize: 'vertical',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    borderColor: errors.description ? '#ef4444' : undefined,
                  }}
                  required
                />
                {errors.description ? (
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>
                    {errors.description}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', display: 'block' }}>
                    Minimum 10 characters. Avoid providing private personal information.
                  </span>
                )}
              </div>

              {/* Optional Official Source URL */}
              <div>
                <label
                  htmlFor="report-source-url"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}
                >
                  <span>Official Gazette / Government Source Link <span style={{ fontWeight: '400', color: 'var(--text-tertiary)' }}>(Optional)</span></span>
                  <ExternalLink size={14} color="var(--text-tertiary)" />
                </label>
                <input
                  id="report-source-url"
                  type="url"
                  className="input-field"
                  placeholder="https://official.department.gov.in/notification-2026.pdf"
                  value={formData.officialSourceUrl}
                  onChange={(e) => handleChange('officialSourceUrl', e.target.value)}
                  style={{
                    width: '100%',
                    fontSize: '0.875rem',
                    borderColor: errors.officialSourceUrl ? '#ef4444' : undefined,
                  }}
                />
                {errors.officialSourceUrl ? (
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>
                    {errors.officialSourceUrl}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', display: 'block' }}>
                    Provide an official government portal or gazette URL supporting your correction.
                  </span>
                )}
              </div>

              {/* Optional Email */}
              <div>
                <label
                  htmlFor="report-email"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}
                >
                  Your Email for Status Notification <span style={{ fontWeight: '400', color: 'var(--text-tertiary)' }}>(Optional)</span>
                </label>
                <input
                  id="report-email"
                  type="email"
                  className="input-field"
                  placeholder="citizen@example.com (optional)"
                  value={formData.reporterEmail}
                  onChange={(e) => handleChange('reporterEmail', e.target.value)}
                  style={{
                    width: '100%',
                    fontSize: '0.875rem',
                    borderColor: errors.reporterEmail ? '#ef4444' : undefined,
                  }}
                />
                {errors.reporterEmail ? (
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>
                    {errors.reporterEmail}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', display: 'block' }}>
                    Privacy notice: Your email is used solely to notify you when moderators resolve this issue.
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid var(--border-main)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '0.65rem 1.5rem',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#ef4444',
                    borderColor: '#ef4444',
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit Verification Report'
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Submission Success State with verifiable reference ID */
          <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
              }}
            >
              <CheckCircle2 size={40} />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Report Logged Successfully
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 1.5rem auto', lineHeight: '1.6' }}>
              Your report for <strong>{service.name}</strong> has been assigned to our civic verification queue.
            </p>

            <div
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-main)',
                padding: '1.25rem',
                borderRadius: '0.85rem',
                marginBottom: '1.75rem',
                maxWidth: '400px',
                margin: '0 auto 1.75rem auto',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                Verifiable Reference Token
              </span>
              <p style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-main)', margin: '0.4rem 0 0 0' }}>
                {submitResult.referenceId}
              </p>
            </div>

            <div
              style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '0.75rem',
                padding: '0.85rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                textAlign: 'left',
              }}
            >
              <Info size={18} color="#3b82f6" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                Moderators cross-reference reports against departmental gazettes. Upon verification, the guide's Last Verified timestamp and details will update automatically.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
            >
              Done & Return to Guide
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportOutdatedInfoModal;

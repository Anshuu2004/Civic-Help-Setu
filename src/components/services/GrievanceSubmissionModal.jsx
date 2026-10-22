import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Copy, Check, Clock, Send } from 'lucide-react';
import { grievanceService } from '../../services/grievanceService';

const GrievanceSubmissionModal = ({ isOpen, onClose, service }) => {
  const [category, setCategory] = useState('Processing Delay / SLA Exceeded');
  const [urgency, setUrgency] = useState('medium');
  const [description, setDescription] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [contact, setContact] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const ticket = grievanceService.submitGrievance({
      serviceId: service?.id || 'general',
      serviceTitle: service?.title || 'General Civic Service',
      category,
      urgency,
      description,
      citizenName,
      contact
    });

    setSubmittedTicket(ticket);
  };

  const handleCopyId = () => {
    if (!submittedTicket) return;
    navigator.clipboard.writeText(submittedTicket.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetAndClose = () => {
    setSubmittedTicket(null);
    setDescription('');
    setCitizenName('');
    setContact('');
    onClose();
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
      aria-labelledby="grievance-title"
    >
      <div
        className="card-glass animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '580px',
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
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--error, #ef4444)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 id="grievance-title" style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Citizen Grievance Redressal
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {service ? `Filing for: ${service.title}` : 'Public Service Escalation Portal'}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
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

        {/* Body */}
        <div style={{ padding: '1.5rem 1.75rem', maxHeight: '75vh', overflowY: 'auto' }}>
          {submittedTicket ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '50%',
                  background: 'rgba(52, 211, 153, 0.15)',
                  color: 'var(--success, #10b981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto'
                }}
              >
                <CheckCircle size={32} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Grievance Lodged Successfully
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Your ticket has been queued with civic oversight. You can track this reference number anytime.
              </p>

              {/* Reference ID Pill */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  background: 'var(--glass-bg)',
                  border: '1px dashed var(--accent-main)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Tracking Reference ID
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    {submittedTicket.id}
                  </div>
                </div>
                <button
                  onClick={handleCopyId}
                  className="btn btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                >
                  {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                <Clock size={16} color="var(--accent-main)" />
                <span>Target Resolution Window: ~{submittedTicket.expectedResolutionDays} Working Days</span>
              </div>

              <button
                onClick={handleResetAndClose}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.65rem' }}
              >
                Done & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Issue Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                  required
                >
                  <option value="Processing Delay / SLA Exceeded">Processing Delay / SLA Exceeded</option>
                  <option value="Demanding Unofficial / Extra Fees">Demanding Unofficial / Extra Fees</option>
                  <option value="Unjustified Document Rejection">Unjustified Document Rejection</option>
                  <option value="Officer Absenteeism / Counter Closed">Officer Absenteeism / Counter Closed</option>
                  <option value="Technical / Portal Error">Technical / Portal Error</option>
                  <option value="Staff Misbehavior / Rude Conduct">Staff Misbehavior / Rude Conduct</option>
                  <option value="Other Civic Feedback">Other Civic Feedback</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Urgency Priority
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
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
                    <option value="low">Low (Standard Feedback)</option>
                    <option value="medium">Medium (Pending Application)</option>
                    <option value="high">High (Urgent Escalation)</option>
                    <option value="critical">Critical (Harassment / Extortion)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Citizen Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="Leave blank for anonymous"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '0.5rem',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--border-light)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Contact (Mobile / Email for Updates)
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. 9876543210 or email@domain.com"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Grievance Details *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the issue in detail, including office name, date of visit, or application reference if applicable..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="btn btn-outline"
                  style={{ padding: '0.6rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem' }}
                >
                  <Send size={16} />
                  <span>Submit Grievance</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrievanceSubmissionModal;

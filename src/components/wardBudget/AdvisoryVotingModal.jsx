import { useState } from 'react';
import { ThumbsUp, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdvisoryVotingModal({
  isOpen,
  onClose,
  proposal,
  onConfirmVote,
  alreadyVoted = false,
  currentUser = {},
}) {
  const [citizenIdInput, setCitizenIdInput] = useState(currentUser.id || 'CIT-RESIDENT-01');
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen || !proposal) return null;

  const handleVote = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await onConfirmVote(proposal.id, citizenIdInput);
      setReceipt(res);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record advisory vote.');
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
        zIndex: 1060,
        padding: '1rem',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="voting-modal-title"
    >
      <div
        className="modal-content"
        style={{
          background: 'var(--bg-card, #ffffff)',
          color: 'var(--text-primary, #0f172a)',
          width: '100%',
          maxWidth: '520px',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ThumbsUp size={18} color="#2563eb" />
            <h3 id="voting-modal-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              Citizen Advisory Ballot
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
            aria-label="Close vote modal"
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {receipt ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700 }}>
                Advisory Vote Recorded!
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Thank you for participating in your ward’s civic budgeting. Your endorsement has been verified with a cryptographic seal.
              </p>
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  background: 'var(--bg-tag)',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  wordBreak: 'break-all',
                }}
              >
                <div><strong>Ballot Receipt:</strong> {receipt.voteReceipt}</div>
                <div><strong>Voter Seal Hash:</strong> {receipt.voterHash}</div>
              </div>
              <button type="button" className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
                Return to Proposals
              </button>
            </div>
          ) : (
            <form onSubmit={handleVote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  padding: '0.85rem',
                  borderRadius: '0.5rem',
                  background: 'var(--bg-tag, #f8fafc)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Proposal Under Ballot
                </span>
                <h4 style={{ margin: '0.25rem 0', fontSize: '0.95rem', fontWeight: 700 }}>
                  {proposal.title}
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {proposal.ward} • {proposal.approximateLocation}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  background: '#fef3c7',
                  color: '#92400e',
                  fontSize: '0.8rem',
                  lineHeight: 1.4,
                }}
              >
                <Shield size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Statutory Notice:</strong> Citizen voting on this platform is advisory to the Ward Committee under Section 13B of the Municipal Corporation Act. Final resource allocation is subject to statutory technical audit.
                </div>
              </div>

              {alreadyVoted ? (
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    background: '#f0fdf4',
                    color: '#166534',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <CheckCircle size={16} />
                  <span>You have already cast your advisory vote for this proposal.</span>
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Citizen Voter Identifier / EPIC Registration
                    </label>
                    <input
                      type="text"
                      value={citizenIdInput}
                      onChange={(e) => setCitizenIdInput(e.target.value)}
                      placeholder="e.g. EPIC Voter ID / Registered Citizen ID"
                      required
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Used strictly to create a salted one-way hash preventing ballot manipulation. Never exposed publicly.
                    </span>
                  </div>

                  {errorMsg && (
                    <div
                      style={{
                        padding: '0.6rem',
                        borderRadius: '0.375rem',
                        background: '#fef2f2',
                        color: '#b91c1c',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <AlertCircle size={14} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !citizenIdInput.trim()}
                      className="btn btn-primary"
                    >
                      {submitting ? 'Recording Vote...' : 'Confirm Advisory Vote'}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

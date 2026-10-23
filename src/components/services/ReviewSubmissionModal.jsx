import React, { useState } from 'react';
import { X, Star, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { reviewStorage } from '../../services/reviewStorage';

const ReviewSubmissionModal = ({ isOpen, onClose, service, onReviewAdded }) => {
  const [rating, setRating] = useState(5);
  const [easeRating, setEaseRating] = useState(5);
  const [speedRating, setSpeedRating] = useState(4);
  const [staffRating, setStaffRating] = useState(5);
  const [waitTime, setWaitTime] = useState('1 hr');
  const [citizenName, setCitizenName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [tips, setTips] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    reviewStorage.addReview({
      serviceId: service?.id,
      citizenName,
      rating,
      easeRating,
      speedRating,
      staffRating,
      waitTimeHours: waitTime,
      reviewText,
      tips
    });

    setSubmitted(true);
    if (onReviewAdded) onReviewAdded();

    setTimeout(() => {
      setSubmitted(false);
      setReviewText('');
      setTips('');
      onClose();
    }, 1500);
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
      aria-labelledby="review-modal-title"
    >
      <div
        className="card-glass animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
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
                background: 'rgba(251, 191, 36, 0.15)',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Star size={20} fill="currentColor" />
            </div>
            <div>
              <h2 id="review-modal-title" style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Citizen Experience & Review
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {service ? service.name : 'Public Service Review'}
              </p>
            </div>
          </div>

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

        {/* Form Body */}
        <div style={{ padding: '1.5rem 1.75rem', maxHeight: '75vh', overflowY: 'auto' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <CheckCircle size={48} color="var(--success, #10b981)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Thank You, Citizen!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Your review and practical advice will help fellow citizens navigate this service smoothly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Overall Star Rating */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Overall Rating *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                    >
                      <Star
                        size={28}
                        color="#fbbf24"
                        fill={star <= rating ? '#fbbf24' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-ratings & wait time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Wait Time at Office / Portal
                  </label>
                  <select
                    value={waitTime}
                    onChange={(e) => setWaitTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '0.5rem',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--border-light)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="15-30 mins">15 - 30 minutes (Fast)</option>
                    <option value="1 hr">~1 hour</option>
                    <option value="2 hrs">~2 hours</option>
                    <option value="Half Day">Half Day (3-4 hrs)</option>
                    <option value="Multiple Visits">Multiple Visits Required</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Citizen Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="e.g. Ramesh K. (or anonymous)"
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '0.5rem',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--border-light)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Your Experience Details *
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                  placeholder="How was the document check? Were the officials helpful? Any delays?"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '0.5rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Citizen Pro Tip */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Pro Tip for Future Applicants (Optional)
                </label>
                <input
                  type="text"
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                  placeholder="e.g. Take blue pen and 2 copies of electricity bill"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '0.5rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={onClose}
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
                  <span>Post Review</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmissionModal;

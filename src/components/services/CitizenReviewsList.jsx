import React, { useState } from 'react';
import { Star, ThumbsUp, Clock, Lightbulb, MessageSquare } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import { reviewStorage } from '../../services/reviewStorage';

const CitizenReviewsList = ({ reviews, onReviewUpdated }) => {
  const [filterRating, setFilterRating] = useState('all');
  const [upvotedIds, setUpvotedIds] = useState(new Set());

  const handleUpvote = (id) => {
    if (upvotedIds.has(id)) return;
    reviewStorage.upvoteReview(id);
    setUpvotedIds(prev => new Set([...prev, id]));
    if (onReviewUpdated) onReviewUpdated();
  };

  const filtered = filterRating === 'all'
    ? reviews
    : reviews.filter(r => Math.round(r.rating) === parseInt(filterRating, 10));

  if (!reviews || reviews.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
        <MessageSquare size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
        <p>No citizen reviews submitted yet for this service.</p>
        <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Be the first citizen to share advice and wait time expectations!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {['all', '5', '4', '3'].map((val) => {
          const isSelected = filterRating === val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => setFilterRating(val)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                border: isSelected ? '1px solid var(--accent-main)' : '1px solid var(--border-light)',
                background: isSelected ? 'var(--accent-main)' : 'var(--glass-bg)',
                color: isSelected ? 'var(--bg-main)' : 'var(--text-secondary)',
                fontSize: '0.825rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {val === 'all' ? `All Reviews (${reviews.length})` : `${val} Stars`}
            </button>
          );
        })}
      </div>

      {/* Reviews Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filtered.map((rev) => {
          const isUpvoted = upvotedIds.has(rev.id);

          return (
            <div
              key={rev.id}
              className="card-glass"
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: '1rem',
                border: '1px solid var(--border-light, rgba(255, 255, 255, 0.08))',
                background: 'var(--glass-bg, rgba(255, 255, 255, 0.02))'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {rev.citizenName}
                    </span>
                    {rev.verified && <VerifiedBadge />}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Reviewed on {rev.date}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', color: '#fbbf24' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={15}
                        fill={s <= rev.rating ? '#fbbf24' : 'none'}
                        color="#fbbf24"
                      />
                    ))}
                  </div>

                  {rev.waitTimeHours && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(56, 189, 248, 0.1)',
                        color: 'var(--accent-main)',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}
                    >
                      <Clock size={12} />
                      <span>{rev.waitTimeHours} wait</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Text */}
              <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '0.85rem' }}>
                {rev.reviewText}
              </p>

              {/* Citizen Tip Box */}
              {rev.tips && (
                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(251, 191, 36, 0.08)',
                    borderLeft: '3px solid #fbbf24',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    marginBottom: '0.75rem'
                  }}
                >
                  <Lightbulb size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: '#fbbf24' }}>Citizen Tip: </strong>
                    {rev.tips}
                  </div>
                </div>
              )}

              {/* Footer: Helpful button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => handleUpvote(rev.id)}
                  disabled={isUpvoted}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    color: isUpvoted ? 'var(--success, #10b981)' : 'var(--text-secondary)',
                    cursor: isUpvoted ? 'default' : 'pointer',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.4rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <ThumbsUp size={14} fill={isUpvoted ? 'currentColor' : 'none'} />
                  <span>Helpful ({rev.upvotes || 0})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CitizenReviewsList;

import React from 'react';
import { Star, ThumbsUp, PenTool, CheckCircle } from 'lucide-react';

const RatingSummaryCard = ({ aggregate, onOpenReviewModal }) => {
  const { averageRating, totalReviews, recommendationRate, easeScore, speedScore, staffScore, distribution } = aggregate;

  return (
    <div
      style={{
        background: 'var(--glass-bg-subtle, rgba(255, 255, 255, 0.02))',
        border: '1px solid var(--border-light, rgba(255, 255, 255, 0.08))',
        borderRadius: '1.25rem',
        padding: '1.75rem',
        marginBottom: '2rem'
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', alignItems: 'center' }}>
        {/* Left: Overall Score */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <span style={{ fontSize: '3.25rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
              {averageRating}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ display: 'flex', color: '#fbbf24' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    fill={star <= Math.round(averageRating) ? '#fbbf24' : 'none'}
                    color="#fbbf24"
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Based on {totalReviews} citizen experiences
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success, #10b981)', fontSize: '0.875rem', fontWeight: '600' }}>
            <ThumbsUp size={16} />
            <span>{recommendationRate}% of citizens recommend this procedure</span>
          </div>

          <button
            onClick={onOpenReviewModal}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              fontSize: '0.9rem',
              marginTop: '0.5rem',
              width: 'fit-content'
            }}
          >
            <PenTool size={16} />
            <span>Share Your Experience</span>
          </button>
        </div>

        {/* Right: Sub-Score Indicators */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Ease of Application & Forms</span>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{easeScore} / 5</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border-light)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${(easeScore / 5) * 100}%`, height: '100%', background: 'var(--accent-main)', borderRadius: '999px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Processing Speed & Punctuality</span>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{speedScore} / 5</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border-light)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${(speedScore / 5) * 100}%`, height: '100%', background: '#38bdf8', borderRadius: '999px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Staff Support & Verification Courtesy</span>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{staffScore} / 5</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border-light)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${(staffScore / 5) * 100}%`, height: '100%', background: '#10b981', borderRadius: '999px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingSummaryCard;

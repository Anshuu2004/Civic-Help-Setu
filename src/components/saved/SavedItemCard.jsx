import { Link } from 'react-router-dom';
import { Bookmark, Calendar, Edit3, Trash2, ArrowRight, Folder } from 'lucide-react';

const SavedItemCard = ({ item, service, onEditNotes, onRemove }) => {
  const isHighPriority = item.priority === 'high';
  const isMedPriority = item.priority === 'medium';

  return (
    <div
      className="card animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        padding: '2rem',
        position: 'relative',
      }}
    >
      <div>
        {/* Top Badges Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '99px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-light)',
                color: 'var(--accent-main)',
                fontWeight: '600',
              }}
            >
              <Folder size={12} /> {item.folder || 'General'}
            </span>

            {isHighPriority && (
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '99px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--error, #ef4444)',
                  fontWeight: '700',
                }}
              >
                High Priority
              </span>
            )}
            {isMedPriority && (
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '99px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--warning, #f59e0b)',
                  fontWeight: '700',
                }}
              >
                Medium
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onRemove(service.id)}
            aria-label="Remove bookmark"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--error)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <Trash2 size={16} />
          </button>
        </div>

        <h3
          style={{
            fontSize: '1.35rem',
            fontWeight: '800',
            marginBottom: '0.5rem',
            color: 'var(--text-primary)',
          }}
        >
          {service.name}
        </h3>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            marginBottom: '1rem',
          }}
        >
          {service.shortDescription}
        </p>

        {/* Notes preview if present */}
        {item.notes ? (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--glass-bg-subtle)',
              border: '1px solid var(--border-light)',
              borderRadius: '0.75rem',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>
              Your Note:
            </span>
            <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{item.notes}"</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onEditNotes(item, service)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-main)',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginBottom: '1.25rem',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Edit3 size={13} /> Add personal notes or deadline
          </button>
        )}
      </div>

      {/* Card Footer */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '1rem',
          borderTop: '1px dashed var(--border-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          type="button"
          onClick={() => onEditNotes(item, service)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
          }}
        >
          <Edit3 size={14} /> Edit Details
        </button>

        <Link
          to={`/services/${service.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: 'var(--accent-main)',
          }}
        >
          <span>Open Guide</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
};

export default SavedItemCard;

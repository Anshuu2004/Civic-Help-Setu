import { SearchX, RotateCcw } from 'lucide-react';

const DirectoryEmptyState = ({ onReset, activeCategory, searchQuery }) => {
  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        margin: '2rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '4.5rem',
          height: '4.5rem',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--accent-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SearchX size={36} />
      </div>

      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.35rem' }}>
          No Matching Civic Services Found
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: '1.6' }}>
          {searchQuery ? (
            <>
              No guides found for <strong>"{searchQuery}"</strong>{' '}
              {activeCategory !== 'All' ? `within the ${activeCategory} category` : ''}.
            </>
          ) : (
            `No guides currently match the selected category and filter facets.`
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="btn btn-secondary"
        style={{ marginTop: '0.5rem', padding: '0.65rem 1.5rem', fontSize: '0.95rem' }}
      >
        <RotateCcw size={16} /> Reset All Filters
      </button>
    </div>
  );
};

export default DirectoryEmptyState;

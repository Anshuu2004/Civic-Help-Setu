import { Zap, IndianRupee } from 'lucide-react';

const FeeAndSpeedFilter = ({
  feeType = 'All',
  onFeeTypeChange = () => {},
  speedFilter = 'All',
  onSpeedFilterChange = () => {},
}) => {
  return (
    <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Fee structure facet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <IndianRupee size={15} color="var(--text-tertiary)" />
        <div style={{ display: 'flex', background: 'var(--glass-bg)', borderRadius: '99px', border: '1px solid var(--border-light)', padding: '2px' }}>
          {['All', 'Free', 'Paid'].map((f) => {
            const isSelected = feeType === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => onFeeTypeChange(f)}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '99px',
                  border: 'none',
                  background: isSelected ? 'var(--accent-main)' : 'transparent',
                  color: isSelected ? 'var(--bg-main)' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {f === 'All' ? 'All Fees' : f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Speed facet */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', maxWidth: '100%', gap: '0.35rem' }}>
        <Zap size={15} color="var(--text-tertiary)" />
        <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '100%', background: 'var(--glass-bg)', borderRadius: '99px', border: '1px solid var(--border-light)', padding: '2px' }}>
          {[
            { id: 'All', label: 'Any Speed' },
            { id: 'Urgent', label: 'Urgent (≤3d)' },
            { id: 'Fast', label: '⚡ Fast (<7d)' },
            { id: 'Standard', label: 'Standard' },
          ].map((s) => {
            const isSelected = speedFilter === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSpeedFilterChange(s.id)}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '99px',
                  border: 'none',
                  background: isSelected ? 'var(--accent-main)' : 'transparent',
                  color: isSelected ? 'var(--bg-main)' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeeAndSpeedFilter;

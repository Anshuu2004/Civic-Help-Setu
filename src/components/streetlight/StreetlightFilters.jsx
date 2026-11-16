import { Search, Filter, RotateCcw, Map, List } from 'lucide-react';
import {
  CLUSTER_STATUS,
  CLUSTER_STATUS_LABELS,
  PRIORITY_TIERS,
  PRIORITY_TIER_LABELS,
} from '../../services/streetlightConstants';

export default function StreetlightFilters({
  filters,
  onChange,
  onReset,
  viewMode,
  onViewModeToggle,
}) {
  const handleFilterChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div
      className="streetlight-filters"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.85rem',
        padding: '0.85rem 1rem',
        background: 'var(--bg-secondary, #f8fafc)',
        border: '1px solid var(--border-main, #e2e8f0)',
        borderRadius: '0.75rem',
        marginBottom: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 220px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary, #94a3b8)',
            }}
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search by street, landmark, or pole ID..."
            value={filters.searchQuery || ''}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.25rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-main, #cbd5e1)',
              background: 'var(--bg-primary, #ffffff)',
              color: 'var(--text-primary, #0f172a)',
              fontSize: '0.85rem',
            }}
            aria-label="Search streetlight outages"
          />
        </div>

        {/* Status Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Filter size={15} style={{ color: 'var(--text-tertiary, #94a3b8)' }} aria-hidden="true" />
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{
              padding: '0.45rem 0.65rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-main, #cbd5e1)',
              background: 'var(--bg-primary, #ffffff)',
              color: 'var(--text-primary, #0f172a)',
              fontSize: '0.85rem',
            }}
            aria-label="Filter by cluster status"
          >
            <option value="all">All Statuses</option>
            {Object.entries(CLUSTER_STATUS).map(([key, val]) => (
              <option key={key} value={val}>
                {CLUSTER_STATUS_LABELS[val]}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Tier Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <select
            value={filters.priorityTier || 'all'}
            onChange={(e) => handleFilterChange('priorityTier', e.target.value)}
            style={{
              padding: '0.45rem 0.65rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-main, #cbd5e1)',
              background: 'var(--bg-primary, #ffffff)',
              color: 'var(--text-primary, #0f172a)',
              fontSize: '0.85rem',
            }}
            aria-label="Filter by priority tier"
          >
            <option value="all">All Priorities</option>
            {Object.entries(PRIORITY_TIERS).map(([key, val]) => (
              <option key={key} value={val}>
                {PRIORITY_TIER_LABELS[val]}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', padding: '0.4rem 0.65rem' }}
          title="Reset filters"
        >
          <RotateCcw size={13} aria-hidden="true" />
          Reset
        </button>
      </div>

      {/* View Mode Toggle (Accessible Map / List Alternative) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <button
          type="button"
          onClick={() => onViewModeToggle('list')}
          className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
          aria-pressed={viewMode === 'list'}
        >
          <List size={14} aria-hidden="true" />
          List View
        </button>
        <button
          type="button"
          onClick={() => onViewModeToggle('map')}
          className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
          aria-pressed={viewMode === 'map'}
        >
          <Map size={14} aria-hidden="true" />
          Interactive Map
        </button>
      </div>
    </div>
  );
}

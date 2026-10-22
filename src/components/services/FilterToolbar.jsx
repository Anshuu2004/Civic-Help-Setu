import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import DepartmentFilterSelect from './DepartmentFilterSelect';
import FeeAndSpeedFilter from './FeeAndSpeedFilter';

const FilterToolbar = ({
  searchQuery,
  onSearchChange,
  selectedMode,
  onModeChange,
  selectedDifficulty,
  onDifficultyChange,
  departments = [],
  selectedDepartment = 'All',
  onDepartmentChange = () => {},
  feeType = 'All',
  onFeeTypeChange = () => {},
  speedFilter = 'All',
  onSpeedFilterChange = () => {},
  sortBy,
  onSortChange,
  totalResults,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-light)',
        borderRadius: '1.25rem',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Top Row: Search and Result Counter */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 320px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }}
          />
          <input
            type="text"
            placeholder="Search by title, documents, or keywords..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field"
            style={{
              padding: '0.65rem 1rem 0.65rem 2.75rem',
              fontSize: '0.95rem',
              borderRadius: '99px',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'service guide' : 'service guides'}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              style={{
                fontSize: '0.8rem',
                color: 'var(--accent-main)',
                textDecoration: 'underline',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
              }}
            >
              Reset all
            </button>
          )}
        </div>
      </div>

      {/* Middle Row: Department, Fee Structure & Processing Speed */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-light)',
        }}
      >
        <DepartmentFilterSelect
          departments={departments}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={onDepartmentChange}
        />

        <FeeAndSpeedFilter
          feeType={feeType}
          onFeeTypeChange={onFeeTypeChange}
          speedFilter={speedFilter}
          onSpeedFilterChange={onSpeedFilterChange}
        />
      </div>

      {/* Bottom Row: Mode, Difficulty, and Sorting Facets */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-light)',
        }}
      >
        {/* Application Mode Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-tertiary)', fontWeight: '600' }}>Mode:</span>
          {['All', 'Online', 'Offline'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '99px',
                fontSize: '0.8rem',
                fontWeight: '600',
                background: selectedMode === m ? 'var(--text-primary)' : 'var(--glass-bg)',
                color: selectedMode === m ? 'var(--bg-main)' : 'var(--text-secondary)',
                border: selectedMode === m ? '1px solid transparent' : '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-tertiary)', fontWeight: '600' }}>Difficulty:</span>
          {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDifficultyChange(d)}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '99px',
                fontSize: '0.8rem',
                fontWeight: '600',
                background: selectedDifficulty === d ? 'var(--text-primary)' : 'var(--glass-bg)',
                color: selectedDifficulty === d ? 'var(--bg-main)' : 'var(--text-secondary)',
                border: selectedDifficulty === d ? '1px solid transparent' : '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <ArrowUpDown size={14} color="var(--text-tertiary)" />
          <span style={{ color: 'var(--text-tertiary)', fontWeight: '600' }}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '99px',
              fontSize: '0.825rem',
              background: 'var(--glass-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-light)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="relevance" style={{ background: 'var(--bg-main)' }}>Most Relevant</option>
            <option value="popularity" style={{ background: 'var(--bg-main)' }}>Most Popular</option>
            <option value="speed-asc" style={{ background: 'var(--bg-main)' }}>Fastest Processing</option>
            <option value="name-asc" style={{ background: 'var(--bg-main)' }}>Name (A – Z)</option>
            <option value="name-desc" style={{ background: 'var(--bg-main)' }}>Name (Z – A)</option>
            <option value="difficulty-asc" style={{ background: 'var(--bg-main)' }}>Difficulty (Easiest first)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterToolbar;

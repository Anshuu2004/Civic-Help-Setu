/**
 * src/components/waterQuality/WaterQualityFilters.jsx
 * Filter bar and controls for Community Water Quality Register (#754).
 */

import { Search, LayoutGrid, Table, UserCheck } from 'lucide-react';
import { WATER_POINT_TYPES, OPERATIONAL_STATUSES } from '../../data/waterQualityContract.js';

export default function WaterQualityFilters({
  filters,
  onFilterChange,
  availableCities,
  availableWards,
  viewMode,
  onViewModeChange,
  userRole,
  onRoleChange,
}) {
  return (
    <div className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] shadow-sm space-y-4 mb-6">
      {/* Search and Role Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search by water point name, ward, landmark, or ID..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            aria-label="Search water points"
          />
        </div>

        {/* View mode toggle and Role selector */}
        <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
          <div className="flex items-center rounded-lg border border-[var(--border-light)] p-0.5 bg-[var(--bg-secondary)]">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[var(--bg-card)] shadow-sm font-semibold text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              aria-label="Grid card view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'table'
                  ? 'bg-[var(--bg-card)] shadow-sm font-semibold text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              aria-label="Accessible table view"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {/* Role switcher for verified authority testing */}
          <div className="flex items-center gap-1 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <label htmlFor="role-select" className="sr-only">Role View</label>
            <select
              id="role-select"
              value={userRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="text-xs p-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)] font-medium"
            >
              <option value="public">Role: Public Resident</option>
              <option value="sampler">Role: Certified Sampler</option>
              <option value="lab_analyst">Role: NABL Lab Analyst</option>
              <option value="official_reviewer">Role: Municipal Health Officer</option>
              <option value="admin">Role: Central Administrator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Multi-Filter dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs pt-2 border-t border-[var(--border-light)]">
        {/* City Filter */}
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
            City / ULB
          </label>
          <select
            value={filters.city}
            onChange={(e) => onFilterChange({ ...filters, city: e.target.value, ward: 'All' })}
            className="w-full p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)]"
          >
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Ward Filter */}
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
            Ward / Locality
          </label>
          <select
            value={filters.ward}
            onChange={(e) => onFilterChange({ ...filters, ward: e.target.value })}
            className="w-full p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)]"
          >
            {availableWards.map((ward) => (
              <option key={ward} value={ward}>
                {ward}
              </option>
            ))}
          </select>
        </div>

        {/* Water Point Type */}
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
            Water Point Type
          </label>
          <select
            value={filters.pointType}
            onChange={(e) => onFilterChange({ ...filters, pointType: e.target.value })}
            className="w-full p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)]"
          >
            <option value="all">All Point Types</option>
            {Object.entries(WATER_POINT_TYPES).map(([key, def]) => (
              <option key={key} value={key}>
                {def.label}
              </option>
            ))}
          </select>
        </div>

        {/* Compliance Status */}
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
            Compliance (IS 10500)
          </label>
          <select
            value={filters.compliance}
            onChange={(e) => onFilterChange({ ...filters, compliance: e.target.value })}
            className="w-full p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)]"
          >
            <option value="all">All Compliance States</option>
            <option value="compliant">IS 10500 Compliant</option>
            <option value="exceeded">Statutory Limits Exceeded</option>
            <option value="critical_hazard">Critical Hazard / Pathogen</option>
            <option value="pending">Pending Lab Analysis</option>
          </select>
        </div>

        {/* Operational Status */}
        <div>
          <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
            Asset State
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)]"
          >
            <option value="all">All Operational States</option>
            {Object.entries(OPERATIONAL_STATUSES).map(([key, def]) => (
              <option key={key} value={key}>
                {def.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

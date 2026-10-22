import { Building2 } from 'lucide-react';

const DepartmentFilterSelect = ({
  departments = [],
  selectedDepartment = 'All',
  onDepartmentChange = () => {},
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <Building2 size={16} color="var(--text-tertiary)" />
      <select
        value={selectedDepartment}
        onChange={(e) => onDepartmentChange(e.target.value)}
        aria-label="Filter by department or ministry"
        className="input-field"
        style={{
          padding: '0.4rem 0.75rem',
          fontSize: '0.85rem',
          borderRadius: '99px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-light)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
        }}
      >
        <option value="All">All Ministries & Depts</option>
        {departments.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DepartmentFilterSelect;

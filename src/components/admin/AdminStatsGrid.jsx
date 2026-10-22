import { CheckSquare, BarChart3, AlertTriangle, MessageSquare, Users } from 'lucide-react';

const AdminStatsGrid = ({ services = [], reports = [] }) => {
  const verifiedCount = services.filter((s) => s.officialSources?.some((src) => src.verified)).length;
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  const stats = [
    {
      label: 'Total Services',
      value: services.length,
      icon: <CheckSquare size={20} color="var(--accent-main)" />,
      sub: 'Active in directory',
    },
    {
      label: 'Verified Services',
      value: verifiedCount,
      icon: <BarChart3 size={20} color="var(--success, #10b981)" />,
      sub: `${services.length > 0 ? Math.round((verifiedCount / services.length) * 100) : 0}% compliance`,
    },
    {
      label: 'Pending Reports',
      value: pendingReportsCount,
      icon: (
        <AlertTriangle
          size={20}
          color={pendingReportsCount > 0 ? 'var(--warning, #f59e0b)' : 'var(--text-tertiary)'}
        />
      ),
      sub: pendingReportsCount > 0 ? 'Review requested' : 'Queue clean',
    },
    {
      label: 'AI Queries (Today)',
      value: 124,
      icon: <MessageSquare size={20} color="#c084fc" />,
      sub: 'Simulated LLM hits',
    },
    {
      label: 'Active Contributors',
      value: 12,
      icon: <Users size={20} color="var(--text-primary)" />,
      sub: 'Open source community',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}
    >
      {stats.map((stat, i) => (
        <div key={i} className="card" style={{ padding: '1.25rem 1.5rem', background: 'var(--glass-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: '600' }}>{stat.label}</span>
            {stat.icon}
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary)' }}>{stat.value}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stat.sub}</span>
        </div>
      ))}
    </div>
  );
};

export default AdminStatsGrid;

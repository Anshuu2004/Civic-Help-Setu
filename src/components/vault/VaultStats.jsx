import { ShieldCheck, FileText, AlertTriangle, Layers } from 'lucide-react';
import { getExpiryStatus } from '../../services/vaultStorage';

const VaultStats = ({ documents = [] }) => {
  const total = documents.length;
  const verified = documents.filter((d) => d.verified).length;
  const expiringOrExpired = documents.filter((d) => {
    const status = getExpiryStatus(d.expiryDate);
    return status === 'expiring-soon' || status === 'expired';
  }).length;
  const categoriesCount = new Set(documents.map((d) => d.category || 'General')).size;

  const stats = [
    {
      label: 'Stored Documents',
      value: total,
      icon: <FileText size={20} color="var(--accent-main)" />,
      sub: 'Encrypted locally',
    },
    {
      label: 'Govt. Verified',
      value: verified,
      icon: <ShieldCheck size={20} color="var(--success, #10b981)" />,
      sub: `${total > 0 ? Math.round((verified / total) * 100) : 0}% authenticated`,
    },
    {
      label: 'Expiry Alerts',
      value: expiringOrExpired,
      icon: (
        <AlertTriangle
          size={20}
          color={expiringOrExpired > 0 ? 'var(--warning, #f59e0b)' : 'var(--text-tertiary)'}
        />
      ),
      sub: expiringOrExpired > 0 ? 'Action suggested' : 'All dates current',
    },
    {
      label: 'Categories',
      value: categoriesCount,
      icon: <Layers size={20} color="#c084fc" />,
      sub: 'Organized folders',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2.5rem',
      }}
    >
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="card"
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            background: 'var(--glass-bg)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-tertiary)',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {stat.label}
            </span>
            {stat.icon}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {stat.value}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stat.sub}</span>
        </div>
      ))}
    </div>
  );
};

export default VaultStats;

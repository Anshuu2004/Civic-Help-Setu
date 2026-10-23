import { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Download,
  Filter,
  Shield,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AuditLogViewer = ({ auditLogs = [] }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (filterAction !== 'all' && log.action !== filterAction) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        log.actor?.toLowerCase().includes(q) ||
        log.target?.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q)
      );
    });
  }, [auditLogs, searchQuery, filterAction]);

  const handleExportJSON = () => {
    if (auditLogs.length === 0) {
      toast?.info?.('No audit logs to export.');
      return;
    }
    const blob = new Blob([JSON.stringify(auditLogs, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `civicbridge_audit_trail_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast?.success?.('Moderation audit log exported as JSON.');
  };

  const getActionBadgeColor = (action = '') => {
    switch (action.toLowerCase()) {
      case 'role_changed':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
      case 'service_created':
      case 'services_imported':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
      case 'service_updated':
        return { bg: 'rgba(56, 189, 248, 0.15)', text: 'var(--accent-main)' };
      case 'report_resolved':
        return { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6' };
      case 'service_deleted':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' };
      default:
        return { bg: 'var(--glass-bg)', text: 'var(--text-secondary)' };
    }
  };

  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        padding: '1.5rem',
        borderRadius: '1rem',
        border: '1px solid var(--border-light)',
      }}
    >
      {/* Header and Controls Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={20} color="var(--accent-main)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
            Moderation Audit Trail & Governance Logs
          </h3>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '99px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: 'var(--accent-main)',
              fontWeight: '700',
            }}
          >
            {filteredLogs.length} Records
          </span>
        </div>

        <button
          type="button"
          onClick={handleExportJSON}
          className="btn btn-secondary"
          style={{
            fontSize: '0.8rem',
            padding: '0.45rem 0.85rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            borderRadius: '0.5rem',
          }}
        >
          <Download size={14} /> Export Audit Log
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }}
          />
          <input
            type="text"
            placeholder="Search by moderator name, target service, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{
              paddingLeft: '2.5rem',
              fontSize: '0.85rem',
              width: '100%',
              borderRadius: '0.5rem',
            }}
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="input-field"
          style={{
            padding: '0.5rem 0.85rem',
            fontSize: '0.85rem',
            borderRadius: '0.5rem',
            background: 'var(--bg-main)',
          }}
        >
          <option value="all">All Action Types</option>
          <option value="ROLE_CHANGED">Role Changed</option>
          <option value="SERVICE_CREATED">Service Created</option>
          <option value="SERVICES_IMPORTED">Services Imported</option>
          <option value="SERVICE_UPDATED">Service Updated</option>
          <option value="REPORT_RESOLVED">Report Resolved</option>
          <option value="SERVICE_DELETED">Service Deleted</option>
        </select>
      </div>

      {/* Log Entries Table */}
      {filteredLogs.length === 0 ? (
        <div
          style={{
            padding: '2.5rem 1rem',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontSize: '0.9rem',
          }}
        >
          No moderation audit records match your query.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-tertiary)' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: '700' }}>Timestamp</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: '700' }}>Action</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: '700' }}>Moderator</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: '700' }}>Target / Scope</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: '700' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const badge = getActionBadgeColor(log.action);
                return (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      transition: 'background 0.15s',
                    }}
                  >
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={12} /> {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '99px',
                          fontWeight: '700',
                          background: badge.bg,
                          color: badge.text,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <User size={13} color="var(--accent-main)" /> {log.actor}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--accent-main)', fontWeight: '600' }}>
                      {log.target}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;

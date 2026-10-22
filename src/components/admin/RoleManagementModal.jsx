import { useState, useEffect } from 'react';
import AccessibleModal from '../common/AccessibleModal';
import {
  Shield,
  UserCheck,
  Lock,
  CheckCircle,
  Save,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    canEditServices: true,
    canApproveSubmissions: true,
    canResolveReports: true,
    canViewAuditLogs: true,
    canManageUsers: true,
  },
  moderator: {
    canEditServices: true,
    canApproveSubmissions: true,
    canResolveReports: true,
    canViewAuditLogs: true,
    canManageUsers: false,
  },
  editor: {
    canEditServices: true,
    canApproveSubmissions: false,
    canResolveReports: false,
    canViewAuditLogs: false,
    canManageUsers: false,
  },
  citizen: {
    canEditServices: false,
    canApproveSubmissions: false,
    canResolveReports: false,
    canViewAuditLogs: false,
    canManageUsers: false,
  },
};

const RoleManagementModal = ({
  isOpen,
  onClose,
  targetUser,
  onSaveRole = () => {},
}) => {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [customPermissions, setCustomPermissions] = useState(DEFAULT_ROLE_PERMISSIONS.citizen);

  useEffect(() => {
    if (targetUser) {
      const role = targetUser.role || 'citizen';
      setSelectedRole(role);
      setCustomPermissions(DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.citizen);
    }
  }, [targetUser, isOpen]);

  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
    setCustomPermissions(DEFAULT_ROLE_PERMISSIONS[newRole] || DEFAULT_ROLE_PERMISSIONS.citizen);
  };

  const handlePermissionToggle = (key) => {
    setCustomPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetUser) return;

    onSaveRole(targetUser.id, selectedRole, customPermissions);
    toast?.success?.(
      `Role for ${targetUser.username || targetUser.email} updated to ${selectedRole.toUpperCase()}.`,
      'Role Updated'
    );
    onClose();
  };

  if (!targetUser) return null;

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Role & RBAC Access Control"
      subtitle={`Configure governance authority and moderation privileges for ${targetUser.username || targetUser.email}`}
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* User Profile Pill */}
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '0.6rem',
            background: 'rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>
              {targetUser.username || 'Anonymous Citizen'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              {targetUser.email} • ID: {targetUser.id}
            </span>
          </div>
          <span
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '99px',
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              background: 'rgba(56, 189, 248, 0.15)',
              color: 'var(--accent-main)',
            }}
          >
            Current: {targetUser.role || 'citizen'}
          </span>
        </div>

        {/* Role Selector Grid */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Assign Access Level
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {[
              { id: 'admin', label: 'Administrator', desc: 'Full platform management and role governance' },
              { id: 'moderator', label: 'Moderator', desc: 'Resolve inaccuracy reports and review service edits' },
              { id: 'editor', label: 'Service Editor', desc: 'Draft and update civic procedure content' },
              { id: 'citizen', label: 'Citizen (Standard)', desc: 'Standard public user with vault and tracking access' },
            ].map((r) => {
              const isSelected = selectedRole === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => handleRoleChange(r.id)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '0.6rem',
                    border: `1.5px solid ${isSelected ? 'var(--accent-main)' : 'var(--border-light)'}`,
                    background: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'var(--glass-bg)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.85rem', color: isSelected ? 'var(--accent-main)' : 'var(--text-primary)' }}>
                      {r.label}
                    </span>
                    {isSelected && <CheckCircle size={15} color="var(--accent-main)" />}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: '1.4', margin: 0 }}>
                    {r.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Granular Permission Matrix */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Granular Capability Scopes
          </label>
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '0.6rem',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            {[
              { key: 'canEditServices', label: 'Edit & update live civic service guides' },
              { key: 'canApproveSubmissions', label: 'Review and approve community service contributions' },
              { key: 'canResolveReports', label: 'Investigate and resolve public inaccuracy reports' },
              { key: 'canViewAuditLogs', label: 'Inspect moderator audit trails and security logs' },
              { key: 'canManageUsers', label: 'Modify citizen roles and access permissions' },
            ].map(({ key, label }) => (
              <label
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(customPermissions[key])}
                  onChange={() => handlePermissionToggle(key)}
                  style={{ accentColor: 'var(--accent-main)' }}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              flex: 2,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Save size={16} /> Save Role & Permissions
          </button>
        </div>
      </form>
    </AccessibleModal>
  );
};

export default RoleManagementModal;

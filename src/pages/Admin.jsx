import { useState, useEffect } from 'react';
import {
  CheckSquare,
  AlertTriangle,
  MessageSquare,
  Users,
  LogOut,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Shield,
  FileCheck,
  History,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getAdminServices,
  saveAdminService,
  deleteAdminService,
  getReports,
  resolveReport,
  dismissReport,
  getAuditLogs,
  getUserList,
  updateUserRole,
  getServiceSubmissions,
  approveServiceSubmission,
  rejectServiceSubmission,
} from '../services/adminService';
import AdminStatsGrid from '../components/admin/AdminStatsGrid';
import ServiceModal from '../components/admin/ServiceModal';
import ReportResolutionModal from '../components/admin/ReportResolutionModal';
import RoleManagementModal from '../components/admin/RoleManagementModal';
import ServiceSubmissionReviewModal from '../components/admin/ServiceSubmissionReviewModal';
import AuditLogViewer from '../components/admin/AuditLogViewer';
import { useToast } from '../context/ToastContext';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [services, setServices] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // Modals
  const [serviceModal, setServiceModal] = useState({ isOpen: false, service: null });
  const [reportModal, setReportModal] = useState({ isOpen: false, report: null });
  const [roleModal, setRoleModal] = useState({ isOpen: false, targetUser: null });
  const [submissionModal, setSubmissionModal] = useState({ isOpen: false, submission: null });

  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setServices(getAdminServices());
    setReports(getReports());
    setUsers(getUserList());
    setAuditLogs(getAuditLogs());
    setSubmissions(getServiceSubmissions());
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveService = (serviceData) => {
    const updated = saveAdminService(serviceData, user?.username || 'SuperAdmin');
    setServices(updated);
    setAuditLogs(getAuditLogs());
    toast?.success?.('Service guide saved and published live.');
  };

  const handleDeleteService = (id) => {
    if (window.confirm('Are you sure you want to remove this service from the active directory?')) {
      const updated = deleteAdminService(id, user?.username || 'SuperAdmin');
      setServices(updated);
      setAuditLogs(getAuditLogs());
      toast?.info?.('Service deleted from directory.');
    }
  };

  const handleResolveReport = (id, resolution) => {
    const updated = resolveReport(id, resolution, user?.username || 'SuperAdmin');
    setReports(updated);
    setAuditLogs(getAuditLogs());
  };

  const handleDismissReport = (id) => {
    const updated = dismissReport(id);
    setReports(updated);
    toast?.info?.('Report dismissed from queue.');
  };

  const handleEditServiceFromReport = (serviceId) => {
    const target = services.find((s) => s.id === serviceId);
    if (target) {
      setServiceModal({ isOpen: true, service: target });
    }
  };

  const handleSaveRole = (userId, newRole, customPermissions) => {
    const updated = updateUserRole(userId, newRole, customPermissions, user?.username || 'SuperAdmin');
    setUsers(updated);
    setAuditLogs(getAuditLogs());
  };

  const handleApproveSubmission = (submissionId, reviewNotes) => {
    const updated = approveServiceSubmission(submissionId, reviewNotes, user?.username || 'SuperAdmin');
    setSubmissions(updated);
    setServices(getAdminServices());
    setAuditLogs(getAuditLogs());
  };

  const handleRejectSubmission = (submissionId, reviewNotes) => {
    const updated = rejectServiceSubmission(submissionId, reviewNotes, user?.username || 'SuperAdmin');
    setSubmissions(updated);
    setAuditLogs(getAuditLogs());
  };

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;
  const pendingSubmissionsCount = submissions.filter((s) => s.status === 'pending').length;

  return (
    <div className="section animate-fade-in" style={{ paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1280px' }}>
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border-main)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--accent-main)',
                fontSize: '0.85rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '0.25rem',
              }}
            >
              <ShieldCheck size={18} /> Governance & Content Moderation Portal
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: '900' }}>
              Civic Administration Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
              Review service submissions, manage public guides, resolve citizen reports, and administer RBAC roles.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>
                {user?.fullName || user?.username || 'Admin User'}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '99px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--accent-main)',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}
              >
                Role: {user?.role || 'admin'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Layout Grid: Sidebar Tabs & Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Sidebar Tabs */}
          <div
            className="glass-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              padding: '0.75rem',
              borderRadius: '0.85rem',
            }}
          >
            {[
              { id: 'dashboard', label: 'Overview Metrics', badge: null },
              { id: 'services', label: `Service Catalog (${services.length})`, badge: null },
              { id: 'submissions', label: 'Submissions Queue', badge: pendingSubmissionsCount || null },
              { id: 'reports', label: 'Inaccuracy Reports', badge: pendingReportsCount || null },
              { id: 'users', label: `User Roles (${users.length})`, badge: null },
              { id: 'audit', label: 'Audit Trail Logs', badge: null },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    textAlign: 'left',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '0.55rem',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: 'none',
                    transition: 'all 0.15s',
                    background: isActive ? 'var(--accent-main)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      style={{
                        padding: '0.1rem 0.45rem',
                        borderRadius: '99px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        background: isActive ? '#ffffff' : 'rgba(239, 68, 68, 0.2)',
                        color: isActive ? 'var(--accent-main)' : '#ef4444',
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Area */}
          <div>
            {/* Overview Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div>
                <AdminStatsGrid
                  servicesCount={services.length}
                  reportsCount={pendingReportsCount}
                />
              </div>
            )}

            {/* Service Catalog Tab */}
            {activeTab === 'services' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Public Service Guides</h2>
                  <button
                    type="button"
                    onClick={() => setServiceModal({ isOpen: true, service: null })}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Plus size={16} /> Add New Service Guide
                  </button>
                </div>

                <div className="glass-panel" style={{ borderRadius: '0.85rem', overflow: 'hidden' }}>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-tertiary)', background: 'rgba(0, 0, 0, 0.15)' }}>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Service Name</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Category</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Delivery Mode</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((svc) => (
                        <tr key={svc.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {svc.name}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                            {svc.category}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '99px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: '600' }}>
                              {svc.type || 'Online / Offline'}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => setServiceModal({ isOpen: true, service: svc })}
                              style={{ background: 'none', border: 'none', color: 'var(--accent-main)', fontWeight: '600', marginRight: '0.85rem', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteService(svc.id)}
                              style={{ background: 'none', border: 'none', color: 'var(--error, #ef4444)', fontWeight: '600', cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Community Submissions Queue Tab */}
            {activeTab === 'submissions' && (
              <div>
                <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Community Submissions & Edits Queue</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                    Citizen and contributor proposals pending moderator verification before publication.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="glass-panel"
                      style={{
                        padding: '1.25rem',
                        borderRadius: '0.85rem',
                        borderLeft: `4px solid ${sub.status === 'approved' ? '#10b981' : sub.status === 'rejected' ? '#ef4444' : '#f59e0b'}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-main)', textTransform: 'uppercase' }}>
                            {sub.category}
                          </span>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0.2rem 0', color: 'var(--text-primary)' }}>
                            {sub.name}
                          </h3>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                            Submitted by: {sub.submittedBy} ({sub.contributorEmail}) on {sub.submittedAt}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '99px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            background: sub.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: sub.status === 'approved' ? '#10b981' : '#f59e0b',
                          }}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1rem' }}>
                        {sub.shortDescription}
                      </p>

                      {sub.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => setSubmissionModal({ isOpen: true, submission: sub })}
                            className="btn btn-primary"
                            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                          >
                            <FileCheck size={15} /> Review & Moderate
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Queue Tab */}
            {activeTab === 'reports' && (
              <div>
                <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Community Inaccuracy Reports</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                    Citizens flag broken links, outdated fees, and missing procedures for moderator audit.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="card"
                      style={{
                        padding: '1.25rem',
                        borderLeft: `4px solid ${report.status === 'resolved' ? '#10b981' : '#f59e0b'}`,
                        background: 'var(--glass-bg)',
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-main)', textTransform: 'uppercase', marginRight: '0.5rem' }}>
                            {report.serviceName}
                          </span>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{report.issueType}</strong>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{report.createdAt}</span>
                      </div>

                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', fontStyle: 'italic' }}>
                        "{report.description}"
                      </p>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {report.status === 'resolved' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#10b981', fontWeight: '600' }}>
                            <CheckCircle2 size={16} /> Resolved: {report.resolutionNotes}
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setReportModal({ isOpen: true, report })}
                              className="btn btn-primary"
                              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                            >
                              Review & Resolve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDismissReport(report.id)}
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Roles & RBAC Governance Tab */}
            {activeTab === 'users' && (
              <div>
                <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>User Roles & Governance Access Control</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                    Assign administrative privileges, moderator queue access, or editor permissions.
                  </p>
                </div>

                <div className="glass-panel" style={{ borderRadius: '0.85rem', overflow: 'hidden' }}>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-tertiary)', background: 'rgba(0, 0, 0, 0.15)' }}>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Citizen / Officer</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Email Address</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Active Role</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Member Since</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((usr) => (
                        <tr key={usr.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {usr.username}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                            {usr.email}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '99px',
                                textTransform: 'uppercase',
                                fontWeight: '700',
                                background:
                                  usr.role === 'admin'
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : usr.role === 'moderator'
                                    ? 'rgba(245, 158, 11, 0.15)'
                                    : usr.role === 'editor'
                                    ? 'rgba(56, 189, 248, 0.15)'
                                    : 'rgba(255, 255, 255, 0.08)',
                                color:
                                  usr.role === 'admin'
                                    ? '#ef4444'
                                    : usr.role === 'moderator'
                                    ? '#f59e0b'
                                    : usr.role === 'editor'
                                    ? 'var(--accent-main)'
                                    : 'var(--text-secondary)',
                              }}
                            >
                              {usr.role}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-tertiary)' }}>
                            {usr.joinedAt}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => setRoleModal({ isOpen: true, targetUser: usr })}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent-main)',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              Edit Role & RBAC
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Audit Trail Tab */}
            {activeTab === 'audit' && (
              <div>
                <AuditLogViewer auditLogs={auditLogs} />
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <ServiceModal
          isOpen={serviceModal.isOpen}
          serviceToEdit={serviceModal.service}
          onClose={() => setServiceModal({ isOpen: false, service: null })}
          onSave={handleSaveService}
        />

        <ReportResolutionModal
          isOpen={reportModal.isOpen}
          report={reportModal.report}
          onClose={() => setReportModal({ isOpen: false, report: null })}
          onResolve={handleResolveReport}
          onDismiss={handleDismissReport}
          onEditService={handleEditServiceFromReport}
        />

        <RoleManagementModal
          isOpen={roleModal.isOpen}
          targetUser={roleModal.targetUser}
          onClose={() => setRoleModal({ isOpen: false, targetUser: null })}
          onSaveRole={handleSaveRole}
        />

        <ServiceSubmissionReviewModal
          isOpen={submissionModal.isOpen}
          submission={submissionModal.submission}
          onClose={() => setSubmissionModal({ isOpen: false, submission: null })}
          onApprove={handleApproveSubmission}
          onReject={handleRejectSubmission}
        />
      </div>
    </div>
  );
};

export default Admin;

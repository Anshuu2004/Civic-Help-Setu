import { useState, useEffect } from 'react';
import { CheckSquare, AlertTriangle, MessageSquare, Users, LogOut, Plus, Edit3, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getAdminServices,
  saveAdminService,
  deleteAdminService,
  getReports,
  resolveReport,
  dismissReport,
} from '../services/adminService';
import AdminStatsGrid from '../components/admin/AdminStatsGrid';
import ServiceModal from '../components/admin/ServiceModal';
import ReportResolutionModal from '../components/admin/ReportResolutionModal';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [services, setServices] = useState([]);
  const [reports, setReports] = useState([]);
  const [serviceModal, setServiceModal] = useState({ isOpen: false, service: null });
  const [reportModal, setReportModal] = useState({ isOpen: false, report: null });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setServices(getAdminServices());
    setReports(getReports());
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveService = (serviceData) => {
    const updated = saveAdminService(serviceData);
    setServices(updated);
  };

  const handleDeleteService = (id) => {
    if (window.confirm('Are you sure you want to remove this service from the active directory?')) {
      const updated = deleteAdminService(id);
      setServices(updated);
    }
  };

  const handleResolveReport = (id, resolution) => {
    const updated = resolveReport(id, resolution);
    setReports(updated);
  };

  const handleDismissReport = (id) => {
    const updated = dismissReport(id);
    setReports(updated);
  };

  const handleEditServiceFromReport = (serviceId) => {
    const target = services.find((s) => s.id === serviceId);
    if (target) {
      setServiceModal({ isOpen: true, service: target });
    }
  };

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="section animate-fade-in" style={{ paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1050px' }}>
        {/* Header */}
        <div
          className="flex-between"
          style={{
            marginBottom: '2.5rem',
            borderBottom: '1px solid var(--border-main)',
            paddingBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-main)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
              <ShieldCheck size={16} /> Verified Officer Portal
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: '800' }}>
              Admin Dashboard
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.username}</strong>{' '}
                {user?.email ? `(${user.email})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row', flexWrap: 'wrap' }}>
          {/* Sidebar Nav */}
          <div
            style={{
              width: '100%',
              maxWidth: '220px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <button
              type="button"
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                background: activeTab === 'dashboard' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'dashboard' ? 'var(--bg-main)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
              onClick={() => setActiveTab('dashboard')}
            >
              Overview
            </button>
            <button
              type="button"
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                background: activeTab === 'services' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'services' ? 'var(--bg-main)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
              onClick={() => setActiveTab('services')}
            >
              Manage Services ({services.length})
            </button>
            <button
              type="button"
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                background: activeTab === 'reports' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'reports' ? 'var(--bg-main)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onClick={() => setActiveTab('reports')}
            >
              <span>User Reports</span>
              {pendingReportsCount > 0 && (
                <span
                  style={{
                    background: 'var(--error, #ef4444)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    padding: '0.1rem 0.5rem',
                    borderRadius: '99px',
                    fontWeight: '700',
                  }}
                >
                  {pendingReportsCount}
                </span>
              )}
            </button>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, minWidth: '320px' }}>
            {activeTab === 'dashboard' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem' }}>
                  System Metrics & Activity
                </h2>
                <AdminStatsGrid services={services} reports={reports} />

                {/* Quick actions panel */}
                <div className="card" style={{ padding: '1.75rem', background: 'var(--glass-bg)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    Quick Administrative Actions
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                    Publish newly introduced government portals or process community inaccuracy flags.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setServiceModal({ isOpen: true, service: null })}
                      className="btn btn-primary"
                      style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
                    >
                      <Plus size={16} /> Add New Service Guide
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('reports')}
                      className="btn btn-secondary"
                      style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
                    >
                      Review Reports ({pendingReportsCount})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <div
                  className="flex-between"
                  style={{
                    marginBottom: '1.5rem',
                    borderBottom: '1px solid var(--border-light)',
                    paddingBottom: '0.75rem',
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Manage Services</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Add or modify civic roadmaps across all public categories.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setServiceModal({ isOpen: true, service: null })}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1.15rem', fontSize: '0.85rem' }}
                  >
                    <Plus size={16} /> Add New Service
                  </button>
                </div>

                <div
                  style={{
                    background: 'var(--glass-bg-subtle)',
                    borderRadius: '1rem',
                    border: '1px solid var(--border-main)',
                    overflow: 'hidden',
                  }}
                >
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr
                        style={{
                          background: 'var(--glass-bg)',
                          color: 'var(--text-secondary)',
                          fontSize: '0.85rem',
                          borderBottom: '1px solid var(--border-main)',
                        }}
                      >
                        <th style={{ padding: '1rem', fontWeight: '600' }}>Service Name</th>
                        <th style={{ padding: '1rem', fontWeight: '600' }}>Category</th>
                        <th style={{ padding: '1rem', fontWeight: '600' }}>Mode</th>
                        <th style={{ padding: '1rem', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service) => (
                        <tr
                          key={service.id}
                          style={{
                            borderBottom: '1px solid var(--border-light)',
                            transition: 'background 0.2s',
                          }}
                        >
                          <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {service.name}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {service.category}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.65rem',
                                borderRadius: '99px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                background: 'rgba(52, 211, 153, 0.1)',
                                color: 'var(--success, #10b981)',
                              }}
                            >
                              {service.type}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => setServiceModal({ isOpen: true, service })}
                              style={{
                                color: 'var(--accent-main)',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                marginRight: '1rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteService(service.id)}
                              style={{
                                color: 'var(--error, #ef4444)',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                              }}
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

            {activeTab === 'reports' && (
              <div>
                <div
                  style={{
                    marginBottom: '1.5rem',
                    borderBottom: '1px solid var(--border-light)',
                    paddingBottom: '0.75rem',
                  }}
                >
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Community Inaccuracy Reports</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Citizens flag broken links, outdated fees, and missing procedures for moderator audit.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="card"
                      style={{
                        padding: '1.5rem',
                        borderLeft: `4px solid ${
                          report.status === 'resolved' ? 'var(--success, #10b981)' : 'var(--warning, #f59e0b)'
                        }`,
                        background: 'var(--glass-bg)',
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              color: 'var(--accent-main)',
                              textTransform: 'uppercase',
                              marginRight: '0.5rem',
                            }}
                          >
                            {report.serviceName}
                          </span>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>
                            {report.issueType}
                          </strong>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {report.createdAt}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontStyle: 'italic' }}>
                        "{report.description}"
                      </p>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {report.status === 'resolved' ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.8rem',
                              color: 'var(--success, #10b981)',
                              fontWeight: '600',
                            }}
                          >
                            <CheckCircle2 size={16} /> Resolved
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setReportModal({ isOpen: true, report })}
                              className="btn btn-primary"
                              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                            >
                              Review & Resolve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDismissReport(report.id)}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {reports.length === 0 && (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                      <p style={{ color: 'var(--text-secondary)' }}>No reports currently in moderation queue.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Service Modal */}
        <ServiceModal
          isOpen={serviceModal.isOpen}
          serviceToEdit={serviceModal.service}
          onClose={() => setServiceModal({ isOpen: false, service: null })}
          onSave={handleSaveService}
        />

        {/* Report Resolution Modal */}
        <ReportResolutionModal
          isOpen={reportModal.isOpen}
          report={reportModal.report}
          onClose={() => setReportModal({ isOpen: false, report: null })}
          onResolve={handleResolveReport}
          onDismiss={handleDismissReport}
          onEditService={handleEditServiceFromReport}
        />
      </div>
    </div>
  );
};

export default Admin;

import { useState } from 'react';
import { MOCK_SERVICES } from '../data/services';
import { BarChart3, CheckSquare, AlertTriangle, MessageSquare, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    { label: 'Total Services', value: MOCK_SERVICES.length, icon: <CheckSquare size={20} /> },
    { label: 'Verified Services', value: MOCK_SERVICES.filter(s => s.officialSources?.some(src => src.verified)).length, icon: <BarChart3 size={20} /> },
    { label: 'Pending Reports', value: 3, icon: <AlertTriangle size={20} color="var(--warning)" /> },
    { label: 'AI Queries (Today)', value: 124, icon: <MessageSquare size={20} /> },
    { label: 'Active Contributors', value: 12, icon: <Users size={20} /> },
  ];

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div className="flex-between animate-fade-in" style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-main)', paddingBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              {user?.imageUrl && (
                <img src={user.imageUrl} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
              )}
              <p style={{ color: 'var(--text-secondary)' }}>Welcome back, <span style={{ color: 'var(--accent-main)', fontWeight: '600' }}>{user?.username}</span> {user?.email ? `(${user.email})` : ''}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row', flexWrap: 'wrap' }}>
          {/* Sidebar Nav */}
          <div style={{ width: '100%', maxWidth: '240px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }} className="animate-fade-in delay-100">
            <button 
              style={{ textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: '500', transition: 'all 0.2s', background: activeTab === 'dashboard' ? 'var(--text-primary)' : 'transparent', color: activeTab === 'dashboard' ? 'var(--bg-main)' : 'var(--text-secondary)' }}
              onClick={() => setActiveTab('dashboard')}
            >
              Overview
            </button>
            <button 
              style={{ textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: '500', transition: 'all 0.2s', background: activeTab === 'services' ? 'var(--text-primary)' : 'transparent', color: activeTab === 'services' ? 'var(--bg-main)' : 'var(--text-secondary)' }}
              onClick={() => setActiveTab('services')}
            >
              Manage Services
            </button>
            <button 
              style={{ textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: '500', transition: 'all 0.2s', background: activeTab === 'reports' ? 'var(--text-primary)' : 'transparent', color: activeTab === 'reports' ? 'var(--bg-main)' : 'var(--text-secondary)' }}
              onClick={() => setActiveTab('reports')}
            >
              Error Reports <span style={{ marginLeft: '0.5rem', background: 'var(--error)', color: 'var(--text-primary)', fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '99px' }}>3</span>
            </button>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, minWidth: '300px' }} className="animate-fade-in delay-200">
            {activeTab === 'dashboard' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Overview Statistics</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {stats.map((stat, i) => (
                    <div key={i} className="card" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        {stat.icon}
                        {stat.label}
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '800' }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <div className="flex-between" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Manage Services</h2>
                  <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Add New Service</button>
                </div>
                
                <div style={{ background: 'var(--glass-bg-subtle)', borderRadius: '1rem', border: '1px solid var(--border-main)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--glass-bg)', color: 'var(--text-secondary)', fontSize: '0.875rem', borderBottom: '1px solid var(--border-main)' }}>
                        <th style={{ padding: '1rem', fontWeight: '600' }}>Service Name</th>
                        <th style={{ padding: '1rem', fontWeight: '600' }}>Category</th>
                        <th style={{ padding: '1rem', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '1rem', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_SERVICES.slice(0, 5).map(service => (
                        <tr key={service.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-bg-subtle)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '1rem', fontWeight: '500' }}>{service.name}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{service.category}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)' }}>Published</span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <button style={{ color: 'var(--accent-main)', fontWeight: '500', fontSize: '0.875rem', marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                            <button style={{ color: 'var(--error)', fontWeight: '500', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
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
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>User Reports</h2>
                <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning)' }}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <h3 style={{ fontWeight: '700' }}>Missing link on Birth Certificate page</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>2 hours ago</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>"The link to the state portal is broken and gives a 404 error."</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>Review</button>
                    <button className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>Dismiss</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

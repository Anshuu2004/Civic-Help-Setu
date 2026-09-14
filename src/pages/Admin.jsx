import React, { useState } from 'react';
import { MOCK_SERVICES } from '../data/services';
import { BarChart3, CheckSquare, AlertTriangle, MessageSquare, Users } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = [
    { label: 'Total Services', value: MOCK_SERVICES.length, icon: <CheckSquare size={20} /> },
    { label: 'Verified Services', value: MOCK_SERVICES.filter(s => s.officialSources?.some(src => src.verified)).length, icon: <BarChart3 size={20} /> },
    { label: 'Pending Reports', value: 3, icon: <AlertTriangle size={20} className="text-warning" /> },
    { label: 'AI Queries (Today)', value: 124, icon: <MessageSquare size={20} /> },
    { label: 'Active Contributors', value: 12, icon: <Users size={20} /> },
  ];

  return (
    <div className="container pt-20 pb-24 max-w-5xl">
      <div className="flex justify-between items-center mb-12 border-b border-light pb-6">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <button className="btn btn-secondary text-sm">Logout</button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="flex flex-col gap-2">
            <button 
              className={`text-left px-4 py-3 rounded-md font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-accent-main text-white' : 'hover:bg-secondary'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Overview
            </button>
            <button 
              className={`text-left px-4 py-3 rounded-md font-medium transition-colors ${activeTab === 'services' ? 'bg-accent-main text-white' : 'hover:bg-secondary'}`}
              onClick={() => setActiveTab('services')}
            >
              Manage Services
            </button>
            <button 
              className={`text-left px-4 py-3 rounded-md font-medium transition-colors ${activeTab === 'reports' ? 'bg-accent-main text-white' : 'hover:bg-secondary'}`}
              onClick={() => setActiveTab('reports')}
            >
              Error Reports <span className="ml-2 bg-error text-white text-xs px-2 py-0.5 rounded-full">3</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-xl font-bold mb-6 border-b border-light pb-2">Overview Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="card p-6 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-muted font-medium mb-2">
                      {stat.icon}
                      {stat.label}
                    </div>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-light pb-2">
                <h2 className="text-xl font-bold">Manage Services</h2>
                <button className="btn btn-primary text-sm">Add New Service</button>
              </div>
              
              <div className="bg-white rounded-lg border border-light overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary text-muted text-sm border-b border-light">
                      <th className="p-4 font-semibold">Service Name</th>
                      <th className="p-4 font-semibold">Category</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_SERVICES.slice(0, 5).map(service => (
                      <tr key={service.id} className="border-b border-light hover:bg-secondary transition-colors">
                        <td className="p-4 font-medium">{service.name}</td>
                        <td className="p-4 text-muted text-sm">{service.category}</td>
                        <td className="p-4">
                          <span className="badge bg-green-100 text-green-800" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>Published</span>
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-accent hover:underline text-sm font-medium mr-4">Edit</button>
                          <button className="text-error hover:underline text-sm font-medium">Delete</button>
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
              <h2 className="text-xl font-bold mb-6 border-b border-light pb-2">User Reports</h2>
              <div className="card p-6 border-l-4 border-warning mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">Missing link on Birth Certificate page</h3>
                  <span className="text-xs text-muted">2 hours ago</span>
                </div>
                <p className="text-sm text-muted mb-4">"The link to the state portal is broken and gives a 404 error."</p>
                <div className="flex gap-2">
                  <button className="btn btn-primary text-xs py-1.5 px-3">Review</button>
                  <button className="btn btn-secondary text-xs py-1.5 px-3">Dismiss</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;

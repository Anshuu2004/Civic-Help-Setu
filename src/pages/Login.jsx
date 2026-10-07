import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, KeyRound, User, Users, Lock } from 'lucide-react';

const Login = () => {
  const [activeTab, setActiveTab] = useState('citizen'); // 'citizen' or 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(username, password);
      
      // Strict role checking based on selected tab
      if (activeTab === 'admin' && res.role !== 'admin') {
         throw new Error("Access Denied: Admin privileges required");
      }
      
      if (res.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.message === "Access Denied: Admin privileges required") {
        setError(err.message);
      } else {
        setError('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section flex-center" style={{ minHeight: '85vh', position: 'relative' }}>
      <div className="glow-blob animate-fade-in" style={{ width: '500px', height: '500px', background: activeTab === 'admin' ? 'var(--accent-main)' : 'rgba(255,255,255,0.4)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.1, transition: 'background 0.5s ease' }}></div>
      <div className="glass-panel animate-fade-in delay-100" style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 10, padding: '2.5rem' }}>
        
        {/* Toggle Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', background: 'var(--glass-bg-subtle)', padding: '0.5rem', borderRadius: '1rem', border: '1px solid var(--border-main)' }}>
          <button 
            type="button"
            onClick={() => { setActiveTab('citizen'); setError(''); setUsername(''); setPassword(''); }}
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              borderRadius: '0.75rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              fontWeight: '600',
              transition: 'all 0.3s',
              background: activeTab === 'citizen' ? 'var(--glass-bg-hover)' : 'transparent',
              color: activeTab === 'citizen' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'citizen' ? 'var(--shadow-sm)' : 'none',
              border: activeTab === 'citizen' ? '1px solid var(--border-light)' : '1px solid transparent'
            }}
          >
            <Users size={18} /> Citizen
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('admin'); setError(''); setUsername(''); setPassword(''); }}
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              borderRadius: '0.75rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              fontWeight: '600',
              transition: 'all 0.3s',
              background: activeTab === 'admin' ? 'var(--accent-main)' : 'transparent',
              color: activeTab === 'admin' ? 'var(--bg-main)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'admin' ? '0 0 15px rgba(56,189,248,0.4)' : 'none'
            }}
          >
            <Shield size={18} /> Admin
          </button>
        </div>

        {/* Header Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          {activeTab === 'admin' ? (
             <div style={{ width: '4rem', height: '4rem', borderRadius: '1.25rem', background: 'var(--accent-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: 'var(--shadow-glow)' }}>
               <Lock size={32} color="var(--bg-main)" />
             </div>
          ) : (
             <div style={{ width: '4rem', height: '4rem', borderRadius: '1.25rem', background: 'var(--glass-bg-hover)', border: '1px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
               <User size={32} color="var(--text-primary)" />
             </div>
          )}
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>
            {activeTab === 'admin' ? 'Admin Portal' : 'Citizen Access'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'center' }}>
            {activeTab === 'admin' ? 'Enter administrative credentials' : 'Sign in to track your government services'}
          </p>
        </div>
        
        {error && (
          <div className="animate-fade-in" style={{ padding: '1rem', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', color: 'var(--error)', borderRadius: '0.75rem', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500' }}>
            {error}
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
              <User size={18} />
            </div>
            <input 
              type="text" 
              className="input-field" 
              placeholder={activeTab === 'admin' ? "Admin Username" : "Username"}
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              style={{ paddingLeft: '3rem' }}
              required 
            />
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
              <KeyRound size={18} />
            </div>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ paddingLeft: '3rem' }}
              required 
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              marginTop: '1rem', 
              padding: '1.25rem',
              background: activeTab === 'admin' ? 'var(--text-primary)' : 'var(--glass-bg-hover)',
              color: activeTab === 'admin' ? 'var(--bg-main)' : 'var(--text-primary)',
              border: activeTab === 'citizen' ? '1px solid var(--border-main)' : '1px solid transparent',
              boxShadow: activeTab === 'citizen' ? 'none' : '0 0 15px var(--glass-bg-hover)'
            }} 
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (activeTab === 'admin' ? 'Secure Login' : 'Continue as Citizen')}
          </button>
        </form>

        {activeTab === 'admin' && (
          <div className="animate-fade-in" style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
            <p>Hint: use <span style={{ color: 'var(--text-primary)' }}>esha</span> / <span style={{ color: 'var(--text-primary)' }}>opensource</span></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, LogOut, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="nav-glass animate-fade-in">
      <div className="container flex-between" style={{ height: '100%' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '800', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="var(--bg-main)" fill="currentColor" />
          </div>
          <span style={{ letterSpacing: '-0.02em' }}>CivicBridge</span>
        </Link>
        
        {/* Desktop Nav */}
        <div style={{ display: 'none', gap: '0.5rem', alignItems: 'center' }} className="md-flex">
          <Link to="/services" className="nav-link">Services</Link>
          <Link to="/track" className="nav-link">Track Status</Link>
          <Link to="/assistant" className="nav-link">AI Assistant</Link>
          {user && <Link to="/vault" className="nav-link">Doc Vault</Link>}
          <div style={{ width: '1px', height: '20px', background: 'var(--border-main)', margin: '0 0.5rem' }}></div>
          
          <button onClick={toggleTheme} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.3s' }} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {!user ? (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
              Sign In
            </Link>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link" style={{ color: 'var(--accent-main)', fontWeight: '600' }}>
                  Admin Portal
                </Link>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.85rem', background: 'var(--glass-bg)', borderRadius: '99px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.username}
                    style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <User size={14} color="var(--accent-main)" />
                )}
                <span style={{ color: 'var(--text-primary)', fontWeight: '600', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.username}
                </span>
                <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '99px', background: user.role === 'admin' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(52, 211, 153, 0.15)', color: user.role === 'admin' ? 'var(--accent-main)' : 'var(--success)' }}>
                  {user.role === 'admin' ? 'Admin' : 'Citizen'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', background: 'transparent', border: 'none', transition: 'color 0.2s' }}
                title="Sign Out"
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--error)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Nav Toggle */}
        <button className="md-hidden" style={{ padding: '0.5rem', background: 'var(--glass-bg-hover)', borderRadius: '50%', color: 'var(--text-primary)' }} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-main)' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-main)' }}>
              {user.imageUrl ? (
                <img src={user.imageUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              ) : (
                <User size={20} color="var(--accent-main)" />
              )}
              <div>
                <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.username}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{user.email || user.role}</p>
              </div>
            </div>
          )}
          <Link to="/services" onClick={() => setIsOpen(false)} style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>Services</Link>
          <Link to="/track" onClick={() => setIsOpen(false)} style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>Track Status</Link>
          <Link to="/assistant" onClick={() => setIsOpen(false)} style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>AI Assistant</Link>
          {user && <Link to="/vault" onClick={() => setIsOpen(false)} style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>Document Vault</Link>}
          {user && <Link to="/saved" onClick={() => setIsOpen(false)} style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>Saved Guides</Link>}
          {user && user.role === 'admin' && <Link to="/admin" onClick={() => setIsOpen(false)} style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--accent-main)' }}>Admin Portal</Link>}
          
          <div style={{ width: '100%', height: '1px', background: 'var(--border-main)', margin: '0.5rem 0' }}></div>
          
          {!user ? (
            <Link to="/login" onClick={() => setIsOpen(false)} style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>Sign In</Link>
          ) : (
            <button onClick={() => { handleLogout(); setIsOpen(false); }} style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--error)', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>Sign Out</button>
          )}
        </div>
      )}
      <style>{`
        @media (min-width: 768px) {
          .md-flex { display: flex !important; }
          .md-hidden { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

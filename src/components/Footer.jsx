import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border-main)', padding: '4rem 0', marginTop: 'auto', backgroundColor: 'var(--bg-main)' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} fill="var(--bg-main)" color="var(--bg-main)" />
          </div>
          <span style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>CivicBridge</span>
          <span style={{ fontSize: '1rem', marginLeft: '0.5rem' }}>&copy; {new Date().getFullYear()} Open Source Project.</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
          <Link to="/privacy" style={{ transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Privacy Policy</Link>
          <Link to="/open-source" style={{ transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Open Source</Link>
          <Link to="/admin" style={{ transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Admin Portal</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

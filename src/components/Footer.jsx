import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border-light)', padding: '2rem 0', marginTop: '4rem', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
        <div>
          &copy; {new Date().getFullYear()} CivicBridge. Open Source Project.
        </div>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
          <Link to="/open-source" className="hover:text-primary">Open Source</Link>
          <Link to="/admin" className="hover:text-primary">Admin</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

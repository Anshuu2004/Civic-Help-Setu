import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="nav-glass" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="container flex items-center justify-between" style={{ height: '5rem' }}>
        <Link to="/" className="flex items-center gap-2 font-bold text-3xl text-accent hover:scale-105 transition-transform origin-left">
          <Shield size={32} className="text-accent animate-float" fill="currentColor" opacity={0.2} />
          <span style={{ letterSpacing: '-0.02em' }}>CivicBridge</span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-lg">
          <Link to="/services" className="nav-link">Services</Link>
          <Link to="/assistant" className="nav-link">AI Assistant</Link>
          <Link to="/saved" className="nav-link">Saved Guides</Link>
          <Link to="/open-source" className="nav-link">Open Source</Link>
        </div>

        {/* Mobile Nav Toggle */}
        <button className="md:hidden text-accent hover:bg-accent-light p-2 rounded-full transition-colors" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden flex flex-col gap-4 overflow-hidden transition-all duration-300 ease-in-out bg-white/95 backdrop-blur-md border-t border-light`}
        style={{ 
          maxHeight: isOpen ? '400px' : '0', 
          opacity: isOpen ? 1 : 0,
          padding: isOpen ? '1rem 2rem 2rem' : '0 2rem'
        }}
      >
        <Link to="/services" onClick={() => setIsOpen(false)} className="text-xl font-bold text-muted hover:text-accent py-2 border-b border-light">Services</Link>
        <Link to="/assistant" onClick={() => setIsOpen(false)} className="text-xl font-bold text-muted hover:text-accent py-2 border-b border-light">AI Assistant</Link>
        <Link to="/saved" onClick={() => setIsOpen(false)} className="text-xl font-bold text-muted hover:text-accent py-2 border-b border-light">Saved Guides</Link>
        <Link to="/open-source" onClick={() => setIsOpen(false)} className="text-xl font-bold text-muted hover:text-accent py-2">Open Source</Link>
      </div>
    </nav>
  );
};

export default Navbar;

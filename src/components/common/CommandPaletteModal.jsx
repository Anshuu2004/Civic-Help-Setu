import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, Shield, Sun, Moon, PhoneCall, HelpCircle, ArrowRight, CornerDownLeft, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { services } from '../../data/services';
import { useTheme } from '../../context/ThemeContext';
import KbdBadge from './KbdBadge';

const STATIC_COMMANDS = [
  { id: 'nav-home', title: 'Home Dashboard', type: 'page', path: '/', icon: Compass, description: 'Return to welcome portal' },
  { id: 'nav-services', title: 'Public Services Directory', type: 'page', path: '/services', icon: FileText, description: 'Browse all government procedures and schemes' },
  { id: 'nav-eligibility', title: 'Universal Eligibility Wizard', type: 'page', path: '/eligibility', icon: CheckCircle2, description: 'Assess scheme qualification in 3 steps' },
  { id: 'nav-nearby', title: 'Nearby Centers & Office Map', type: 'page', path: '/nearby', icon: Compass, description: 'Locate PSK, RTO, and municipal centers' },
  { id: 'nav-track', title: 'Track Application Status', type: 'page', path: '/track', icon: Search, description: 'Check progress using Reference ID' },
  { id: 'nav-vault', title: 'Document Vault', type: 'page', path: '/vault', icon: Shield, description: 'Encrypted citizen document storage' }
];

const CommandPaletteModal = ({ isOpen, onClose, onOpenShortcuts, onOpenSos }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Compute matched items
  const cleanQ = query.toLowerCase().trim();

  const matchingServices = cleanQ
    ? services.filter(s =>
        s.title.toLowerCase().includes(cleanQ) ||
        (s.department && s.department.toLowerCase().includes(cleanQ)) ||
        (s.category && s.category.toLowerCase().includes(cleanQ))
      ).slice(0, 5).map(s => ({
        id: `srv-${s.id}`,
        title: s.title,
        type: 'service',
        path: `/services/${s.id}`,
        icon: FileText,
        description: s.department || s.category
      }))
    : [];

  const matchingPages = STATIC_COMMANDS.filter(cmd =>
    !cleanQ || cmd.title.toLowerCase().includes(cleanQ) || cmd.description.toLowerCase().includes(cleanQ)
  );

  const actionItems = [
    {
      id: 'act-theme',
      title: `Toggle Theme (${theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'})`,
      type: 'action',
      icon: theme === 'dark' ? Sun : Moon,
      description: 'Instant visual theme shift',
      action: () => toggleTheme()
    },
    {
      id: 'act-sos',
      title: 'Emergency 24x7 Helplines (SOS)',
      type: 'action',
      icon: PhoneCall,
      description: 'Rapid dial 112, 1930, 1091',
      action: () => {
        onClose();
        if (onOpenSos) onOpenSos();
      }
    },
    {
      id: 'act-shortcuts',
      title: 'Keyboard Shortcuts Reference',
      type: 'action',
      icon: HelpCircle,
      description: 'View all quick keys (? key)',
      action: () => {
        onClose();
        if (onOpenShortcuts) onOpenShortcuts();
      }
    }
  ].filter(act => !cleanQ || act.title.toLowerCase().includes(cleanQ));

  const allItems = [...matchingServices, ...matchingPages, ...actionItems];

  const handleSelect = (item) => {
    if (!item) return;
    onClose();
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        handleSelect(allItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1250,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '10vh 1rem 1rem 1rem'
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Civic Command Palette"
    >
      <div
        className="card-glass animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '640px',
          borderRadius: '1.25rem',
          background: 'var(--bg-card, #111827)',
          border: '1px solid var(--border-light, rgba(255, 255, 255, 0.15))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-light)',
            gap: '0.75rem',
            background: 'var(--glass-bg)'
          }}
        >
          <Search size={20} color="var(--accent-main)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a service, department, or command..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1.1rem',
              color: 'var(--text-primary)'
            }}
          />
          <KbdBadge>Esc</KbdBadge>
        </div>

        {/* Results Stream */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '0.5rem' }}>
          {allItems.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p>No matching service or command found for "{query}".</p>
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              const IconComponent = item.icon || FileText;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.65rem',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    border: isSelected ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '0.5rem',
                        background: isSelected ? 'var(--accent-main)' : 'var(--glass-bg)',
                        color: isSelected ? 'var(--bg-main)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s'
                      }}
                    >
                      <IconComponent size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.925rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-main)', fontSize: '0.75rem' }}>
                      <span>Jump</span>
                      <CornerDownLeft size={13} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div
          style={{
            padding: '0.65rem 1.25rem',
            borderTop: '1px solid var(--border-light)',
            background: 'var(--glass-bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <KbdBadge>↑</KbdBadge> <KbdBadge>↓</KbdBadge> Navigate
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <KbdBadge>Enter</KbdBadge> Select
            </span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <KbdBadge>?</KbdBadge> Shortcuts Help
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPaletteModal;

import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import KbdBadge from './KbdBadge';

const SHORTCUTS = [
  { keys: ['Ctrl', 'K'], label: 'Open Civic Command Palette (Global Search)' },
  { keys: ['Alt', 'E'], label: 'Trigger 24x7 Emergency SOS & Helplines' },
  { keys: ['?'], label: 'Open Keyboard Shortcuts Help Reference' },
  { keys: ['Esc'], label: 'Close Active Modal, Drawer or Search Palette' },
  { keys: ['Tab'], label: 'Move Focus to Next Interactive Element' },
  { keys: ['Shift', 'Tab'], label: 'Move Focus to Previous Interactive Element' },
  { keys: ['Enter'], label: 'Execute Selected Search Result or Button' }
];

const KeyboardShortcutsHelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="card-glass animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: '1.25rem',
          background: 'var(--bg-card, #111827)',
          border: '1px solid var(--border-light, rgba(255, 255, 255, 0.1))',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--glass-bg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.75rem',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--accent-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Keyboard size={20} />
            </div>
            <div>
              <h2 id="shortcuts-title" style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Keyboard Shortcuts Reference
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Speed up navigation and accessible screen controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Shortcuts List */}
        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '0.5rem',
                background: 'var(--glass-bg-subtle)',
                border: '1px solid var(--border-light)'
              }}
            >
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {item.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {item.keys.map((k, kIdx) => (
                  <React.Fragment key={kIdx}>
                    <KbdBadge>{k}</KbdBadge>
                    {kIdx < item.keys.length - 1 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>+</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelpModal;

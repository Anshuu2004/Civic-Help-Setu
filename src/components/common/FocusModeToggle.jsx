import { BookOpen } from 'lucide-react';

const FocusModeToggle = ({ enabled, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={enabled}
    title={
      enabled
        ? 'Exit focus mode and return to the standard layout'
        : 'Switch to a reading layout. Nothing is hidden or changed.'
    }
    className="focus-mode-toggle"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.35rem 0.85rem',
      borderRadius: '99px',
      background: enabled ? 'rgba(56, 189, 248, 0.2)' : 'var(--glass-bg)',
      border: enabled ? '1px solid var(--accent-main)' : '1px solid var(--border-light)',
      color: enabled ? 'var(--accent-main)' : 'var(--text-secondary)',
      fontSize: '0.85rem',
      fontWeight: enabled ? '700' : '500',
      cursor: 'pointer',
    }}
  >
    <BookOpen size={14} color="var(--accent-main)" aria-hidden="true" />
    <span>{enabled ? 'Focus mode: On' : 'Focus mode'}</span>
  </button>
);

export default FocusModeToggle;

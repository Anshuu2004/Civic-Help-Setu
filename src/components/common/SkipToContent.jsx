import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Compass, Home, ArrowDown } from 'lucide-react';
import {
  focusLandmark,
  announceToScreenReader,
  registerSkipKeyboardShortcuts,
  DEFAULT_SKIP_TARGETS,
} from '../../utils/a11yLandmarks';

/**
 * SkipToContent Component
 * Provides keyboard and screen-reader users with instant jump links to main landmarks.
 * Stays hidden off-screen until focused via Tab key or keyboard shortcut.
 *
 * Conforms to WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks).
 */
const SkipToContent = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [activeTarget, setActiveTarget] = useState(null);
  const containerRef = useRef(null);

  // Set up global accessibility shortcut keys (Alt+M, Alt+N, Alt+F)
  useEffect(() => {
    const unregister = registerSkipKeyboardShortcuts((targetId) => {
      const success = focusLandmark(targetId);
      if (success) {
        announceToScreenReader(`Jumped directly to ${targetId.replace('-', ' ')}`);
      }
    });

    return () => unregister();
  }, []);

  const handleSkip = (targetId, label, e) => {
    if (e) e.preventDefault();
    setActiveTarget(targetId);

    const success = focusLandmark(targetId, { scrollOffset: 70 });
    if (success) {
      announceToScreenReader(`Navigated to ${label}`);
    }

    // Hide container after activation
    setIsFocused(false);
  };

  return (
    <div
      ref={containerRef}
      className={`skip-links-banner ${isFocused ? 'is-focused' : ''}`}
      role="region"
      aria-label="Accessibility Skip Links"
      style={{
        position: 'fixed',
        top: isFocused ? '0.75rem' : '-200px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
        background: 'var(--bg-card, #1e293b)',
        color: 'var(--text-primary, #ffffff)',
        border: '2px solid var(--accent-main, #38bdf8)',
        borderRadius: '0.75rem',
        padding: '0.625rem 1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        transition: 'top 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
        opacity: isFocused ? 1 : 0,
        pointerEvents: isFocused ? 'auto' : 'none',
        maxWidth: '90vw',
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--accent-main, #38bdf8)',
          borderRight: '1px solid var(--border-main, rgba(255,255,255,0.15))',
          paddingRight: '0.75rem',
        }}
      >
        <Compass size={16} aria-hidden="true" />
        <span>Skip Links</span>
      </div>

      <nav
        aria-label="Skip targets"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        {DEFAULT_SKIP_TARGETS.map((target, idx) => (
          <a
            key={target.id}
            href={`#${target.id}`}
            className="skip-link-action"
            onClick={(e) => handleSkip(target.id, target.label, e)}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              // Only blur if focus leaves the whole skip container
              if (!containerRef.current?.contains(e.relatedTarget)) {
                setIsFocused(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleSkip(target.id, target.label, e);
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.4rem 0.75rem',
              background: idx === 0 ? 'var(--accent-main, #38bdf8)' : 'rgba(255,255,255,0.08)',
              color: idx === 0 ? '#000000' : 'var(--text-primary, #ffffff)',
              borderRadius: '0.375rem',
              fontWeight: '700',
              fontSize: '0.875rem',
              textDecoration: 'none',
              outline: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, transform 0.15s ease',
            }}
          >
            {idx === 0 ? (
              <ArrowDown size={14} aria-hidden="true" />
            ) : (
              <ChevronRight size={14} aria-hidden="true" />
            )}
            <span>{target.label}</span>
            <kbd
              style={{
                fontSize: '0.7rem',
                opacity: 0.8,
                padding: '0.1rem 0.3rem',
                borderRadius: '0.25rem',
                background: idx === 0 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)',
                marginLeft: '0.25rem',
              }}
            >
              {target.shortcut}
            </kbd>
          </a>
        ))}
      </nav>

      <span
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted, #94a3b8)',
          marginLeft: 'auto',
          paddingLeft: '0.5rem',
        }}
      >
        Press Tab to cycle &bull; Enter to select
      </span>
    </div>
  );
};

export default SkipToContent;

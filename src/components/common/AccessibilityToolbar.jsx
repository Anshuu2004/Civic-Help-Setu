import { useState } from 'react';
import {
  Eye,
  Type,
  Volume2,
  VolumeX,
  RotateCcw,
  Sliders,
  X,
  Check,
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useToast } from '../../context/ToastContext';

const AccessibilityToolbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    fontSizeScale,
    setFontSizeScale,
    cycleFontSize,
    isHighContrast,
    toggleHighContrast,
    isDyslexicFont,
    toggleDyslexicFont,
    isSpeaking,
    speakText,
    stopSpeaking,
    resetAccessibility,
  } = useAccessibility();
  const { toast } = useToast();

  const handleReadPage = () => {
    if (isSpeaking) {
      stopSpeaking();
      toast?.info?.('Speech playback stopped.');
    } else {
      // Find main readable content
      const mainEl = document.querySelector('main') || document.body;
      const textToRead = mainEl.innerText.slice(0, 1000);
      speakText(textToRead);
      toast?.success?.('Reading page content aloud...', 'Screen Reader Active');
    }
  };

  const handleContrastClick = () => {
    toggleHighContrast();
    toast?.info?.(!isHighContrast ? 'High Contrast Mode Enabled' : 'Standard Contrast Restored');
  };

  return (
    <>
      {/* Floating or Docked Trigger Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
        }}
      >
        {!isOpen ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open accessibility options menu"
            title="Accessibility Controls (Contrast, Font Size, Audio Reader)"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--accent-main)',
              color: '#ffffff',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Sliders size={22} />
          </button>
        ) : (
          <div
            className="glass-panel animate-fade-in"
            style={{
              padding: '1.25rem',
              borderRadius: '1rem',
              width: '300px',
              border: '2px solid var(--accent-main)',
              background: 'var(--card-bg, #0f172a)',
              boxShadow: 'var(--shadow-2xl)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border-light)',
                paddingBottom: '0.5rem',
              }}
            >
              <span style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Accessibility Controls
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close accessibility controls"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Font Size Scaling */}
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Text Size
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {[
                  { id: 'normal', label: '100% (A)' },
                  { id: 'large', label: '125% (A+)' },
                  { id: 'xlarge', label: '150% (A++)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFontSizeScale(s.id)}
                    style={{
                      flex: 1,
                      padding: '0.45rem',
                      borderRadius: '0.4rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      border: `1.5px solid ${fontSizeScale === s.id ? 'var(--accent-main)' : 'var(--border-light)'}`,
                      background: fontSizeScale === s.id ? 'var(--accent-main)' : 'var(--glass-bg)',
                      color: fontSizeScale === s.id ? '#ffffff' : 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast Mode Toggle */}
            <div style={{ marginBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={handleContrastClick}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: `1.5px solid ${isHighContrast ? '#facc15' : 'var(--border-light)'}`,
                  background: isHighContrast ? 'rgba(250, 204, 21, 0.15)' : 'var(--glass-bg)',
                  color: isHighContrast ? '#facc15' : 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye size={16} /> High-Contrast Mode
                </span>
                {isHighContrast && <Check size={16} />}
              </button>
            </div>

            {/* Read Page Aloud (TTS) */}
            <div style={{ marginBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={handleReadPage}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: `1.5px solid ${isSpeaking ? '#10b981' : 'var(--border-light)'}`,
                  background: isSpeaking ? 'rgba(16, 185, 129, 0.15)' : 'var(--glass-bg)',
                  color: isSpeaking ? '#10b981' : 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  {isSpeaking ? 'Stop Reading' : 'Read Page Aloud'}
                </span>
              </button>
            </div>

            {/* Reset Controls */}
            <button
              type="button"
              onClick={() => {
                resetAccessibility();
                toast?.info?.('Accessibility settings reset to default.');
              }}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: 'var(--text-tertiary)',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                padding: '0.4rem 0',
                marginTop: '0.5rem',
              }}
            >
              <RotateCcw size={12} /> Reset to Defaults
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AccessibilityToolbar;

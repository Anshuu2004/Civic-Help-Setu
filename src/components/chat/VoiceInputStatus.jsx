import { Mic, MicOff, AlertCircle, X } from 'lucide-react';

const VoiceInputStatus = ({ isListening, voiceError, onDismissError }) => {
  if (!isListening && !voiceError) return null;

  return (
    <div
      style={{
        marginBottom: '1rem',
        animation: 'fadeInUp 0.3s ease',
      }}
    >
      {isListening && (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 1rem',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '0.75rem',
            color: 'var(--accent-main)',
            fontSize: '0.85rem',
            fontWeight: '600',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#ef4444',
              animation: 'pulse 1s infinite',
            }}
          />
          <Mic size={16} />
          <span>Listening... Speak clearly into your microphone in English or Hindi.</span>
        </div>
      )}

      {voiceError && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.65rem 1rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.75rem',
            color: 'var(--error, #ef4444)',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{voiceError}</span>
          </div>
          <button
            type="button"
            onClick={onDismissError}
            aria-label="Dismiss error"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--error, #ef4444)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default VoiceInputStatus;

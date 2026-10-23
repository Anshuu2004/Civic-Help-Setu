import React, { useState, useEffect } from 'react';
import { PhoneCall } from 'lucide-react';
import EmergencyHelplineModal from './EmergencyHelplineModal';

const QuickEmergencyFab = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + E shortcut
      if (e.altKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Emergency SOS Helplines (Shortcut: Alt + E)"
        title="Emergency SOS Helplines (Alt + E)"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 990,
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: '#ffffff',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.6), 0 0 15px rgba(239, 68, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          animation: 'pulse 2s infinite'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <PhoneCall size={22} />
      </button>

      <EmergencyHelplineModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default QuickEmergencyFab;

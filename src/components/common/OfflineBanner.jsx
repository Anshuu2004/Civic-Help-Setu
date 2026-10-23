import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, HardDrive, X } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import OfflineCacheStatusModal from './OfflineCacheStatusModal';

const OfflineBanner = () => {
  const { isOnline, wasOffline, checkConnection, isChecking } = useNetwork();
  const [dismissed, setDismissed] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
      setShowRestored(false);
    } else if (wasOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (showRestored) {
    return (
      <div 
        style={{
          background: '#10b981',
          color: '#ffffff',
          padding: '0.5rem 1rem',
          fontSize: '0.85rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          zIndex: 105,
          position: 'relative',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
        }}
      >
        <Wifi size={16} />
        <span>Internet connection restored! All services back online.</span>
      </div>
    );
  }

  if (isOnline || dismissed) return null;

  return (
    <>
      <div 
        style={{
          background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
          color: '#ffffff',
          padding: '0.6rem 1rem',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          zIndex: 105,
          position: 'relative',
          boxShadow: '0 2px 10px rgba(220, 38, 38, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <WifiOff size={18} />
          <span>
            <strong>Offline Mode Active:</strong> You are currently disconnected. Your pre-cached guides and tokens remain accessible.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={() => setShowStatusModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              color: '#ffffff',
              padding: '0.25rem 0.65rem',
              borderRadius: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <HardDrive size={13} /> View Cached Guides
          </button>

          <button
            type="button"
            onClick={checkConnection}
            disabled={isChecking}
            style={{
              background: '#ffffff',
              border: 'none',
              color: '#b91c1c',
              padding: '0.25rem 0.65rem',
              borderRadius: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <RefreshCw size={13} className={isChecking ? 'animate-spin' : ''} /> Retry
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss offline banner"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.8)',
              padding: '0.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <OfflineCacheStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
      />
    </>
  );
};

export default OfflineBanner;

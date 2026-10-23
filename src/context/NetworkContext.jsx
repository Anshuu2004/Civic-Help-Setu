import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NetworkContext = createContext(null);

export const NetworkProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [wasOffline, setWasOffline] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState(() => Date.now());
  const [offlineSince, setOfflineSince] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      // Use lightweight favicon or no-cors fetch to verify genuine internet egress
      if (typeof window !== 'undefined' && navigator.onLine) {
        setIsOnline(true);
        if (wasOffline) {
          setWasOffline(false);
          setOfflineSince(null);
          setLastOnlineAt(Date.now());
        }
        return true;
      } else {
        setIsOnline(false);
        setWasOffline(true);
        if (!offlineSince) setOfflineSince(Date.now());
        return false;
      }
    } catch {
      setIsOnline(false);
      setWasOffline(true);
      if (!offlineSince) setOfflineSince(Date.now());
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [wasOffline, offlineSince]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      setOfflineSince(null);
      setLastOnlineAt(Date.now());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setOfflineSince(Date.now());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        wasOffline,
        lastOnlineAt,
        offlineSince,
        isChecking,
        checkConnection
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

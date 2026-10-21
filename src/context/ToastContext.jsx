import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', title = '', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast = { id, message, type, title, duration };

    setToasts((prev) => [...prev.slice(-4), newToast]); // Keep maximum 5 concurrent toasts

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return id;
  }, [dismissToast]);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = {
    show: showToast,
    success: (msg, title) => showToast(msg, 'success', title),
    error: (msg, title) => showToast(msg, 'error', title),
    info: (msg, title) => showToast(msg, 'info', title),
    warning: (msg, title) => showToast(msg, 'warning', title),
    dismiss: dismissToast,
    clear: clearToasts
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, clearToasts, toast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

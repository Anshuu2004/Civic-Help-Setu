import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle2,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    defaultTitle: 'Success'
  },
  error: {
    icon: AlertCircle,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    defaultTitle: 'Error'
  },
  warning: {
    icon: AlertTriangle,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    defaultTitle: 'Warning'
  },
  info: {
    icon: Info,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
    defaultTitle: 'Information'
  }
};

const ToastItem = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const config = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;
  const IconComponent = config.icon;

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;

    const intervalTime = 50;
    const totalSteps = toast.duration / intervalTime;
    const stepDecrement = 100 / totalSteps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= stepDecrement) {
          clearInterval(timer);
          return 0;
        }
        return prev - stepDecrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast.duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.85rem 1rem',
        borderRadius: '0.75rem',
        background: 'var(--bg-surface)',
        border: `1px solid ${config.borderColor}`,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        minWidth: '280px',
        maxWidth: '380px',
        overflow: 'hidden',
        animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '50%',
          background: config.bgColor,
          color: config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <IconComponent size={18} />
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
          {toast.title || config.defaultTitle}
        </p>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          padding: '0.25rem',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.375rem',
          transition: 'color 0.2s'
        }}
      >
        <X size={15} />
      </button>

      {/* Progress bar */}
      {toast.duration > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            width: `${progress}%`,
            backgroundColor: config.color,
            transition: 'width 50ms linear'
          }}
        />
      )}
    </div>
  );
};

export default ToastItem;

import { useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, Info, X, Trash2, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * Reusable Confirmation Dialog
 * Adheres strictly to WCAG 2.1 alertdialog guidelines:
 * - role="alertdialog"
 * - aria-labelledby & aria-describedby
 * - Keyboard Escape cancellation
 * - Focus defaulted to Cancel button to prevent accidental data destruction
 * - While isLoading, every way of closing the dialog is ignored so the pending
 *   action cannot be abandoned half way or submitted twice
 * - errorMessage keeps the dialog open and announces the failure inline
 */
const ConfirmationDialog = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  itemName = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  isLoading = false,
  errorMessage = '',
  onConfirm,
  onCancel,
}) => {
  const cancelButtonRef = useRef(null);
  const dialogRef = useRef(null);

  // Focus Cancel button upon opening for safety against accidental Enter presses
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (cancelButtonRef.current) {
          cancelButtonRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Trap Escape key (ignored while the action is running)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (!isLoading) onCancel?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          icon: <AlertCircle size={28} color="#f59e0b" />,
          iconBg: 'rgba(245, 158, 11, 0.12)',
          buttonBg: '#f59e0b',
          buttonBorder: '#f59e0b',
          buttonColor: '#ffffff',
        };
      case 'info':
        return {
          icon: <Info size={28} color="#3b82f6" />,
          iconBg: 'rgba(59, 130, 246, 0.12)',
          buttonBg: '#3b82f6',
          buttonBorder: '#3b82f6',
          buttonColor: '#ffffff',
        };
      case 'danger':
      default:
        return {
          icon: <AlertTriangle size={28} color="#ef4444" />,
          iconBg: 'rgba(239, 68, 68, 0.12)',
          buttonBg: '#ef4444',
          buttonBorder: '#ef4444',
          buttonColor: '#ffffff',
        };
    }
  };

  const currentStyles = getVariantStyles();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      aria-busy={isLoading}
      ref={dialogRef}
      onClick={(e) => {
        // Clicking backdrop cancels
        if (e.target === dialogRef.current && !isLoading) {
          onCancel?.();
        }
      }}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'var(--bg-main, #0f172a)',
          border: '1px solid var(--border-main)',
          borderRadius: '1.25rem',
          padding: '2rem',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Close Icon */}
        <button
          onClick={onCancel}
          type="button"
          aria-label="Cancel confirmation"
          disabled={isLoading}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'var(--glass-bg)',
            border: 'none',
            color: 'var(--text-secondary)',
            padding: '0.45rem',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <X size={18} />
        </button>

        {/* Header with Icon */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '3.25rem',
              height: '3.25rem',
              borderRadius: '0.85rem',
              background: currentStyles.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {currentStyles.icon}
          </div>

          <div>
            <h3
              id="confirmation-dialog-title"
              style={{
                fontSize: '1.25rem',
                fontWeight: '800',
                margin: '0 0 0.35rem 0',
                color: 'var(--text-primary)',
              }}
            >
              {title}
            </h3>
            <p
              id="confirmation-dialog-description"
              style={{
                margin: 0,
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
              }}
            >
              {message}
            </p>
          </div>
        </div>

        {/* Item Highlight Pill (if specified) */}
        {itemName && (
          <div
            style={{
              background: 'var(--glass-bg, rgba(255,255,255,0.03))',
              border: '1px solid var(--border-main)',
              borderRadius: '0.65rem',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: '700' }}>
              Target:
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
              {itemName}
            </span>
          </div>
        )}

        {/* Inline failure message, announced to screen readers */}
        {errorMessage && (
          <p
            role="alert"
            data-testid="confirmation-dialog-error"
            style={{
              margin: '0 0 1.25rem 0',
              padding: '0.75rem 1rem',
              borderRadius: '0.65rem',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              lineHeight: '1.5',
            }}
          >
            {errorMessage}
          </p>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            borderTop: '1px solid var(--border-main)',
            paddingTop: '1.25rem',
            marginTop: itemName ? 0 : '1.5rem',
          }}
        >
          {/* Cancel button receives default focus */}
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn btn-secondary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem', fontWeight: '600' }}
          >
            {cancelLabel}
          </button>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="btn"
            style={{
              padding: '0.65rem 1.35rem',
              fontSize: '0.875rem',
              fontWeight: '700',
              background: currentStyles.buttonBg,
              borderColor: currentStyles.buttonBorder,
              color: currentStyles.buttonColor,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: variant === 'danger' ? '0 4px 14px rgba(239, 68, 68, 0.35)' : 'none',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {variant === 'danger' && <Trash2 size={15} />}
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;

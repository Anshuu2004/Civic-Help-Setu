import { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmationDialog from '../components/common/ConfirmationDialog';

const ConfirmationDialogContext = createContext(null);

export const ConfirmationDialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    itemName: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'danger',
    isLoading: false,
  });

  const resolverRef = useRef(null);

  /**
   * Triggers a confirmation dialog and returns a Promise resolving to boolean
   * @param {Object} options
   * @returns {Promise<boolean>}
   */
  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialogState({
        isOpen: true,
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure you want to proceed?',
        itemName: options.itemName || '',
        confirmLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        variant: options.variant || 'danger',
        isLoading: false,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  return (
    <ConfirmationDialogContext.Provider value={{ confirm }}>
      {children}
      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        itemName={dialogState.itemName}
        confirmLabel={dialogState.confirmLabel}
        cancelLabel={dialogState.cancelLabel}
        variant={dialogState.variant}
        isLoading={dialogState.isLoading}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmationDialogContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmationDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmationDialogProvider');
  }
  return context.confirm;
};

export default ConfirmationDialogContext;

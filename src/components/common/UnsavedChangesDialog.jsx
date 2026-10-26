import ConfirmationDialog from './ConfirmationDialog';

/** Stay / discard prompt shown when unsaved changes would be lost. */
const UnsavedChangesDialog = ({ isOpen, onStay, onDiscard }) => (
  <ConfirmationDialog
    isOpen={isOpen}
    variant="warning"
    title="Discard unsaved changes?"
    message="You have changes that have not been saved. If you leave now, they will be lost."
    confirmLabel="Discard changes"
    cancelLabel="Keep editing"
    onConfirm={onDiscard}
    onCancel={onStay}
  />
);

export default UnsavedChangesDialog;

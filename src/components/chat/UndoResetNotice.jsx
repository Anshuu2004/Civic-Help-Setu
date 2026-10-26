import { useEffect, useRef } from 'react';
import { Undo2 } from 'lucide-react';

// Says only that the chat was cleared, never what was in it.
const UndoResetNotice = ({ seconds = 10, onUndo, containerRef }) => {
  const undoRef = useRef(null);

  // Keyboard users get to the Undo button straight after the dialog closes
  useEffect(() => {
    undoRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      ref={containerRef}
      role="status"
      aria-live="polite"
      style={{
        // Stays just above the sticky input bar while the chat is scrolled
        position: 'sticky',
        bottom: '6rem',
        zIndex: 40,
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        flexWrap: 'wrap',
        padding: '0.75rem 1rem',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-main)',
        borderRadius: '0.85rem',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
      }}
    >
      <span>Conversation cleared. You can undo this for {seconds} seconds.</span>
      <button
        ref={undoRef}
        type="button"
        onClick={onUndo}
        className="btn btn-primary"
        style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem', borderRadius: '99px', gap: '0.35rem' }}
      >
        <Undo2 size={14} aria-hidden="true" /> Undo
      </button>
    </div>
  );
};

export default UndoResetNotice;

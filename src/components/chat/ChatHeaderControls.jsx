import { Download, Trash2, Printer, Sparkles } from 'lucide-react';
import { exportChatAsMarkdown } from '../../services/chatStorage';

const ChatHeaderControls = ({ messages = [], onClear }) => {
  const messageCount = messages.filter((m) => m.role === 'user').length;

  const handleExport = () => {
    exportChatAsMarkdown(messages);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearClick = () => {
    if (window.confirm('Are you sure you want to clear your current consultation session?')) {
      onClear();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.25rem',
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-light)',
        borderRadius: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--success, #10b981)',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
          }}
        />
        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
          Civic Assistant Session: <strong>{messageCount}</strong> {messageCount === 1 ? 'query' : 'queries'} answered
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={handleExport}
          className="btn"
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.8rem',
            background: 'var(--glass-bg-subtle)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-secondary)',
            borderRadius: '99px',
            gap: '0.35rem',
          }}
          title="Save discussion as Markdown note"
        >
          <Download size={14} /> Export Transcript
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="btn"
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.8rem',
            background: 'var(--glass-bg-subtle)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-secondary)',
            borderRadius: '99px',
            gap: '0.35rem',
          }}
          title="Print consultation for in-person office visits"
        >
          <Printer size={14} /> Print
        </button>

        <button
          type="button"
          onClick={handleClearClick}
          className="btn"
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.8rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--error, #ef4444)',
            borderRadius: '99px',
            gap: '0.35rem',
          }}
          title="Start a fresh chat"
        >
          <Trash2 size={14} /> Clear
        </button>
      </div>
    </div>
  );
};

export default ChatHeaderControls;

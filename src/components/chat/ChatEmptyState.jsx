const ChatEmptyState = ({ prompts = [], onSelectPrompt, disabled = false }) => (
  <section aria-labelledby="chat-empty-title" style={{ marginBottom: '1.5rem' }}>
    <h2 id="chat-empty-title" style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.35rem' }}>
      What can I help you with?
    </h2>
    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
      Ask about public services in plain language. I can explain who is eligible, which documents you
      need, the fees, the steps to apply and the official portals. Pick an example below or type your own question.
    </p>
    <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
      Try asking
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
      {prompts.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onSelectPrompt?.(item.prompt)}
          disabled={disabled}
          className="card"
          style={{ textAlign: 'left', padding: '0.75rem 1rem', cursor: disabled ? 'not-allowed' : 'pointer', background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
        >
          <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--accent-main)' }}>{item.label}</strong>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.prompt}</span>
        </button>
      ))}
    </div>
  </section>
);

export default ChatEmptyState;

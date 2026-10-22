const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="skip-to-content"
      style={{
        position: 'absolute',
        top: '-100px',
        left: '1rem',
        zIndex: 99999,
        padding: '0.75rem 1.25rem',
        background: 'var(--accent-main, #38bdf8)',
        color: '#000000',
        fontWeight: '800',
        borderRadius: '0.5rem',
        boxShadow: 'var(--shadow-xl)',
        textDecoration: 'none',
        transition: 'top 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onFocus={(e) => {
        e.currentTarget.style.top = '1rem';
      }}
      onBlur={(e) => {
        e.currentTarget.style.top = '-100px';
      }}
    >
      Skip to Main Content (Press Enter)
    </a>
  );
};

export default SkipToContent;

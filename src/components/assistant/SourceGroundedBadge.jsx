import { ShieldCheck, AlertTriangle, ExternalLink, HelpCircle } from 'lucide-react';

/**
 * SourceGroundedBadge Component (#77)
 * Visual indicator that proves the assistant answer is grounded in verified government documents.
 */
const SourceGroundedBadge = ({ grounded, confidenceScore, sourcesCount, onToggleDetails }) => {
  if (!grounded) {
    return (
      <div
        className="source-grounded-badge unverified animate-fade-in"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.25rem 0.6rem',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          fontWeight: '700',
          background: 'rgba(239, 68, 68, 0.12)',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          marginBottom: '0.75rem',
        }}
      >
        <AlertTriangle size={13} aria-hidden="true" />
        <span>No Verified Official Source Found &bull; Unsupported Inquiries Disclosed</span>
      </div>
    );
  }

  const confidencePct = Math.round((confidenceScore || 0) * 100);

  return (
    <div
      className="source-grounded-badge verified animate-fade-in"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.3rem 0.75rem',
        borderRadius: '0.5rem',
        fontSize: '0.75rem',
        fontWeight: '700',
        background: 'rgba(34, 197, 94, 0.12)',
        color: '#4ade80',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        marginBottom: '0.75rem',
      }}
    >
      <ShieldCheck size={14} aria-hidden="true" />
      <span>Source-Grounded Retrieval ({confidencePct}% Match &bull; {sourcesCount || 1} Official Sources)</span>
      {onToggleDetails && (
        <button
          type="button"
          onClick={onToggleDetails}
          style={{
            background: 'none',
            border: 'none',
            color: 'currentColor',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.75rem',
            fontWeight: '600',
            marginLeft: '0.25rem',
          }}
        >
          View Citations
        </button>
      )}
    </div>
  );
};

export default SourceGroundedBadge;

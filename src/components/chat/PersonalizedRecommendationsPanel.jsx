import { useState, useEffect } from 'react';
import {
  Sparkles,
  Bookmark,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Lock,
} from 'lucide-react';
import {
  buildPersonalizedContext,
  getAIContextConsent,
  setAIContextConsent,
} from '../../ai/contextRecommender';
import { useToast } from '../../context/ToastContext';

const PersonalizedRecommendationsPanel = ({ onSelectPrompt = () => {} }) => {
  const { toast } = useToast();
  const [contextData, setContextData] = useState(() => buildPersonalizedContext());
  const [consent, setConsent] = useState(() => getAIContextConsent());

  useEffect(() => {
    setContextData(buildPersonalizedContext());
  }, [consent]);

  const handleToggleConsent = () => {
    const next = !consent;
    setConsent(next);
    setAIContextConsent(next);
    if (next) {
      toast?.success?.('Profile context enabled for personalized assistant answers.');
    } else {
      toast?.info?.('Personalized profile context disabled. Chat will be stateless.');
    }
  };

  if (!contextData.hasConsent && !consent) {
    return (
      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: '0.85rem 1.15rem',
          borderRadius: '0.75rem',
          marginBottom: '1rem',
          border: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
        }}
      >
        <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Lock size={15} color="var(--accent-main)" /> Personalized recommendations are currently disabled.
        </span>
        <button
          type="button"
          onClick={handleToggleConsent}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-main)',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.8rem',
            textDecoration: 'underline',
          }}
        >
          Enable
        </button>
      </div>
    );
  }

  if (contextData.proactiveRecommendations.length === 0) {
    return null;
  }

  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        padding: '1rem 1.25rem',
        borderRadius: '0.85rem',
        marginBottom: '1.25rem',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        background: 'rgba(56, 189, 248, 0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={16} color="var(--accent-main)" />
          <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            Personalized Civic Recommendations
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              padding: '0.1rem 0.5rem',
              borderRadius: '99px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: 'var(--accent-main)',
              fontWeight: '600',
            }}
          >
            Based on Saved Services
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleConsent}
          title="Toggle privacy profile context"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-tertiary)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <Lock size={12} /> Privacy Settings
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
        {contextData.proactiveRecommendations.map((rec) => (
          <div
            key={rec.id}
            onClick={() => onSelectPrompt(rec.actionPrompt)}
            style={{
              padding: '0.75rem 0.85rem',
              borderRadius: '0.6rem',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-light)',
              cursor: 'pointer',
              transition: 'border-color 0.2s, transform 0.15s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-main)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-light)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {rec.title}
              </span>
              <ChevronRight size={14} color="var(--accent-main)" />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem', lineHeight: '1.4' }}>
              {rec.advice}
            </p>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--accent-main)',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              Ask: "{rec.actionPrompt}"
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedRecommendationsPanel;

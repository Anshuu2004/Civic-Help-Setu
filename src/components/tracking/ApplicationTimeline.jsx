import { CheckCircle2, Clock, Circle, AlertTriangle } from 'lucide-react';

const ApplicationTimeline = ({ stages = [] }) => {
  return (
    <div style={{ position: 'relative', padding: '1rem 0 1rem 1.5rem' }}>
      {/* Connecting line */}
      <div
        style={{
          position: 'absolute',
          left: '2.1rem',
          top: '2rem',
          bottom: '2rem',
          width: '2px',
          background: 'var(--border-main)',
          zIndex: 0,
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem', position: 'relative', zIndex: 1 }}>
        {stages.map((stage, idx) => {
          const isDone = stage.completed;
          const isAction = !isDone && stage.actionRequired;
          const isInProgress = !isDone && !isAction && stage.inProgress;

          return (
            <div key={idx} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              {/* Stage Icon */}
              <div
                style={{
                  background: 'var(--bg-main)',
                  borderRadius: '50%',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={28} color="var(--success, #10b981)" fill="rgba(16, 185, 129, 0.2)" />
                ) : isAction ? (
                  <AlertTriangle size={28} color="#ef4444" />
                ) : isInProgress ? (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: '3px solid var(--accent-main)',
                      borderTopColor: 'transparent',
                      animation: 'spin 1.5s linear infinite',
                    }}
                  />
                ) : (
                  <Circle size={28} color="var(--text-tertiary)" />
                )}
              </div>

              {/* Stage Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h4
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: isDone
                        ? 'var(--text-primary)'
                        : isAction
                        ? '#ef4444'
                        : isInProgress
                        ? 'var(--accent-main)'
                        : 'var(--text-tertiary)',
                    }}
                  >
                    {stage.title}
                  </h4>
                  {isAction && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '99px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                      }}
                    >
                      <AlertTriangle size={12} /> Action needed
                    </span>
                  )}
                  {isInProgress && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '99px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: 'var(--accent-main)',
                      }}
                    >
                      <Clock size={12} /> Active Step
                    </span>
                  )}
                </div>

                <p
                  style={{
                    color: isDone ? 'var(--text-secondary)' : isInProgress || isAction ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    fontSize: '0.925rem',
                    marginTop: '0.25rem',
                    lineHeight: '1.5',
                  }}
                >
                  {stage.description}
                </p>

                {stage.timestamp && (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-tertiary)',
                      display: 'block',
                      marginTop: '0.35rem',
                    }}
                  >
                    {stage.timestamp}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ApplicationTimeline;

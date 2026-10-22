import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Square, FolderCheck, ArrowRight, ShieldCheck } from 'lucide-react';

const DocumentChecklistCard = ({
  serviceName,
  requiredDocuments = [],
}) => {
  const [checkedMap, setCheckedMap] = useState({});

  const toggleCheck = (doc) => {
    setCheckedMap((prev) => ({
      ...prev,
      [doc]: !prev[doc],
    }));
  };

  const completedCount = requiredDocuments.filter((d) => checkedMap[d]).length;
  const totalCount = requiredDocuments.length;

  return (
    <div
      style={{
        marginTop: '0.75rem',
        padding: '0.85rem 1rem',
        borderRadius: '0.75rem',
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid var(--border-light)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.6rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FolderCheck size={16} color="var(--accent-main)" />
          <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            Document Readiness Checklist
          </strong>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            padding: '0.1rem 0.5rem',
            borderRadius: '99px',
            background: completedCount === totalCount ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.15)',
            color: completedCount === totalCount ? '#10b981' : 'var(--accent-main)',
            fontWeight: '700',
          }}
        >
          {completedCount} / {totalCount} Ready
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {requiredDocuments.map((doc, idx) => {
          const isChecked = Boolean(checkedMap[doc]);
          return (
            <div
              key={idx}
              onClick={() => toggleCheck(doc)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
                color: isChecked ? 'var(--text-tertiary)' : 'var(--text-primary)',
                textDecoration: isChecked ? 'line-through' : 'none',
              }}
            >
              {isChecked ? (
                <CheckSquare size={15} color="#10b981" />
              ) : (
                <Square size={15} color="var(--text-tertiary)" />
              )}
              <span>{doc}</span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: '0.75rem',
          paddingTop: '0.5rem',
          borderTop: '1px dashed var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
        }}
      >
        <span style={{ color: 'var(--text-tertiary)' }}>
          Tip: Store scanned copies in your protected vault
        </span>
        <Link
          to="/vault"
          style={{
            color: 'var(--accent-main)',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.2rem',
            textDecoration: 'none',
          }}
        >
          <span>Open Vault</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};

export default DocumentChecklistCard;

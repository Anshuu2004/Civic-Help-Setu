import { useState } from 'react';
import { Paperclip, Plus, Trash2, FileCheck, ExternalLink, HardDrive } from 'lucide-react';
import { linkDocumentToApplication, unlinkDocumentFromApplication } from '../../services/trackingService';
import { useToast } from '../../context/ToastContext';

const LinkedDocumentsManager = ({
  appId,
  linkedDocs = [],
  onDocumentsUpdated = () => {},
}) => {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [docName, setDocName] = useState('');
  const [docSize, setDocSize] = useState('850 KB');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!docName.trim()) return;

    const updated = linkDocumentToApplication(appId, {
      name: docName.trim(),
      size: docSize,
    });

    if (updated) {
      toast.success(`Attached "${docName}" to application.`);
      onDocumentsUpdated(updated);
      setDocName('');
      setIsAdding(false);
    }
  };

  const handleRemove = (docId, docTitle) => {
    const updated = unlinkDocumentFromApplication(appId, docId);
    if (updated) {
      toast.info(`Unlinked "${docTitle}".`);
      onDocumentsUpdated(updated);
    }
  };

  return (
    <div
      style={{
        marginTop: '1.5rem',
        padding: '1.25rem',
        borderRadius: '0.85rem',
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-light)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Paperclip size={18} color="var(--accent-main)" />
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Linked Supporting Documents ({linkedDocs.length})
          </h4>
        </div>

        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Plus size={14} /> Attach File
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          style={{
            marginBottom: '1rem',
            padding: '0.85rem',
            borderRadius: '0.6rem',
            background: 'var(--bg-main)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Document file name (e.g. Electricity_Bill_Aug.pdf)"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              style={{ flex: 1, minWidth: '200px', fontSize: '0.85rem' }}
              required
            />
            <select
              className="input-field"
              value={docSize}
              onChange={(e) => setDocSize(e.target.value)}
              style={{ width: '110px', fontSize: '0.85rem' }}
            >
              <option value="420 KB">420 KB</option>
              <option value="850 KB">850 KB</option>
              <option value="1.4 MB">1.4 MB</option>
              <option value="2.8 MB">2.8 MB</option>
            </select>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
            >
              Attach
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAdding(false)}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {linkedDocs.length === 0 ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontStyle: 'italic', margin: 0 }}>
          No documents attached yet. Click "Attach File" to link receipts, identity proofs, or affidavits.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {linkedDocs.map((doc) => (
            <div
              key={doc.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.6rem 0.85rem',
                borderRadius: '0.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-light)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileCheck size={16} color="var(--accent-main)" />
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {doc.name}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {doc.size} • Linked on {doc.linkedAt}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => toast.info(`Viewing preview of ${doc.name}`)}
                  title="Preview document"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '0.2rem',
                  }}
                >
                  <ExternalLink size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(doc.id, doc.name)}
                  title="Remove attachment"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '0.2rem',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkedDocumentsManager;

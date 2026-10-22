import { useState } from 'react';
import { X, Upload, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

const CATEGORIES = ['Identity', 'Finance', 'Transport', 'Education', 'Welfare', 'Other'];

const DocumentModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({
    type: '',
    category: 'Identity',
    number: '',
    issuer: '',
    expiryDate: '',
    notes: '',
    fileName: '',
    fileSize: '',
    verified: false,
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFilePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const sizeInKB = Math.round(file.size / 1024);
    const sizeStr = sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;
    setForm((prev) => ({
      ...prev,
      fileName: file.name,
      fileSize: sizeStr,
      type: prev.type || file.name.split('.')[0].replace(/[-_]/g, ' '),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.type.trim()) {
      setError('Document type is required (e.g. Passport, Voter ID)');
      return;
    }
    if (!form.number.trim()) {
      setError('Document number or identifier is required');
      return;
    }

    onSave({
      ...form,
      type: form.type.trim(),
      number: form.number.trim(),
      issuer: form.issuer.trim() || 'Government of India',
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-doc-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--bg-main)',
          position: 'relative',
          padding: '2rem',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'var(--glass-bg)',
            border: 'none',
            color: 'var(--text-secondary)',
            padding: '0.5rem',
            borderRadius: '50%',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: 'var(--accent-main)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Digital Vault
          </span>
          <h2 id="add-doc-title" style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.25rem' }}>
            Add Civic Document
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Store metadata and files securely in your local citizen repository.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '0.5rem',
              color: 'var(--error, #ef4444)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Document Name / Type *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Passport, Voter ID, Ration Card"
              className="input-field"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Category
              </label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ fontSize: '0.95rem', padding: '0.75rem 1rem', background: 'var(--glass-bg)' }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Document Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Z1234567"
                className="input-field"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Issuing Authority
              </label>
              <input
                type="text"
                placeholder="e.g. UIDAI, Passport Seva"
                className="input-field"
                value={form.issuer}
                onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Expiry Date (if applicable)
              </label>
              <input
                type="date"
                className="input-field"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Notes or Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Renewed in Bangalore regional office"
              className="input-field"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
            />
          </div>

          <div
            style={{
              padding: '1.25rem',
              border: '1px dashed var(--border-main)',
              borderRadius: '0.75rem',
              textAlign: 'center',
              background: 'var(--glass-bg-subtle)',
            }}
          >
            <Upload size={24} color="var(--accent-main)" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>
              {form.fileName ? `Selected: ${form.fileName} (${form.fileSize})` : 'Attach Document Scan / PDF'}
            </p>
            <label
              style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                color: 'var(--accent-main)',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Choose File
              <input
                type="file"
                onChange={handleFilePick}
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={form.verified}
              onChange={(e) => setForm({ ...form, verified: e.target.checked })}
            />
            <span>Mark as Government Verified document</span>
          </label>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.75rem', fontSize: '0.95rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.75rem', fontSize: '0.95rem' }}
            >
              Save to Vault
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentModal;

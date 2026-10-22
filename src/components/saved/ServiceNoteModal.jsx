import { useState } from 'react';
import { X, Bookmark, Calendar, AlertCircle } from 'lucide-react';

const PRIORITIES = [
  { value: 'normal', label: 'Normal Priority', color: 'var(--text-secondary)' },
  { value: 'medium', label: 'Medium Priority', color: '#f59e0b' },
  { value: 'high', label: 'Urgent / High Priority', color: '#ef4444' },
];

const ServiceNoteModal = ({ item, service, isOpen, onClose, onSave }) => {
  const [folder, setFolder] = useState(item?.folder || 'General');
  const [notes, setNotes] = useState(item?.notes || '');
  const [priority, setPriority] = useState(item?.priority || 'normal');
  const [targetDate, setTargetDate] = useState(item?.targetDate || '');

  if (!isOpen || !service) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(service.id, {
      folder: folder.trim() || 'General',
      notes: notes.trim(),
      priority,
      targetDate: targetDate || null,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
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
          maxWidth: '520px',
          background: 'var(--bg-main)',
          position: 'relative',
          padding: '2rem',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
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
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-main)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Saved Guide Settings
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.2rem' }}>
            {service.name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Attach personal reminders, target dates, and assign to folders.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Assign Folder / Tag
            </label>
            <input
              type="text"
              placeholder="e.g. Family, Tax, Urgent, College"
              className="input-field"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              style={{ padding: '0.75rem 1rem', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Priority Level
              </label>
              <select
                className="input-field"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ padding: '0.75rem 1rem', fontSize: '0.95rem', background: 'var(--glass-bg)' }}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value} style={{ background: 'var(--bg-main)' }}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Target Deadline
              </label>
              <input
                type="date"
                className="input-field"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                style={{ padding: '0.75rem 1rem', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Personal Citizen Notes & Checklist Reminders
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Hospital discharge card collected. Need 2 passport photos for municipal officer."
              className="input-field"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.95rem',
                borderRadius: '0.75rem',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem' }}
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceNoteModal;

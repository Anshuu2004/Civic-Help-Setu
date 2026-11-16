/**
 * src/components/waterQuality/SampleIntakeModal.jsx
 * Modal dialog for field samplers or officials to register a physical sampling event.
 */

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { SAMPLE_TYPES } from '../../data/waterQualityContract.js';
import { detectProhibitedPII } from '../../services/waterQualityValidation.js';

export default function SampleIntakeModal({
  waterPoint,
  onClose,
  onSubmit,
}) {
  const [sampleType, setSampleType] = useState('routine_surveillance');
  const [collectionDate, setCollectionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sealedContainerCode, setSealedContainerCode] = useState('');
  const [preservationMethod, setPreservationMethod] = useState('Sterile borosilicate bottle on ice pack at 4°C');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!sealedContainerCode.trim()) {
      setError('Sealed container bar code / container identifier is required.');
      return;
    }

    const piiCheck = detectProhibitedPII(`${notes} ${sealedContainerCode}`);
    if (piiCheck) {
      setError(piiCheck);
      return;
    }

    try {
      onSubmit({
        waterPointId: waterPoint.id,
        sampleType,
        collectionDate: new Date(collectionDate).toISOString(),
        sealedContainerCode: sealedContainerCode.trim(),
        preservationMethod,
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record sampling event.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intake-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)] mb-4">
          <div>
            <h3 id="intake-modal-title" className="text-lg font-bold text-[var(--text-primary)]">
              Register Physical Water Sample
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Water Point: <span className="font-semibold text-[var(--text-primary)]">{waterPoint.name}</span> ({waterPoint.id})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--glass-bg)] text-[var(--text-secondary)]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Sample Surveillance Type *
            </label>
            <select
              value={sampleType}
              onChange={(e) => setSampleType(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)]"
            >
              {Object.entries(SAMPLE_TYPES).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Collection Date *
            </label>
            <input
              type="date"
              value={collectionDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setCollectionDate(e.target.value)}
              required
              className="w-full text-xs p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Sealed Container Barcode / Identification Number *
            </label>
            <input
              type="text"
              placeholder="e.g. SEAL-KA-10928"
              value={sealedContainerCode}
              onChange={(e) => setSealedContainerCode(e.target.value)}
              required
              className="w-full text-xs p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)] font-mono"
            />
            <span className="text-[11px] text-[var(--text-tertiary)] block mt-0.5">
              Must be unique for chain of custody verification.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Preservation & Chain of Custody Method
            </label>
            <input
              type="text"
              value={preservationMethod}
              onChange={(e) => setPreservationMethod(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Field Observations & Notes (Zero PII)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Odorless, tap flushed for 3 minutes before taking sample."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)]"
            />
          </div>

          <div className="pt-3 border-t border-[var(--border-light)] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary text-xs px-4 py-2"
            >
              Record Sample Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

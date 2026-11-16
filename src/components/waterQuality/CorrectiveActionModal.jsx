/**
 * src/components/waterQuality/CorrectiveActionModal.jsx
 * Modal dialog for officials to log and sanction remedial corrective actions.
 */

import { useState } from 'react';
import { X, AlertCircle, Wrench } from 'lucide-react';
import { CORRECTIVE_ACTION_TYPES } from '../../data/waterQualityContract.js';
import { detectProhibitedPII } from '../../services/waterQualityValidation.js';

export default function CorrectiveActionModal({
  waterPoint,
  onClose,
  onSubmit,
}) {
  const [actionType, setActionType] = useState('chlorination_shock');
  const [targetCompletionDate, setTargetCompletionDate] = useState(() =>
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [assignedDepartment, setAssignedDepartment] = useState('Municipal Water Supply & Public Health Division');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim() || description.trim().length < 15) {
      setError('A substantive description of the corrective action (at least 15 characters) is required.');
      return;
    }

    const piiCheck = detectProhibitedPII(description);
    if (piiCheck) {
      setError(piiCheck);
      return;
    }

    try {
      onSubmit({
        waterPointId: waterPoint.id,
        actionType,
        targetCompletionDate,
        assignedDepartment: assignedDepartment.trim(),
        description: description.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to sanction corrective action.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="corrective-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)] mb-4">
          <div>
            <h3 id="corrective-modal-title" className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-600" />
              <span>Sanction Remedial Corrective Action</span>
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
              Remediation Action Type *
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)]"
            >
              {Object.entries(CORRECTIVE_ACTION_TYPES).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Target Completion Date *
            </label>
            <input
              type="date"
              value={targetCompletionDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setTargetCompletionDate(e.target.value)}
              required
              className="w-full text-xs p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Assigned Municipal Department *
            </label>
            <input
              type="text"
              value={assignedDepartment}
              onChange={(e) => setAssignedDepartment(e.target.value)}
              required
              className="w-full text-xs p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Action Description & Scope of Work *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Flush distribution line with 50 mg/L chlorine solution. Verify zero coliform count before reopening."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
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
              className="btn btn-primary text-xs px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              Sanction Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

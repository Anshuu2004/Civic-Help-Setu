/**
 * src/components/waterQuality/OfficialCorrectionModal.jsx
 * Modal dialog for municipal officials to publish a formal correction,
 * superseding previous lab findings with immutable audit trail.
 */

import { useState } from 'react';
import { X, AlertCircle, RefreshCw } from 'lucide-react';
import { IS_10500_STANDARDS } from '../../data/waterQualityContract.js';
import { detectProhibitedPII } from '../../services/waterQualityValidation.js';

export default function OfficialCorrectionModal({
  sampleEventId,
  onClose,
  onSubmit,
}) {
  const [correctionReason, setCorrectionReason] = useState('');
  const [error, setError] = useState('');

  // Corrected parameter values
  const [correctedValues, setCorrectedValues] = useState({
    ph: '7.3',
    tds: '260',
    turbidity: '0.7',
    total_hardness: '160',
    e_coli: '0',
  });

  const handleValueChange = (code, val) => {
    setCorrectedValues((prev) => ({ ...prev, [code]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!correctionReason.trim() || correctionReason.trim().length < 15) {
      setError('A substantive statutory reason for correction (at least 15 characters) is required.');
      return;
    }

    const piiCheck = detectProhibitedPII(correctionReason);
    if (piiCheck) {
      setError(`Correction reason: ${piiCheck}`);
      return;
    }

    const correctedResults = [];
    for (const [code, val] of Object.entries(correctedValues)) {
      if (val !== '' && !isNaN(Number(val))) {
        correctedResults.push({
          parameterCode: code,
          testedValue: Number(val),
        });
      }
    }

    if (correctedResults.length === 0) {
      setError('Please provide at least one corrected parameter measurement.');
      return;
    }

    try {
      onSubmit(sampleEventId, {
        correctionReason: correctionReason.trim(),
        correctedResults,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to publish correction.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="correction-modal-title"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-2xl shadow-2xl p-6 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)] mb-4">
          <div>
            <h3 id="correction-modal-title" className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-600" />
              <span>Publish Official Result Correction</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Target Event: <span className="font-mono font-semibold text-[var(--text-primary)]">{sampleEventId}</span>
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

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
            <strong>Statutory Audit Requirement:</strong> Publishing a correction supersedes previously published lab readings, marks them as superseded in public records, and stamps an immutable audit entry with your rationale.
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Official Reason for Correction & Audit Rationale *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Recalibration of laboratory nephelometer conducted. Confirmatory re-test performed by Chief Analyst."
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              required
              className="w-full text-xs p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)]"
            />
          </div>

          <div className="border border-[var(--border-light)] rounded-xl p-3 bg-[var(--bg-card)]">
            <h4 className="text-xs font-bold text-[var(--text-primary)] mb-2">
              Corrected Parameter Values (IS 10500:2012)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.keys(correctedValues).map((code) => {
                const param = IS_10500_STANDARDS.parameters[code];
                return (
                  <div key={code} className="space-y-1">
                    <label className="block font-medium text-[var(--text-primary)]">
                      {param.name} ({param.unit})
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={correctedValues[code]}
                      onChange={(e) => handleValueChange(code, e.target.value)}
                      className="w-full p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)]"
                    />
                  </div>
                );
              })}
            </div>
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
              Supersede & Publish Correction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

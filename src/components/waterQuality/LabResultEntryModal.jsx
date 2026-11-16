/**
 * src/components/waterQuality/LabResultEntryModal.jsx
 * Modal dialog for lab analysts to enter parameter test results against IS 10500:2012.
 */

import { useState } from 'react';
import { X, AlertCircle, Shield } from 'lucide-react';
import { IS_10500_STANDARDS } from '../../data/waterQualityContract.js';
import { SEED_LAB_CERTIFICATIONS } from '../../data/waterQualitySeed.js';

export default function LabResultEntryModal({
  sampleEventId,
  onClose,
  onSubmit,
}) {
  const [labId, setLabId] = useState(SEED_LAB_CERTIFICATIONS[0].labId);
  const [analystNotes, setAnalystNotes] = useState('');
  const [error, setError] = useState('');

  // Initial state with common parameters
  const defaultParams = ['ph', 'tds', 'turbidity', 'total_hardness', 'chloride', 'fluoride', 'e_coli'];
  const [values, setValues] = useState({
    ph: '7.2',
    tds: '320',
    turbidity: '0.8',
    total_hardness: '180',
    chloride: '120',
    fluoride: '0.7',
    e_coli: '0',
  });

  const handleValueChange = (code, val) => {
    setValues((prev) => ({ ...prev, [code]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const results = [];
    for (const [code, val] of Object.entries(values)) {
      if (val !== '' && !isNaN(Number(val))) {
        results.push({
          parameterCode: code,
          testedValue: Number(val),
        });
      }
    }

    if (results.length === 0) {
      setError('Please provide at least one valid parameter measurement.');
      return;
    }

    try {
      onSubmit(sampleEventId, {
        labId,
        analystNotes: analystNotes.trim(),
        results,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit lab results.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lab-entry-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-2xl shadow-2xl p-6 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)] mb-4">
          <div>
            <h3 id="lab-entry-modal-title" className="text-lg font-bold text-[var(--text-primary)]">
              Record Laboratory Test Results
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Sampling Event ID: <span className="font-mono font-semibold text-[var(--text-primary)]">{sampleEventId}</span>
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
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Accredited Laboratory *
            </label>
            <select
              value={labId}
              onChange={(e) => setLabId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)]"
            >
              {SEED_LAB_CERTIFICATIONS.map((lab) => (
                <option key={lab.labId} value={lab.labId}>
                  {lab.name} ({lab.nablAccreditationNo})
                </option>
              ))}
            </select>
          </div>

          <div className="border border-[var(--border-light)] rounded-xl p-3 bg-[var(--bg-card)]">
            <h4 className="text-xs font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>IS 10500:2012 Standard Parameter Measurements</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {defaultParams.map((paramCode) => {
                const param = IS_10500_STANDARDS.parameters[paramCode];
                return (
                  <div key={paramCode} className="space-y-1">
                    <label className="block font-medium text-[var(--text-primary)]">
                      {param.name} ({param.unit})
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={values[paramCode] ?? ''}
                      onChange={(e) => handleValueChange(paramCode, e.target.value)}
                      placeholder={`Acceptable: ${param.acceptableMin}-${param.acceptableMax}`}
                      className="w-full p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-light)] text-[var(--text-primary)]"
                    />
                    <span className="text-[10px] text-[var(--text-secondary)] block">
                      Limit: {param.acceptableMin}-{param.acceptableMax} {param.unit}
                      {param.relaxationAllowed ? ` (Permissible: ${param.permissibleMax})` : ' (No relaxation)'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Analyst Notes & Certification Rationale
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Test carried out under calibrated spectrophotometer and incubators."
              value={analystNotes}
              onChange={(e) => setAnalystNotes(e.target.value)}
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
              Verify & Sign Results
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

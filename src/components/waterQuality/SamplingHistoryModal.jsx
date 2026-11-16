/**
 * src/components/waterQuality/SamplingHistoryModal.jsx
 * Modal detailing complete water-point historical sampling chronology,
 * lab certifications, parameter results, and corrective actions.
 */

import { useState } from 'react';
import { X, Shield, Calendar, RefreshCw, PlusCircle, Wrench } from 'lucide-react';
import ParameterResultsTable from './ParameterResultsTable.jsx';
import { RESULT_STATUSES, CORRECTIVE_ACTION_TYPES } from '../../data/waterQualityContract.js';

export default function SamplingHistoryModal({
  waterPoint,
  onClose,
  onAddResults,
  onPublishCorrection,
  onAddCorrectiveAction,
  userRole = 'public',
}) {
  const [activeTab, setActiveTab] = useState('samples'); // 'samples' | 'corrective'

  if (!waterPoint) return null;

  const samplingHistory = waterPoint.samplingHistory || [];
  const correctiveActions = waterPoint.correctiveActions || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-wp-title"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[var(--border-light)] bg-[var(--bg-card)] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-light)]">
                {waterPoint.id}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {waterPoint.ward}
              </span>
            </div>
            <h2 id="modal-wp-title" className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              {waterPoint.name}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              {waterPoint.city} • Source: <span className="font-medium text-[var(--text-primary)]">{waterPoint.sourceType}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--border-light)] px-6 bg-[var(--bg-secondary)] text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('samples')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'samples'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Sampling Events & Results ({samplingHistory.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('corrective')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'corrective'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Remedial Interventions ({correctiveActions.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'samples' && (
            <>
              {samplingHistory.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--text-secondary)] bg-[var(--bg-card)] rounded-xl border border-[var(--border-light)]">
                  No sampling history recorded for this water point yet.
                </div>
              ) : (
                samplingHistory.map((event) => {
                  const statusDef = RESULT_STATUSES[event.status] || { label: event.status, badgeClass: 'badge-neutral' };
                  const activeResults = (event.results || []).filter((r) => r.status !== 'superseded');
                  const supersededResults = (event.results || []).filter((r) => r.status === 'superseded');

                  return (
                    <div
                      key={event.id}
                      className="p-4 sm:p-5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] shadow-sm space-y-3"
                    >
                      {/* Event Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-light)] pb-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                              {event.id}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                              {event.sampleType.replace(/_/g, ' ')}
                            </span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${statusDef.badgeClass}`}>
                              {statusDef.label}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)]">
                            Collected on <span className="font-semibold text-[var(--text-primary)]">{new Date(event.collectionDate).toLocaleDateString()}</span> • Container ID: <span className="font-mono">{event.sealedContainerCode}</span>
                          </p>
                        </div>

                        {/* Cryptographic Seal */}
                        {event.cryptographicSeal && (
                          <div className="text-right">
                            <span className="text-[11px] font-mono px-2 py-1 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1">
                              <Shield className="w-3.5 h-3.5 text-emerald-600" />
                              {event.cryptographicSeal}
                            </span>
                            <span className="block text-[10px] text-[var(--text-tertiary)] mt-0.5">
                              Cryptographic Lab Seal
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Lab Info */}
                      {event.lab && (
                        <div className="text-xs bg-[var(--bg-secondary)] p-2.5 rounded-lg border border-[var(--border-light)] flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="font-semibold text-[var(--text-primary)]">Testing Lab: </span>
                            <span>{event.lab.name}</span>
                          </div>
                          <div className="font-mono text-emerald-700 dark:text-emerald-400">
                            NABL Accr: {event.lab.nablAccreditationNo}
                          </div>
                        </div>
                      )}

                      {/* Active Results Table */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                          Verified Parameters (IS 10500:2012)
                        </h4>
                        <ParameterResultsTable results={activeResults} />
                      </div>

                      {/* Superseded Results Accordion/Section if exists */}
                      {supersededResults.length > 0 && (
                        <div className="mt-3 p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                          <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Superseded Prior Readings (Audit History)</span>
                          </h5>
                          <ParameterResultsTable results={supersededResults} isSuperseded={true} />
                        </div>
                      )}

                      {/* Notes / Reason */}
                      {event.notes && (
                        <p className="text-xs text-[var(--text-secondary)] italic pt-1">
                          Notes: {event.notes}
                        </p>
                      )}

                      {/* Reviewer / Operator Action Buttons */}
                      {['lab_analyst', 'official_reviewer', 'admin'].includes(userRole) && (
                        <div className="pt-2 border-t border-[var(--border-light)] flex flex-wrap items-center justify-end gap-2">
                          {event.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => onAddResults(event.id)}
                              className="btn btn-primary text-xs px-3 py-1 flex items-center gap-1"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Record Lab Measurements</span>
                            </button>
                          )}
                          {['official_reviewer', 'admin'].includes(userRole) && event.status !== 'pending' && (
                            <button
                              type="button"
                              onClick={() => onPublishCorrection(event.id)}
                              className="btn btn-secondary text-xs px-3 py-1 text-amber-700 dark:text-amber-400 flex items-center gap-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Publish Official Correction</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === 'corrective' && (
            <div className="space-y-4">
              {correctiveActions.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--text-secondary)] bg-[var(--bg-card)] rounded-xl border border-[var(--border-light)]">
                  No remedial interventions logged for this water point.
                </div>
              ) : (
                correctiveActions.map((action) => {
                  const typeDef = CORRECTIVE_ACTION_TYPES[action.actionType] || { label: action.actionType };
                  return (
                    <div
                      key={action.id}
                      className="p-4 sm:p-5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-light)]">
                          {action.id}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Status: {action.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">
                        {typeDef.label}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {action.description}
                      </p>
                      <div className="text-xs text-[var(--text-tertiary)] flex items-center justify-between flex-wrap pt-2 border-t border-[var(--border-light)]">
                        <span>Assigned: {action.assignedDepartment}</span>
                        <span>Target: {action.targetCompletionDate}</span>
                      </div>
                    </div>
                  );
                })
              )}

              {['official_reviewer', 'admin'].includes(userRole) && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onAddCorrectiveAction(waterPoint.id)}
                    className="btn btn-secondary text-xs px-4 py-2 flex items-center gap-1.5"
                  >
                    <Wrench className="w-4 h-4 text-amber-600" />
                    <span>Sanction New Remedial Intervention</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-light)] bg-[var(--bg-card)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>Standard: Bureau of Indian Standards IS 10500:2012</span>
          <button type="button" onClick={onClose} className="btn btn-secondary text-xs px-4 py-1.5">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

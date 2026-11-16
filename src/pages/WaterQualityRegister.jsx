/**
 * src/pages/WaterQualityRegister.jsx
 * Community Water-Quality Sampling and Laboratory Result Register (#754).
 *
 * Provides a public-facing record of water-quality sampling events and verified
 * laboratory results for public water points under IS 10500:2012 specifications.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Droplet,
  ShieldCheck,
  AlertOctagon,
  PlusCircle,
  Info,
} from 'lucide-react';
import {
  listWaterPoints,
  getWaterPointDetails,
  createWaterPoint,
  recordSamplingEvent,
  recordLabResults,
  publishOfficialCorrection,
  recordCorrectiveAction,
  getAvailableCities,
  getAvailableWards,
} from '../services/waterQualityService.js';
import { IS_10500_STANDARDS, WATER_POINT_TYPES } from '../data/waterQualityContract.js';
import WaterPointCard from '../components/waterQuality/WaterPointCard.jsx';
import WaterQualityFilters from '../components/waterQuality/WaterQualityFilters.jsx';
import SamplingHistoryModal from '../components/waterQuality/SamplingHistoryModal.jsx';
import SampleIntakeModal from '../components/waterQuality/SampleIntakeModal.jsx';
import LabResultEntryModal from '../components/waterQuality/LabResultEntryModal.jsx';
import OfficialCorrectionModal from '../components/waterQuality/OfficialCorrectionModal.jsx';
import CorrectiveActionModal from '../components/waterQuality/CorrectiveActionModal.jsx';

export default function WaterQualityRegister() {
  const [filters, setFilters] = useState({
    city: 'All',
    ward: 'All',
    pointType: 'all',
    status: 'all',
    compliance: 'all',
    search: '',
  });

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [userRole, setUserRole] = useState('public');
  const [dataVersion, setDataVersion] = useState(0);
  const [activeWaterPointId, setActiveWaterPointId] = useState(null);

  // Modals state
  const [selectedPointForSample, setSelectedPointForSample] = useState(null);
  const [selectedEventForResults, setSelectedEventForResults] = useState(null);
  const [selectedEventForCorrection, setSelectedEventForCorrection] = useState(null);
  const [selectedPointForAction, setSelectedPointForAction] = useState(null);
  const [showAddPointModal, setShowAddPointModal] = useState(false);

  // New Water Point form state
  const [newPointForm, setNewPointForm] = useState({
    name: '',
    pointType: 'public_standpost',
    ward: '',
    city: 'Bengaluru',
    landmark: '',
    sourceType: 'Municipal Piped Distribution',
  });
  const [formError, setFormError] = useState('');

  // Reload data from service
  const refreshData = useCallback(() => {
    setDataVersion((v) => v + 1);
  }, []);

  const waterPoints = useMemo(() => {
    return listWaterPoints(filters, { role: userRole });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, userRole, dataVersion]);

  const availableCities = useMemo(() => getAvailableCities(), []);
  const availableWards = useMemo(() => getAvailableWards(filters.city), [filters.city]);

  const activeWaterPoint = useMemo(() => {
    return activeWaterPointId ? getWaterPointDetails(activeWaterPointId) : null;
  }, [activeWaterPointId]);

  // Statistics overview
  const stats = useMemo(() => {
    const total = waterPoints.length;
    const compliant = waterPoints.filter((w) => w.overallComplianceStatus === 'compliant').length;
    const exceeded = waterPoints.filter((w) => w.overallComplianceStatus === 'exceeded' || w.overallComplianceStatus === 'critical_hazard').length;
    const pending = waterPoints.filter((w) => w.overallComplianceStatus === 'pending').length;
    return { total, compliant, exceeded, pending };
  }, [waterPoints]);

  // Handlers for modal actions
  const handleRecordSampleSubmit = (payload) => {
    recordSamplingEvent(payload, { role: userRole, id: 'OPERATOR-USER' });
    refreshData();
  };

  const handleLabResultSubmit = (sampleEventId, payload) => {
    recordLabResults(sampleEventId, payload, { role: userRole, id: 'ANALYST-USER' });
    refreshData();
  };

  const handleCorrectionSubmit = (sampleEventId, payload) => {
    publishOfficialCorrection(sampleEventId, payload, { role: userRole, id: 'REVIEWER-USER' });
    refreshData();
  };

  const handleCorrectiveActionSubmit = (payload) => {
    recordCorrectiveAction(payload, { role: userRole, id: 'OFFICIAL-USER' });
    refreshData();
  };

  const handleCreatePointSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    try {
      createWaterPoint(newPointForm, { role: userRole, id: 'ADMIN-USER' });
      setShowAddPointModal(false);
      setNewPointForm({
        name: '',
        pointType: 'public_standpost',
        ward: '',
        city: 'Bengaluru',
        landmark: '',
        sourceType: 'Municipal Piped Distribution',
      });
      refreshData();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <Droplet className="w-3.5 h-3.5 text-emerald-600" />
            Official Municipal Water Surveillance
          </span>
          <span className="text-xs text-[var(--text-secondary)] font-mono">
            Standard: {IS_10500_STANDARDS.specification}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Community Water-Quality Sampling & Laboratory Result Register
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-3xl leading-relaxed">
              Public verification record of water-quality surveillance events, certified laboratory findings, and corrective interventions across community water standposts, RO plants, and municipal sources.
            </p>
          </div>

          {['sampler', 'official_reviewer', 'admin'].includes(userRole) && (
            <button
              type="button"
              onClick={() => setShowAddPointModal(true)}
              className="btn btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 shrink-0 self-start md:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Water Point</span>
            </button>
          )}
        </div>
      </div>

      {/* Statutory Standard Notice */}
      <div className="mb-6 p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">
            Statutory Reference: {IS_10500_STANDARDS.title}
          </p>
          <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
            All parameter measurements are compared deterministically against Bureau of Indian Standards (BIS) acceptable and permissible limits. Any corrective intervention is sanctioned under Urban Local Body Public Health Bye-laws.
          </p>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Total Monitored Points
          </span>
          <div className="text-2xl font-black text-[var(--text-primary)] mt-1">
            {stats.total}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            IS 10500 Compliant
          </span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {stats.compliant}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5" />
            Exceeded / Alert
          </span>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
            {stats.exceeded}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Pending Lab Analysis
          </span>
          <div className="text-2xl font-black text-[var(--text-primary)] mt-1">
            {stats.pending}
          </div>
        </div>
      </div>

      {/* Filters and View Controls */}
      <WaterQualityFilters
        filters={filters}
        onFilterChange={setFilters}
        availableCities={availableCities}
        availableWards={availableWards}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        userRole={userRole}
        onRoleChange={setUserRole}
      />

      {/* Main Content: Cards or Accessible Table */}
      {waterPoints.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl shadow-sm space-y-3">
          <Droplet className="w-10 h-10 text-[var(--text-tertiary)] mx-auto" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            No water points match the selected criteria
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
            Try adjusting your search terms, changing the city/ward selection, or clearing the compliance filter.
          </p>
          <button
            type="button"
            onClick={() => setFilters({ city: 'All', ward: 'All', pointType: 'all', status: 'all', compliance: 'all', search: '' })}
            className="btn btn-secondary text-xs px-4 py-2 mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {waterPoints.map((wp) => (
            <WaterPointCard
              key={wp.id}
              waterPoint={wp}
              onViewDetails={(id) => setActiveWaterPointId(id)}
              onRecordSample={() => setSelectedPointForSample(wp)}
              onAddCorrectiveAction={() => setSelectedPointForAction(wp)}
              userRole={userRole}
            />
          ))}
        </div>
      ) : (
        /* Accessible Table Alternative */
        <div className="overflow-x-auto rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] shadow-sm">
          <table className="w-full text-left text-xs md:text-sm border-collapse" aria-label="Water Points Directory Table">
            <caption className="sr-only">Directory of community water points and surveillance test history</caption>
            <thead>
              <tr className="border-b border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-semibold">
                <th scope="col" className="p-3">ID & Name</th>
                <th scope="col" className="p-3">Type</th>
                <th scope="col" className="p-3">Ward & City</th>
                <th scope="col" className="p-3">Source</th>
                <th scope="col" className="p-3">Compliance</th>
                <th scope="col" className="p-3">Last Tested</th>
                <th scope="col" className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {waterPoints.map((wp) => (
                <tr key={wp.id} className="border-b border-[var(--border-light)] hover:bg-[var(--glass-bg)] transition-colors">
                  <td className="p-3 font-medium text-[var(--text-primary)]">
                    <span className="font-mono text-xs text-[var(--text-secondary)] block">{wp.id}</span>
                    <span className="font-bold">{wp.name}</span>
                  </td>
                  <td className="p-3 text-[var(--text-secondary)]">
                    {WATER_POINT_TYPES[wp.pointType]?.label || wp.pointType}
                  </td>
                  <td className="p-3 text-[var(--text-secondary)]">
                    <div>{wp.ward}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">{wp.city}</div>
                  </td>
                  <td className="p-3 text-[var(--text-secondary)]">{wp.sourceType}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      wp.overallComplianceStatus === 'compliant'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : wp.overallComplianceStatus === 'exceeded'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : wp.overallComplianceStatus === 'critical_hazard'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {wp.overallComplianceStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--text-secondary)]">
                    {wp.sampleAge?.text || 'Not tested'}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => setActiveWaterPointId(wp.id)}
                      className="btn btn-secondary text-xs px-2.5 py-1"
                    >
                      History & Results
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Sampling History & Results */}
      {activeWaterPoint && (
        <SamplingHistoryModal
          waterPoint={activeWaterPoint}
          onClose={() => setActiveWaterPointId(null)}
          onAddResults={(eventId) => setSelectedEventForResults(eventId)}
          onPublishCorrection={(eventId) => setSelectedEventForCorrection(eventId)}
          onAddCorrectiveAction={() => setSelectedPointForAction(activeWaterPoint)}
          userRole={userRole}
        />
      )}

      {/* Modal: Physical Sample Intake */}
      {selectedPointForSample && (
        <SampleIntakeModal
          waterPoint={selectedPointForSample}
          onClose={() => setSelectedPointForSample(null)}
          onSubmit={handleRecordSampleSubmit}
        />
      )}

      {/* Modal: Record Lab Results */}
      {selectedEventForResults && (
        <LabResultEntryModal
          sampleEventId={selectedEventForResults}
          onClose={() => setSelectedEventForResults(null)}
          onSubmit={handleLabResultSubmit}
        />
      )}

      {/* Modal: Publish Official Correction */}
      {selectedEventForCorrection && (
        <OfficialCorrectionModal
          sampleEventId={selectedEventForCorrection}
          onClose={() => setSelectedEventForCorrection(null)}
          onSubmit={handleCorrectionSubmit}
        />
      )}

      {/* Modal: Sanction Corrective Action */}
      {selectedPointForAction && (
        <CorrectiveActionModal
          waterPoint={selectedPointForAction}
          onClose={() => setSelectedPointForAction(null)}
          onSubmit={handleCorrectiveActionSubmit}
        />
      )}

      {/* Modal: Create Water Point (Admin/Sampler) */}
      {showAddPointModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-wp-title"
        >
          <div className="relative w-full max-w-lg bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-2xl shadow-2xl p-6">
            <h3 id="add-wp-title" className="text-lg font-bold text-[var(--text-primary)] mb-3">
              Register Public Water Point
            </h3>

            {formError && (
              <div className="p-3 mb-4 rounded-lg bg-rose-50 text-rose-800 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreatePointSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Water Point Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Victoria Hospital Public Standpost Tap"
                  value={newPointForm.name}
                  onChange={(e) => setNewPointForm({ ...newPointForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Type *</label>
                  <select
                    value={newPointForm.pointType}
                    onChange={(e) => setNewPointForm({ ...newPointForm, pointType: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)]"
                  >
                    {Object.entries(WATER_POINT_TYPES).map(([k, d]) => (
                      <option key={k} value={k}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newPointForm.city}
                    onChange={(e) => setNewPointForm({ ...newPointForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Ward / Locality *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ward 120 - Cottonpet"
                  value={newPointForm.ward}
                  onChange={(e) => setNewPointForm({ ...newPointForm, ward: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Landmark (Zero Residential PII)</label>
                <input
                  type="text"
                  placeholder="e.g. Near Main Gate, Opp Pharmacy"
                  value={newPointForm.landmark}
                  onChange={(e) => setNewPointForm({ ...newPointForm, landmark: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Water Source Supply Type</label>
                <input
                  type="text"
                  value={newPointForm.sourceType}
                  onChange={(e) => setNewPointForm({ ...newPointForm, sourceType: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-primary)]"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border-light)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPointModal(false)}
                  className="btn btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4 py-2">
                  Create Water Point
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

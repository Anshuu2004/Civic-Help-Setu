import { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  Activity,
  Layers,
  Wrench,
  CheckCircle2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import RoadSafetyHeader from '../components/roadSafety/RoadSafetyHeader';
import RoadSafetyFilters from '../components/roadSafety/RoadSafetyFilters';
import RoadSafetyCaseList from '../components/roadSafety/RoadSafetyCaseList';
import RoadSafetyCaseDetailModal from '../components/roadSafety/RoadSafetyCaseDetailModal';
import RoadSafetySiteInspectionModal from '../components/roadSafety/RoadSafetySiteInspectionModal';
import RoadSafetyInterventionModal from '../components/roadSafety/RoadSafetyInterventionModal';
import RoadSafetyTimelineComparatorModal from '../components/roadSafety/RoadSafetyTimelineComparatorModal';
import RoadSafetyHazardReportModal from '../components/roadSafety/RoadSafetyHazardReportModal';
import RoadSafetyRiskRunModal from '../components/roadSafety/RoadSafetyRiskRunModal';
import {
  ensureRoadSafetySeedData,
  listReviewCases,
  getReviewCaseDetail,
  transitionReviewCaseState,
  recordSiteInspection,
  recordIntervention,
  submitCitizenHazardReport,
  executeRiskRun,
} from '../services/roadSafetyBlackspotService';
import { SEED_ROAD_SEGMENTS } from '../data/roadSafetyContract';
import { useToast } from '../context/ToastContext';

const INITIAL_FILTERS = {
  state: 'all',
  status: 'all',
  minScore: 0,
  searchQuery: '',
};

export default function RoadSafetyDashboard() {
  const { toast } = useToast();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [refreshTick, setRefreshTick] = useState(0);

  // Modals state
  const [detailCaseId, setDetailCaseId] = useState(null);
  const [inspectionTargetCase, setInspectionTargetCase] = useState(null);
  const [interventionTargetCase, setInterventionTargetCase] = useState(null);
  const [showHazardModal, setShowHazardModal] = useState(false);
  const [showComparatorModal, setShowComparatorModal] = useState(false);
  const [showRiskRunModal, setShowRiskRunModal] = useState(false);

  // Initialize seed data once on mount
  useEffect(() => {
    ensureRoadSafetySeedData();
    setRefreshTick((t) => t + 1);
  }, []);

  // Fetch filtered cases
  const { filteredCases, totalItems } = useMemo(() => {
    try {
      const res = listReviewCases(filters);
      return {
        filteredCases: res.cases,
        totalItems: res.totalItems,
      };
    } catch {
      return {
        filteredCases: [],
        totalItems: 0,
      };
    }
  }, [filters, refreshTick]);

  // Full detail for modal
  const caseDetail = useMemo(() => {
    if (!detailCaseId) return null;
    return getReviewCaseDetail(detailCaseId);
  }, [detailCaseId, refreshTick]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCorridors = SEED_ROAD_SEGMENTS.length;
    const criticalCount = filteredCases.filter((c) => c.compositeRiskScore >= 75).length;
    const inProgressCount = filteredCases.filter(
      (c) => c.status === 'intervention_planned' || c.status === 'in_progress'
    ).length;
    const resolvedCount = filteredCases.filter((c) => c.status === 'resolved').length;

    return {
      totalCorridors,
      criticalCount,
      inProgressCount,
      resolvedCount,
    };
  }, [filteredCases]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleTransitionState = async (caseId, targetState, transitionData) => {
    const updated = transitionReviewCaseState(caseId, targetState, transitionData);
    toast?.success?.(`Review case transitioned to ${targetState.replace('_', ' ')}.`);
    setRefreshTick((t) => t + 1);
    return updated;
  };

  const handleSubmitInspection = async (caseId, inspectionData) => {
    const result = recordSiteInspection(caseId, inspectionData);
    toast?.success?.('Physical site inspection recorded successfully.');
    setRefreshTick((t) => t + 1);
    return result;
  };

  const handleSubmitIntervention = async (caseId, interventionData) => {
    const result = recordIntervention(caseId, interventionData);
    toast?.success?.('Engineering countermeasure recorded successfully.');
    setRefreshTick((t) => t + 1);
    return result;
  };

  const handleSubmitHazard = async (reportData) => {
    const result = submitCitizenHazardReport(reportData);
    toast?.success?.('Road hazard reported. Thank you for strengthening road safety!');
    setRefreshTick((t) => t + 1);
    return result;
  };

  const handleExecuteRiskRun = async (parameters) => {
    const result = executeRiskRun(parameters);
    toast?.success?.(`Risk run completed. Evaluated ${result.runRecord.totalSegmentsEvaluated} corridors.`);
    setRefreshTick((t) => t + 1);
    return result;
  };

  return (
    <div className="section" style={{ padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1150px', margin: '0 auto' }}>
        {/* Header */}
        <RoadSafetyHeader
          onOpenHazardModal={() => setShowHazardModal(true)}
          onOpenComparatorModal={() => setShowComparatorModal(true)}
          onOpenRiskRunModal={() => setShowRiskRunModal(true)}
        />

        {/* Quick KPI Stat Cards */}
        <div
          role="region"
          aria-label="Road safety dashboard summary statistics"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-main)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '2.4rem',
                height: '2.4rem',
                borderRadius: '0.5rem',
                background: 'rgba(56, 189, 248, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={18} color="var(--accent-main)" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>
                Monitored Corridors
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                {metrics.totalCorridors}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-main)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '2.4rem',
                height: '2.4rem',
                borderRadius: '0.5rem',
                background: 'rgba(239, 68, 68, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={18} color="#ef4444" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>
                Priority 1 Blackspots
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ef4444' }}>
                {metrics.criticalCount}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-main)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '2.4rem',
                height: '2.4rem',
                borderRadius: '0.5rem',
                background: 'rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wrench size={18} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>
                Active Countermeasures
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f59e0b' }}>
                {metrics.inProgressCount}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-main)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '2.4rem',
                height: '2.4rem',
                borderRadius: '0.5rem',
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={18} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>
                Resolved & Mitigated
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>
                {metrics.resolvedCount}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <RoadSafetyFilters
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
        />

        {/* Hotspot List & Evidence Review Table */}
        <RoadSafetyCaseList
          cases={filteredCases}
          onSelectCase={(c) => setDetailCaseId(c.id)}
          onScheduleInspection={(c) => setInspectionTargetCase(c)}
          onPlanIntervention={(c) => setInterventionTargetCase(c)}
        />

        {/* Modals */}
        {detailCaseId && caseDetail && (
          <RoadSafetyCaseDetailModal
            caseDetail={caseDetail}
            onClose={() => setDetailCaseId(null)}
            onTransitionState={handleTransitionState}
          />
        )}

        {inspectionTargetCase && (
          <RoadSafetySiteInspectionModal
            selectedCase={inspectionTargetCase}
            onClose={() => setInspectionTargetCase(null)}
            onSubmitInspection={handleSubmitInspection}
          />
        )}

        {interventionTargetCase && (
          <RoadSafetyInterventionModal
            selectedCase={interventionTargetCase}
            onClose={() => setInterventionTargetCase(null)}
            onSubmitIntervention={handleSubmitIntervention}
          />
        )}

        {showComparatorModal && (
          <RoadSafetyTimelineComparatorModal
            segments={SEED_ROAD_SEGMENTS}
            onClose={() => setShowComparatorModal(false)}
          />
        )}

        {showHazardModal && (
          <RoadSafetyHazardReportModal
            segments={SEED_ROAD_SEGMENTS}
            onClose={() => setShowHazardModal(false)}
            onSubmitReport={handleSubmitHazard}
          />
        )}

        {showRiskRunModal && (
          <RoadSafetyRiskRunModal
            onClose={() => setShowRiskRunModal(false)}
            onExecuteRun={handleExecuteRiskRun}
          />
        )}
      </div>
    </div>
  );
}


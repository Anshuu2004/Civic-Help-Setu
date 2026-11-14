import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ensureRoadSafetySeedData,
  calculateWeightedCrashScore,
  calculateExposureRiskRate,
  calculateInfrastructureHazardScore,
  evaluateSegmentRisk,
  executeRiskRun,
  listReviewCases,
  getReviewCaseDetail,
  transitionReviewCaseState,
  recordSiteInspection,
  recordIntervention,
  evaluateInterventionOutcome,
  submitCitizenHazardReport,
  compareTimePeriods,
  migrateRoadSafetyStorage,
  RATE_LIMIT_MAX_SUBMISSIONS,
} from './roadSafetyBlackspotService';
import {
  ROAD_SAFETY_STORAGE_KEYS,
  CASE_STATES,
  SEED_ROAD_SEGMENTS,
} from '../data/roadSafetyContract';
import { setCurrentActor, PermissionDeniedError } from './accessControl';

const createMemoryStorage = () => {
  const store = new Map();
  return {
    getItem: vi.fn((key) => (store.has(key) ? store.get(key) : null)),
    setItem: vi.fn((key, value) => store.set(key, String(value))),
    removeItem: vi.fn((key) => store.delete(key)),
    clear: vi.fn(() => store.clear()),
    store,
  };
};

describe('roadSafetyBlackspotService', () => {
  let mockStorage;
  const ADMIN_ACTOR = { id: 'admin-1', role: 'admin', username: 'Chief Safety Engineer' };
  const CITIZEN_ACTOR = { id: 'cit-1', role: 'citizen', username: 'Citizen User' };

  beforeEach(() => {
    mockStorage = createMemoryStorage();
    setCurrentActor(ADMIN_ACTOR);
  });

  afterEach(() => {
    setCurrentActor(null);
  });

  describe('Storage Initialization & Bootstrap', () => {
    it('initializes empty storage with seed corridors, features, and bootstrap cases', () => {
      const seeded = ensureRoadSafetySeedData(mockStorage);
      expect(seeded).toBe(true);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        ROAD_SAFETY_STORAGE_KEYS.SEGMENTS,
        expect.any(String)
      );

      // Re-running does not overwrite existing data
      const reseeded = ensureRoadSafetySeedData(mockStorage);
      expect(reseeded).toBe(false);
    });
  });

  describe('Mathematical Formulations & Scoring', () => {
    it('computes MoRTH weighted crash severity accurately', () => {
      const sampleCrashes = [
        { fatalCount: 2, severeInjuryCount: 3, minorInjuryCount: 4, propertyDamageCount: 5 },
      ];
      // 2*5.0 + 3*3.0 + 4*1.0 + 5*0.2 = 10 + 9 + 4 + 1 = 24.0
      const score = calculateWeightedCrashScore(sampleCrashes);
      expect(score).toBe(24.0);
    });

    it('calculates exposure risk rate per million vehicle-km', () => {
      const result = calculateExposureRiskRate(50, 25);
      expect(result.rate).toBe(2.0);
      expect(result.uncertainty).toBe('low');
    });

    it('handles missing exposure denominators with explicit uncertainty bounds', () => {
      const result = calculateExposureRiskRate(50, null);
      expect(result.rate).toBeNull();
      expect(result.uncertainty).toBe('high');
      expect(result.reason).toContain('unavailable');
    });

    it('evaluates infrastructure penalties based on lighting, crossings, and speed', () => {
      const featureUnlit = {
        lightingQuality: 'unlit',
        crossingType: 'none',
        blindCurve: true,
        surfaceCondition: 'deteriorated',
        speedCalming: 'none',
      };
      const evaluation = calculateInfrastructureHazardScore(featureUnlit, 80, [{ status: 'submitted' }]);
      // 8 + 8 + 5 + 5 + 4 + 2 = 32 (capped at 30)
      expect(evaluation.hazardScore).toBe(30);
      expect(evaluation.factors.length).toBeGreaterThan(3);
    });

    it('computes composite risk score and generates explainability factors without inferring fault', () => {
      const segment = SEED_ROAD_SEGMENTS[0];
      const crashes = [{ totalCrashes: 15, fatalCount: 2, severeInjuryCount: 4, exposureDenominator: 30 }];
      const result = evaluateSegmentRisk(segment, crashes, null, []);

      expect(result.compositeRiskScore).toBeGreaterThanOrEqual(5);
      expect(result.compositeRiskScore).toBeLessThanOrEqual(98);
      expect(result.explainabilityFactors).toBeInstanceOf(Array);
      expect(result.explainabilityFactors.some((f) => f.includes('fatal'))).toBe(true);
    });
  });

  describe('Automated Risk Runs & Explainability', () => {
    it('requires admin permission to execute automated risk run', () => {
      setCurrentActor(CITIZEN_ACTOR);
      expect(() => executeRiskRun({}, mockStorage)).toThrow(PermissionDeniedError);
    });

    it('executes risk run and outputs versioned explainable records', () => {
      const run = executeRiskRun({ startDate: '2025-01-01', endDate: '2025-12-31' }, mockStorage);
      expect(run.runRecord.rulesetVersion).toBe('MoRTH-IRC-SP88-v1.2');
      expect(run.runRecord.totalSegmentsEvaluated).toBeGreaterThan(0);
      expect(run.cases.length).toBeGreaterThan(0);
      expect(run.runRecord.disclaimer).toContain('Statutory Road-Safety Analytics Disclaimer');
    });
  });

  describe('Listing & Filtering Cases', () => {
    beforeEach(() => {
      ensureRoadSafetySeedData(mockStorage);
    });

    it('filters cases by state and minScore with pagination', () => {
      const res = listReviewCases({ state: 'Karnataka', minScore: 10, page: 1, limit: 10 }, mockStorage);
      expect(res.cases.every((c) => c.segment.jurisdiction.state === 'Karnataka')).toBe(true);
      expect(res.cases.every((c) => c.compositeRiskScore >= 10)).toBe(true);
      expect(res.totalItems).toBeGreaterThanOrEqual(1);
    });

    it('searches cases by corridor name or district', () => {
      const res = listReviewCases({ searchQuery: 'Hebbal' }, mockStorage);
      expect(res.cases.length).toBeGreaterThanOrEqual(1);
      expect(res.cases[0].segment.name).toContain('Hebbal');
    });

    it('retrieves detailed review case with linked crashes and features', () => {
      const detail = getReviewCaseDetail('case-seg-ka-blr-nh44-01', mockStorage);
      expect(detail).not.toBeNull();
      expect(detail.segment).not.toBeNull();
      expect(detail.crashes).toBeInstanceOf(Array);
      expect(detail.feature).not.toBeNull();
    });
  });

  describe('State Machine & Transitions', () => {
    beforeEach(() => {
      ensureRoadSafetySeedData(mockStorage);
    });

    it('requires roadSafety.review permission to transition state', () => {
      setCurrentActor(CITIZEN_ACTOR);
      expect(() =>
        transitionReviewCaseState('case-seg-ka-blr-nh44-01', CASE_STATES.INSPECTION_SCHEDULED, {}, mockStorage)
      ).toThrow(PermissionDeniedError);
    });

    it('allows valid state progression from candidate to inspection scheduled', () => {
      const updated = transitionReviewCaseState(
        'case-seg-ka-blr-nh44-01',
        CASE_STATES.INSPECTION_SCHEDULED,
        { reason: 'Exceeded statutory 3-year fatal cluster threshold' },
        mockStorage
      );
      expect(updated.status).toBe(CASE_STATES.INSPECTION_SCHEDULED);
      expect(updated.reviewNotes[0].note).toBe('Exceeded statutory 3-year fatal cluster threshold');
    });

    it('rejects invalid state transition with informative error', () => {
      // Cannot jump directly from candidate to resolved
      expect(() =>
        transitionReviewCaseState('case-seg-ka-blr-nh44-01', CASE_STATES.RESOLVED, {}, mockStorage)
      ).toThrow(/Invalid state transition/);
    });

    it('enforces justification reason for dismissal or deferral', () => {
      expect(() =>
        transitionReviewCaseState('case-seg-ka-blr-nh44-01', CASE_STATES.DISMISSED_FALSE_POSITIVE, {}, mockStorage)
      ).toThrow(/documented justification reason is required/);
    });
  });

  describe('Site Inspection & Intervention Tracking', () => {
    beforeEach(() => {
      ensureRoadSafetySeedData(mockStorage);
    });

    it('records site inspection and transitions case to inspected', () => {
      const result = recordSiteInspection(
        'case-seg-ka-blr-nh44-01',
        {
          findings: 'Audit confirms high pedestrian jaywalking due to missing FOB barrier.',
          crossingObservations: 'Median fence breached at 3 locations.',
          lightingCondition: 'poor',
          speedSurveyObservedKmph: 78,
          evidencePhotos: [{ name: 'Breached Fence', url: 'https://images.example.gov.in/p1.jpg' }],
        },
        mockStorage
      );

      expect(result.inspection.inspectedBy).toBe('Chief Safety Engineer');
      expect(result.reviewCase.status).toBe(CASE_STATES.INSPECTED);
      expect(result.reviewCase.inspectionRecords.length).toBe(1);
    });

    it('records intervention and tracks post-intervention outcome', () => {
      const { intervention } = recordIntervention(
        'case-seg-ka-blr-nh44-01',
        {
          interventionType: 'rumble_strips',
          description: 'Install thermoplastic rumble strips and raised pedestrian crosswalk',
          targetCompletionDate: '2026-06-30',
          costEstimateInr: 450000,
          contractor: 'City Road Infrastructure Corp',
        },
        mockStorage
      );

      expect(intervention.interventionType).toBe('rumble_strips');
      expect(intervention.costEstimateInr).toBe(450000);

      const evaluated = evaluateInterventionOutcome(
        intervention.id,
        {
          preInterventionCrashes: 20,
          postInterventionCrashes: 6,
          monitoringMonths: 6,
          notes: 'Observed 70% reduction in pedestrian collisions after installation.',
        },
        mockStorage
      );

      expect(evaluated.outcomeEvaluation.reductionPercentage).toBe(70);
      expect(evaluated.status).toBe('evaluated');
    });
  });

  describe('Citizen Hazard Reporting & Rate Limiting', () => {
    beforeEach(() => {
      ensureRoadSafetySeedData(mockStorage);
    });

    it('sanitizes citizen text and redacts PII before saving', () => {
      const report = submitCitizenHazardReport(
        {
          segmentId: 'seg-ka-blr-nh44-01',
          hazardType: 'pothole_surface',
          description: 'Deep pothole near toll booth, call 9876543210 or email test@example.com for photos <script>alert(1)</script>',
        },
        mockStorage,
        'client-xyz'
      );

      expect(report.description).not.toContain('<script>');
      expect(report.description).toContain('[REDACTED_PHONE]');
      expect(report.description).toContain('[REDACTED_EMAIL]');
    });

    it('enforces rate limit of maximum 5 submissions per 15 minutes', () => {
      for (let i = 0; i < RATE_LIMIT_MAX_SUBMISSIONS; i++) {
        submitCitizenHazardReport(
          {
            segmentId: 'seg-ka-blr-nh44-01',
            hazardType: 'missing_signage',
            description: `Valid hazard description ${i} exceeds minimum length requirement`,
          },
          mockStorage,
          'spammer-client'
        );
      }

      expect(() =>
        submitCitizenHazardReport(
          {
            segmentId: 'seg-ka-blr-nh44-01',
            hazardType: 'missing_signage',
            description: 'This sixth attempt should be rate limited and rejected',
          },
          mockStorage,
          'spammer-client'
        )
      ).toThrow(/Rate limit exceeded/);
    });
  });

  describe('Time Period Comparison & Migration', () => {
    beforeEach(() => {
      ensureRoadSafetySeedData(mockStorage);
    });

    it('compares two distinct periods and measures delta change', () => {
      const comparison = compareTimePeriods(
        'seg-ka-blr-nh44-01',
        { start: '2025-01-01', end: '2025-06-30' },
        { start: '2025-10-01', end: '2025-12-31' },
        mockStorage
      );
      expect(comparison.segmentId).toBe('seg-ka-blr-nh44-01');
      expect(comparison.periodA).toBeDefined();
      expect(comparison.periodB).toBeDefined();
    });

    it('runs storage schema migration smoothly', () => {
      const res = migrateRoadSafetyStorage(mockStorage);
      expect(res.success).toBe(true);
      expect(res.version).toBe(1);
    });
  });
});


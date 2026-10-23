import { describe, it, expect } from 'vitest';
import {
  rankCivicServices,
  evaluateServiceRecommendation,
  evaluateDocumentReadiness,
  normalizeUserPreferences,
  RECOMMENDATION_DISCLAIMER,
} from './recommendationEngine.js';

describe('Explainable Civic Service Recommendation Engine (#78)', () => {
  it('normalizes empty user preferences safely without errors', () => {
    const normalized = normalizeUserPreferences({});
    expect(normalized.intents).toEqual([]);
    expect(normalized.heldDocuments).toEqual([]);
    expect(normalized.age).toBeNull();
    expect(normalized.citizenship).toBeNull();
    expect(normalized.feePreference).toBe('any');
  });

  it('evaluates document readiness accurately against required documents', () => {
    const required = [
      'Proof of Identity (POI) (e.g., PAN, Passport, Voter ID)',
      'Proof of Address (POA) (e.g., Passport, Bank Statement, Utility Bill)',
      'Proof of Date of Birth (DOB) (e.g., Birth Certificate, SSLC Certificate)'
    ];

    const held = ['aadhaar', 'pan'];
    const result = evaluateDocumentReadiness(required, held);

    expect(result.matched.length).toBe(1); // PAN matched POI
    expect(result.missing.length).toBe(2);
    expect(result.ratio).toBeCloseTo(0.33, 1);
  });

  it('produces 100% deterministic ranking for identical inputs', () => {
    const preferences = {
      intents: ['travel_abroad', 'identity_proof'],
      heldDocuments: ['aadhaar', 'pan', 'utility bill', 'birth certificate'],
      citizenship: 'indian',
      age: 25,
      feePreference: 'any',
      maxTurnaroundDays: 30,
    };

    const run1 = rankCivicServices(undefined, preferences);
    const run2 = rankCivicServices(undefined, preferences);

    expect(run1).toHaveLength(run2.length);
    for (let i = 0; i < run1.length; i++) {
      expect(run1[i].serviceId).toBe(run2[i].serviceId);
      expect(run1[i].matchPercentage).toBe(run2[i].matchPercentage);
      expect(run1[i].matchedCriteria).toEqual(run2[i].matchedCriteria);
    }
  });

  it('ranks passport highest when user intent is travel abroad and citizen holds documents', () => {
    const preferences = {
      intents: ['travel_abroad'],
      heldDocuments: ['aadhaar', 'utility bill', 'birth certificate'],
      citizenship: 'indian',
      age: 30,
    };

    const recommendations = rankCivicServices(undefined, preferences);
    expect(recommendations[0].serviceId).toBe('passport');
    expect(recommendations[0].matchedCriteria.some((c) => c.includes('travel abroad'))).toBe(true);
    expect(recommendations[0].disclaimer).toBe(RECOMMENDATION_DISCLAIMER);
  });

  it('does NOT silently treat missing information as satisfied requirements', () => {
    const preferences = {
      intents: ['voting_election'],
      age: null, // User did not specify age
    };

    const recommendations = rankCivicServices(undefined, preferences);
    const voterRec = recommendations.find((r) => r.serviceId === 'voter-id');

    expect(voterRec).toBeDefined();
    expect(voterRec.unknownCriteria.some((u) => u.includes('Age requirement (18+) is unknown'))).toBe(true);
    expect(voterRec.needsOfficialVerification).toBe(true);
  });

  it('correctly identifies conflicting requirements when user is underage for voting', () => {
    const preferences = {
      intents: ['voting_election'],
      age: 15, // Under 18
    };

    const recommendations = rankCivicServices(undefined, preferences);
    const voterRec = recommendations.find((r) => r.serviceId === 'voter-id');

    expect(voterRec).toBeDefined();
    expect(voterRec.unmetRequirements.some((u) => u.includes('Age requirement not met'))).toBe(true);
    expect(voterRec.scores.eligibility).toBe(0);
  });

  it('penalizes paid services when user explicitly selects free_only fee preference', () => {
    const preferences = {
      feePreference: 'free_only',
      heldDocuments: ['aadhaar'],
    };

    const recommendations = rankCivicServices(undefined, preferences);
    const freeServices = recommendations.filter((r) => r.scores.fees === 1.0);
    const paidServices = recommendations.filter((r) => r.scores.fees < 0.5);

    expect(freeServices.length).toBeGreaterThan(0);
    expect(paidServices.length).toBeGreaterThan(0);

    for (const paid of paidServices) {
      expect(paid.unmetRequirements.some((u) => u.includes('Free Only'))).toBe(true);
    }
  });

  it('handles empty or incomplete services gracefully', () => {
    const malformedServices = [
      { id: 'service-empty', name: 'Incomplete Service' },
      { id: 'service-partial', name: 'Partial Service', documents: null, eligibility: null },
    ];

    const result = rankCivicServices(malformedServices, { intents: ['test'] });
    expect(result).toHaveLength(2);
    expect(result[0].serviceId).toBeDefined();
    expect(result[0].matchPercentage).toBeGreaterThanOrEqual(0);
  });
});

import { describe, it, expect } from 'vitest';
import { evaluateAllSchemes, SCHEME_EVALUATION_RULES } from './assessmentStorage';
import {
  evaluateCriteria,
  summarizeCriteria,
  resolveStatus,
  applyCriteria,
  UNKNOWN_STATUS_REASON,
  SCHEME_CRITERIA,
  FIELD_STEPS,
} from './eligibilityCriteria';

const fullProfile = {
  age: 26,
  annualIncome: 180000,
  employment: 'salaried',
  category: 'OBC',
  state: 'Maharashtra',
  isStudent: true,
  ownsAgriculturalLand: false,
  hasAadhaar: true,
  hasPan: true,
  hasLearnerLicense: true,
  hasIncomeCertificate: true,
};

const byId = (criteria, id) => criteria.find((c) => c.id === id);

describe('evaluateCriteria: complete answers', () => {
  it('marks every met requirement as satisfied and keeps verification steps as needs confirmation', () => {
    const criteria = evaluateCriteria('driving-license', fullProfile);
    expect(byId(criteria, 'age').state).toBe('satisfied');
    expect(byId(criteria, 'learner-licence').state).toBe('satisfied');
    expect(byId(criteria, 'documents').state).toBe('confirm');
    expect(summarizeCriteria(criteria)).toEqual({ satisfied: 2, missing: 0, unknown: 0, confirm: 1 });
  });

  it('gives every criterion a label, detail and the wizard step of its input', () => {
    Object.keys(SCHEME_CRITERIA).forEach((id) => {
      evaluateCriteria(id, fullProfile).forEach((c) => {
        expect(c.label.length).toBeGreaterThan(0);
        expect(c.detail.length).toBeGreaterThan(0);
        if (c.field) expect(c.step).toBe(FIELD_STEPS[c.field]);
        else expect(c.step).toBeNull();
      });
    });
  });
});

describe('evaluateCriteria: partial answers', () => {
  it('flags the answers that do not meet a requirement as missing', () => {
    const criteria = evaluateCriteria('driving-license', { ...fullProfile, age: 16, hasLearnerLicense: false });
    expect(byId(criteria, 'age').state).toBe('missing');
    expect(byId(criteria, 'age').detail).toContain('16');
    expect(byId(criteria, 'learner-licence').state).toBe('missing');
  });

  it('uses the income limit of each scheme', () => {
    const profile = { ...fullProfile, annualIncome: 280000 };
    expect(byId(evaluateCriteria('ration-card', profile), 'income').state).toBe('satisfied');
    expect(byId(evaluateCriteria('scholarship-post-matric', profile), 'income').state).toBe('missing');
  });

  it('asks to confirm Aadhaar for PM-Kisan instead of failing it when no land is declared', () => {
    const farmer = { ...fullProfile, employment: 'farmer', hasAadhaar: false };
    expect(byId(evaluateCriteria('pm-kisan', farmer), 'aadhaar-ekyc').state).toBe('confirm');
    expect(byId(evaluateCriteria('pm-kisan', { ...farmer, ownsAgriculturalLand: true }), 'aadhaar-ekyc').state).toBe('missing');
  });

  it('treats a non-self-employed Udyam applicant as needs confirmation, not missing', () => {
    expect(byId(evaluateCriteria('udyam-registration', fullProfile), 'enterprise').state).toBe('confirm');
    expect(
      byId(evaluateCriteria('udyam-registration', { ...fullProfile, employment: 'self-employed' }), 'enterprise').state
    ).toBe('satisfied');
  });
});

describe('evaluateCriteria: unknown data', () => {
  it('treats blank numeric answers as unknown, not zero', () => {
    const blank = { ...fullProfile, age: '', annualIncome: '' };
    expect(byId(evaluateCriteria('driving-license', blank), 'age').state).toBe('unknown');
    expect(byId(evaluateCriteria('ration-card', blank), 'income').state).toBe('unknown');
    expect(byId(evaluateCriteria('scholarship-post-matric', { ...blank, annualIncome: undefined }), 'income').state).toBe('unknown');
  });

  it('marks the marks requirement unknown for General category only, since the wizard never asks for marks', () => {
    const general = evaluateCriteria('scholarship-post-matric', { ...fullProfile, category: 'General' });
    expect(byId(general, 'marks').state).toBe('unknown');
    expect(byId(general, 'marks').field).toBeNull();
    expect(byId(general, 'category').state).toBe('missing');
    expect(byId(evaluateCriteria('scholarship-post-matric', fullProfile), 'marks')).toBeUndefined();
  });

  it('returns one unknown row for a service with no criteria data instead of guessing', () => {
    [undefined, 'no-such-service'].forEach((id) => {
      const criteria = evaluateCriteria(id, fullProfile);
      expect(criteria).toHaveLength(1);
      expect(criteria[0].state).toBe('unknown');
      expect(criteria[0].field).toBeNull();
      expect(criteria[0].detail).toMatch(/official source/i);
    });
  });

  it('does not throw with an empty profile', () => {
    Object.keys(SCHEME_CRITERIA).forEach((id) => {
      expect(() => evaluateCriteria(id)).not.toThrow();
    });
  });
});

describe('resolveStatus and applyCriteria', () => {
  it('does not call something ineligible when only unknown answers are behind it', () => {
    const unknownOnly = [{ state: 'unknown' }, { state: 'satisfied' }];
    expect(resolveStatus('ineligible', unknownOnly)).toBe('unknown');
  });

  it('keeps ineligible when a requirement is really missing', () => {
    expect(resolveStatus('ineligible', [{ state: 'missing' }, { state: 'unknown' }])).toBe('ineligible');
  });

  it('downgrades eligible to conditional while something is unknown, never the reverse', () => {
    expect(resolveStatus('eligible', [{ state: 'unknown' }])).toBe('conditional');
    expect(resolveStatus('eligible', [{ state: 'confirm' }, { state: 'satisfied' }])).toBe('eligible');
    expect(resolveStatus('conditional', [{ state: 'unknown' }])).toBe('conditional');
  });

  it('replaces the engine reason when the status becomes unknown', () => {
    // A service with no criteria data has only an unknown row, so a "no" from the rules cannot stand.
    const applied = applyCriteria({ schemeId: 'does-not-exist', status: 'ineligible', reason: 'x' }, fullProfile);
    expect(applied.status).toBe('unknown');
    expect(applied.reason).toBe(UNKNOWN_STATUS_REASON);
  });

  it('keeps the existing scheme result fields intact', () => {
    const [ev] = evaluateAllSchemes(fullProfile);
    const applied = applyCriteria(ev, fullProfile);
    expect(applied).toMatchObject({ schemeId: ev.schemeId, schemeName: ev.schemeName, actionLink: ev.actionLink });
    expect(applied.criteria.length).toBeGreaterThan(0);
  });
});

describe('agreement with the scheme rules', () => {
  const ages = [16, 30];
  const incomes = [50000, 280000, 500000, 900000];
  const employments = ['salaried', 'farmer', 'self-employed'];
  const categories = ['General', 'OBC'];
  const flags = [true, false];
  const profiles = [];
  ages.forEach((age) => incomes.forEach((annualIncome) => employments.forEach((employment) => categories.forEach((category) => flags.forEach((f) => flags.forEach((g) => {
    profiles.push({ age, annualIncome, employment, category, isStudent: f, ownsAgriculturalLand: g, hasAadhaar: f, hasPan: g, hasLearnerLicense: g, hasIncomeCertificate: f });
  }))))));

  it('never lists a missing requirement for a scheme the rules call eligible', () => {
    profiles.forEach((profile) => {
      evaluateAllSchemes(profile).forEach((ev) => {
        const counts = summarizeCriteria(evaluateCriteria(ev.schemeId, profile));
        if (ev.status === 'eligible') expect(counts.missing, `${ev.schemeId} ${JSON.stringify(profile)}`).toBe(0);
      });
    });
  });

  it('always lists a missing requirement when the rules call a scheme ineligible or conditional', () => {
    profiles.forEach((profile) => {
      evaluateAllSchemes(profile).forEach((ev) => {
        const counts = summarizeCriteria(evaluateCriteria(ev.schemeId, profile));
        if (ev.status !== 'eligible') expect(counts.missing, `${ev.schemeId} ${JSON.stringify(profile)}`).toBeGreaterThan(0);
      });
    });
  });

  it('has criteria for every scheme the checker evaluates', () => {
    SCHEME_EVALUATION_RULES.forEach((rule) => expect(SCHEME_CRITERIA[rule.id]?.length).toBeGreaterThan(0));
  });
});

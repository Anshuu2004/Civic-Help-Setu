import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateReportInput,
  submitOutdatedReport,
  getAllOutdatedReports,
  getReportsByServiceId,
  updateReportModerationStatus,
  isValidWebUrl,
  ISSUE_CATEGORIES,
} from './reportService';

const makeStorage = () => {
  const data = new Map();
  return {
    getItem: vi.fn((k) => (data.has(k) ? data.get(k) : null)),
    setItem: vi.fn((k, v) => data.set(k, String(v))),
    removeItem: vi.fn((k) => data.delete(k)),
    clear: vi.fn(() => data.clear()),
  };
};

describe('reportService - Outdated Information Reporting Suite', () => {
  let storage;
  beforeEach(() => {
    storage = makeStorage();
    vi.stubGlobal('localStorage', storage);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('URL validation: isValidWebUrl', () => {
    it('accepts valid http and https URLs', () => {
      expect(isValidWebUrl('https://uidai.gov.in')).toBe(true);
      expect(isValidWebUrl('http://transport.delhi.gov.in/rules.pdf')).toBe(true);
      expect(isValidWebUrl('https://services.india.gov.in/service/detail?id=123')).toBe(true);
    });

    it('rejects invalid or unsafe protocols', () => {
      expect(isValidWebUrl('javascript:alert(1)')).toBe(false);
      expect(isValidWebUrl('ftp://ftp.portal.gov')).toBe(false);
      expect(isValidWebUrl('not a url')).toBe(false);
      expect(isValidWebUrl('')).toBe(false);
      expect(isValidWebUrl(null)).toBe(false);
      expect(isValidWebUrl(undefined)).toBe(false);
    });
  });

  describe('Input validation: validateReportInput', () => {
    const validPayload = {
      serviceId: 'passport',
      serviceName: 'Passport Issuance',
      issueCategory: ISSUE_CATEGORIES.FEES_CHANGED,
      description: 'The tatkaal fee has been revised from 3500 to 4000 in official gazette notification.',
      officialSourceUrl: 'https://passportindia.gov.in/fees',
      reporterEmail: 'citizen@example.com',
    };

    it('validates a correct payload successfully', () => {
      const res = validateReportInput(validPayload);
      expect(res.isValid).toBe(true);
      expect(Object.keys(res.errors)).toHaveLength(0);
    });

    it('allows optional fields to be empty', () => {
      const res = validateReportInput({
        serviceId: 'passport',
        serviceName: 'Passport Issuance',
        issueCategory: ISSUE_CATEGORIES.DOCUMENTS_CHANGED,
        description: 'Address proof no longer requires ration card.',
      });
      expect(res.isValid).toBe(true);
      expect(Object.keys(res.errors)).toHaveLength(0);
    });

    it('fails when serviceId or serviceName is missing', () => {
      const res1 = validateReportInput({ ...validPayload, serviceId: '' });
      expect(res1.isValid).toBe(false);
      expect(res1.errors.serviceId).toBeDefined();

      const res2 = validateReportInput({ ...validPayload, serviceName: '   ' });
      expect(res2.isValid).toBe(false);
      expect(res2.errors.serviceName).toBeDefined();
    });

    it('fails when issueCategory is invalid', () => {
      const res = validateReportInput({ ...validPayload, issueCategory: 'invalid_category' });
      expect(res.isValid).toBe(false);
      expect(res.errors.issueCategory).toBeDefined();
    });

    it('fails when description is under 10 characters or blank', () => {
      const res1 = validateReportInput({ ...validPayload, description: 'Short' });
      expect(res1.isValid).toBe(false);
      expect(res1.errors.description).toContain('at least 10 characters');

      const res2 = validateReportInput({ ...validPayload, description: '' });
      expect(res2.isValid).toBe(false);
      expect(res2.errors.description).toBeDefined();
    });

    it('fails when description exceeds 1500 characters', () => {
      const longDesc = 'A'.repeat(1501);
      const res = validateReportInput({ ...validPayload, description: longDesc });
      expect(res.isValid).toBe(false);
      expect(res.errors.description).toContain('cannot exceed 1500 characters');
    });

    it('fails when officialSourceUrl is malformed', () => {
      const res = validateReportInput({ ...validPayload, officialSourceUrl: 'ftp://bad.link' });
      expect(res.isValid).toBe(false);
      expect(res.errors.officialSourceUrl).toContain('valid web address');
    });

    it('fails when reporterEmail is malformed', () => {
      const res = validateReportInput({ ...validPayload, reporterEmail: 'invalid-email-address' });
      expect(res.isValid).toBe(false);
      expect(res.errors.reporterEmail).toContain('valid email address');
    });
  });

  describe('Report persistence and retrieval: submitOutdatedReport', () => {
    it('successfully stores report and generates a unique verifiable reference ID', () => {
      const payload = {
        serviceId: 'driving-license',
        serviceName: 'Driving License',
        issueCategory: ISSUE_CATEGORIES.FEES_CHANGED,
        description: 'Learner license fee is now 200 rupees instead of 150.',
        officialSourceUrl: 'https://parivahan.gov.in',
      };

      const result = submitOutdatedReport(payload);
      expect(result.ok).toBe(true);
      expect(result.referenceId).toMatch(/^rep_\d+_/);
      expect(result.report).toBeDefined();
      expect(result.report.status).toBe('pending');
      expect(result.report.serviceName).toBe('Driving License');

      const stored = getAllOutdatedReports();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(result.referenceId);
      expect(stored[0].officialSourceUrl).toBe('https://parivahan.gov.in');
    });

    it('rejects invalid submission without saving to storage', () => {
      const badPayload = {
        serviceId: '',
        serviceName: '',
        description: 'too short',
      };

      const result = submitOutdatedReport(badPayload);
      expect(result.ok).toBe(false);
      expect(result.errors).toBeDefined();
      expect(getAllOutdatedReports()).toHaveLength(0);
    });

    it('filters reports accurately by service ID', () => {
      submitOutdatedReport({
        serviceId: 'pan-card',
        serviceName: 'PAN Card',
        issueCategory: ISSUE_CATEGORIES.BROKEN_LINK,
        description: 'NSDL redirection is failing with timeout.',
      });
      submitOutdatedReport({
        serviceId: 'voter-id',
        serviceName: 'Voter ID',
        issueCategory: ISSUE_CATEGORIES.ELIGIBILITY_CHANGED,
        description: 'Qualifying date for 18 years updated to 4 cutoff dates per year.',
      });

      const panReports = getReportsByServiceId('pan-card');
      expect(panReports).toHaveLength(1);
      expect(panReports[0].serviceName).toBe('PAN Card');

      const dlReports = getReportsByServiceId('driving-license');
      expect(dlReports).toHaveLength(0);
    });
  });

  describe('Moderation lifecycle: updateReportModerationStatus', () => {
    it('updates report status to verified or resolved with moderator notes', () => {
      const submitRes = submitOutdatedReport({
        serviceId: 'birth-certificate',
        serviceName: 'Birth Certificate',
        issueCategory: ISSUE_CATEGORIES.PROCEDURAL_CHANGE,
        description: 'Hospital digital birth intimation now automatic.',
      });

      const reportId = submitRes.referenceId;
      const updateRes = updateReportModerationStatus(reportId, 'resolved', 'Verified and updated catalog');
      expect(updateRes.ok).toBe(true);
      expect(updateRes.report.status).toBe('resolved');
      expect(updateRes.report.resolutionNotes).toBe('Verified and updated catalog');

      const stored = getAllOutdatedReports();
      expect(stored[0].status).toBe('resolved');
    });

    it('rejects invalid moderation status', () => {
      const submitRes = submitOutdatedReport({
        serviceId: 'birth-certificate',
        serviceName: 'Birth Certificate',
        issueCategory: ISSUE_CATEGORIES.PROCEDURAL_CHANGE,
        description: 'Hospital digital birth intimation now automatic.',
      });

      expect(() => {
        updateReportModerationStatus(submitRes.referenceId, 'non_existent_status');
      }).toThrow('Invalid report status');
    });
  });
});

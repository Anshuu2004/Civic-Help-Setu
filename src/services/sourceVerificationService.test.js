import { describe, it, expect } from 'vitest';
import {
  formatVerificationDate,
  getVerificationFreshness,
  inspectOfficialSource,
  getServiceSourceMetadata,
} from './sourceVerificationService';

describe('sourceVerificationService - Official Sources & Verification Suite', () => {
  describe('Date formatting: formatVerificationDate', () => {
    it('formats ISO date strings consistently into readable month, day, year', () => {
      expect(formatVerificationDate('2023-10-01')).toBe('October 1, 2023');
      expect(formatVerificationDate('2026-05-15T00:00:00.000Z')).toBe('May 15, 2026');
    });

    it('returns null for missing, null, or undefined dates without error', () => {
      expect(formatVerificationDate(null)).toBeNull();
      expect(formatVerificationDate(undefined)).toBeNull();
      expect(formatVerificationDate('')).toBeNull();
    });

    it('returns null for unparseable date strings', () => {
      expect(formatVerificationDate('invalid-date-format')).toBeNull();
      expect(formatVerificationDate(12345678901234567890)).toBeNull();
    });
  });

  describe('Verification freshness: getVerificationFreshness', () => {
    it('returns unverified status for null or empty date', () => {
      const res = getVerificationFreshness(null);
      expect(res.status).toBe('unverified');
      expect(res.label).toBe('Audit Due');
    });

    it('returns recent status for date within 90 days', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 10);
      const res = getVerificationFreshness(recentDate.toISOString());
      expect(res.status).toBe('recent');
      expect(res.label).toBe('Verified Fresh');
    });

    it('returns overdue status for dates older than 365 days', () => {
      const res = getVerificationFreshness('2022-01-01');
      expect(res.status).toBe('overdue');
      expect(res.label).toBe('Annual Audit Due');
    });
  });

  describe('Source inspection: inspectOfficialSource', () => {
    it('accurately identifies authorized government domains', () => {
      const govSource = {
        name: 'UIDAI Portal',
        url: 'https://uidai.gov.in/ecosystem',
        verified: true,
      };

      const res = inspectOfficialSource(govSource);
      expect(res.isValid).toBe(true);
      expect(res.isGovDomain).toBe(true);
      expect(res.domain).toBe('uidai.gov.in');
      expect(res.name).toBe('UIDAI Portal');
      expect(res.cleanUrl).toBe('https://uidai.gov.in/ecosystem');
    });

    it('handles non-gov domains safely', () => {
      const externalSource = {
        name: 'Civic Help Center',
        url: 'https://civichelp.org/faq',
      };

      const res = inspectOfficialSource(externalSource);
      expect(res.isValid).toBe(true);
      expect(res.isGovDomain).toBe(false);
      expect(res.domain).toBe('civichelp.org');
    });

    it('rejects unsafe or invalid URLs', () => {
      const unsafeSource = {
        name: 'Hacked Link',
        url: 'javascript:alert(1)',
      };

      const res = inspectOfficialSource(unsafeSource);
      expect(res.isValid).toBe(false);
      expect(res.cleanUrl).toBe('');
    });

    it('gracefully handles missing or malformed source objects', () => {
      expect(inspectOfficialSource(null).isValid).toBe(false);
      expect(inspectOfficialSource(undefined).isValid).toBe(false);
      expect(inspectOfficialSource({}).isValid).toBe(false);
    });
  });

  describe('Service source metadata aggregation: getServiceSourceMetadata', () => {
    it('aggregates valid sources and formatted date for complete service', () => {
      const mockService = {
        id: 'pan-card',
        name: 'PAN Card',
        lastVerified: '2023-11-15',
        officialSources: [
          { name: 'Protean NSDL Portal', url: 'https://onlineservices.protean-tin.com', verified: true },
          { name: 'Income Tax e-Filing', url: 'https://eportal.incometax.gov.in', verified: true },
        ],
      };

      const meta = getServiceSourceMetadata(mockService);
      expect(meta.hasSources).toBe(true);
      expect(meta.sources).toHaveLength(2);
      expect(meta.sources[1].isGovDomain).toBe(true);
      expect(meta.formattedLastVerified).toBe('November 15, 2023');
      expect(meta.freshness).toBeDefined();
    });

    it('handles service with missing officialSources or lastVerified without crashing', () => {
      const emptyService = {
        id: 'legacy-service',
        name: 'Legacy Service',
      };

      const meta = getServiceSourceMetadata(emptyService);
      expect(meta.hasSources).toBe(false);
      expect(meta.sources).toHaveLength(0);
      expect(meta.formattedLastVerified).toBeNull();
      expect(meta.freshness.status).toBe('unverified');
    });

    it('handles null/undefined service safely', () => {
      const meta = getServiceSourceMetadata(null);
      expect(meta.hasSources).toBe(false);
      expect(meta.sources).toHaveLength(0);
      expect(meta.formattedLastVerified).toBeNull();
    });
  });
});

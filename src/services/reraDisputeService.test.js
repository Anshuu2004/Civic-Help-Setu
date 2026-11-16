import { describe, it, expect } from 'vitest';
import {
  RERA_JURISDICTIONS,
  RERA_RELIEF_TYPE,
  RERA_FORM_TYPE,
  isValidDate,
  getDaysBetween,
  getMonthsBetween,
  calculateReraDelayInterest,
  evaluateStructuralDefectLiability,
  evaluateReraEvidenceReadiness,
  draftReraDisputePetition,
} from './reraDisputeService.js';

describe('RERA Dispute Service (#858 follow-up)', () => {
  describe('Date Helpers', () => {
    it('validates ISO dates correctly', () => {
      expect(isValidDate('2024-05-15')).toBe(true);
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('')).toBe(false);
      expect(isValidDate(null)).toBe(false);
    });

    it('calculates days and months between dates accurately', () => {
      const days = getDaysBetween('2024-01-01', '2024-01-31');
      expect(days).toBe(30);

      const months = getMonthsBetween('2024-01-01', '2025-01-01');
      expect(months).toBe(12);
    });
  });

  describe('calculateReraDelayInterest', () => {
    it('returns error when committed possession date is invalid', () => {
      const result = calculateReraDelayInterest({
        committedPossessionDate: 'not-a-date',
        totalPaidInr: 5000000,
      });
      expect(result.isValid).toBe(false);
      expect(result.isDelayed).toBe(false);
      expect(result.accruedInterestInr).toBe(0);
    });

    it('handles on-time / future possession dates without delay', () => {
      const result = calculateReraDelayInterest({
        committedPossessionDate: '2028-12-31',
        evaluationDate: '2026-11-16',
        totalPaidInr: 4000000,
      });
      expect(result.isValid).toBe(true);
      expect(result.isDelayed).toBe(false);
      expect(result.delayDays).toBe(0);
      expect(result.accruedInterestInr).toBe(0);
      expect(result.monthlyDelayCompensationInr).toBe(0);
    });

    it('accurately calculates delayed possession interest under Option A (Withdrawal & Refund)', () => {
      // 1 year delay: 2023-01-01 to 2024-01-01 (365 days)
      // Principal: 10,00,000 INR
      // Rate: 10% p.a.
      // Expected Interest: 10,00,000 * 0.10 * (365/365) = 1,00,000 INR
      const result = calculateReraDelayInterest({
        committedPossessionDate: '2023-01-01',
        evaluationDate: '2024-01-01',
        totalPaidInr: 1000000,
        totalAgreementCostInr: 1200000,
        annualInterestRate: 10.0,
        reliefType: RERA_RELIEF_TYPE.WITHDRAWAL_REFUND,
      });

      expect(result.isValid).toBe(true);
      expect(result.isDelayed).toBe(true);
      expect(result.delayDays).toBe(365);
      expect(result.accruedInterestInr).toBe(100000);
      expect(result.totalClaimableAmountInr).toBe(1100000); // 10L Principal + 1L Interest
      expect(result.paidPercentage).toBe(83);
      expect(result.statutoryCitation).toContain('Section 18(1) First Proviso');
    });

    it('calculates monthly delay compensation under Option B (Stay in Project)', () => {
      const result = calculateReraDelayInterest({
        committedPossessionDate: '2024-01-01',
        evaluationDate: '2024-07-01',
        totalPaidInr: 6000000,
        annualInterestRate: 10.75, // DEFAULT_STATUTORY_INTEREST_RATE
        reliefType: RERA_RELIEF_TYPE.POSSESSION_DELAY_INTEREST,
      });

      expect(result.isValid).toBe(true);
      expect(result.isDelayed).toBe(true);
      // Monthly interest: 60,00,000 * (10.75 / 100) / 12 = 53,750 INR/month
      expect(result.monthlyDelayCompensationInr).toBe(53750);
      expect(result.totalClaimableAmountInr).toBe(result.accruedInterestInr);
      expect(result.statutoryCitation).toContain('Section 18(1) Second Proviso');
    });

    it('factors in grace period months before marking default', () => {
      // Committed date 2024-01-01 with 6 months grace = effective deadline 2024-07-01
      const evalDateBeforeGrace = '2024-04-01';
      const resultNoDelay = calculateReraDelayInterest({
        committedPossessionDate: '2024-01-01',
        gracePeriodMonths: 6,
        evaluationDate: evalDateBeforeGrace,
        totalPaidInr: 5000000,
      });
      expect(resultNoDelay.isDelayed).toBe(false);

      const evalDateAfterGrace = '2024-10-01';
      const resultDelayed = calculateReraDelayInterest({
        committedPossessionDate: '2024-01-01',
        gracePeriodMonths: 6,
        evaluationDate: evalDateAfterGrace,
        totalPaidInr: 5000000,
      });
      expect(resultDelayed.isDelayed).toBe(true);
      expect(resultDelayed.effectivePossessionDate).toBe('2024-07-01');
    });
  });

  describe('evaluateStructuralDefectLiability', () => {
    it('returns error when possession handover date is invalid', () => {
      const res = evaluateStructuralDefectLiability({
        possessionHandoverDate: 'invalid',
      });
      expect(res.isValid).toBe(false);
      expect(res.withinFiveYearWindow).toBe(false);
    });

    it('evaluates defect within 5-year statutory window and tracks 30-day promoter SLA', () => {
      const res = evaluateStructuralDefectLiability({
        possessionHandoverDate: '2023-01-01',
        defectNoticeDate: '2024-06-01',
        evaluationDate: '2024-06-15', // 14 days after notice
        defectCategory: 'RCC_STRUCTURAL',
      });

      expect(res.isValid).toBe(true);
      expect(res.withinFiveYearWindow).toBe(true);
      expect(res.daysSinceNotice).toBe(14);
      expect(res.remainingSlaDays).toBe(16);
      expect(res.isPromoterSlaBreached).toBe(false);
      expect(res.severity).toBe('CRITICAL');
      expect(res.statutoryRemedy).toContain('Within 30-Day Rectification Period');
    });

    it('detects promoter breach when 30 days lapse after notice without rectification', () => {
      const res = evaluateStructuralDefectLiability({
        possessionHandoverDate: '2022-01-01',
        defectNoticeDate: '2023-01-01',
        evaluationDate: '2023-03-01', // 59 days after notice
        defectCategory: 'WATERPROOFING_SEEPAGE',
      });

      expect(res.isValid).toBe(true);
      expect(res.withinFiveYearWindow).toBe(true);
      expect(res.isPromoterSlaBreached).toBe(true);
      expect(res.remainingSlaDays).toBe(0);
      expect(res.statutoryRemedy).toContain('Statutory 30-Day SLA Expired');
    });

    it('detects defects claimed after 5-year expiry', () => {
      const res = evaluateStructuralDefectLiability({
        possessionHandoverDate: '2015-01-01',
        defectNoticeDate: '2022-01-01', // 7 years later
        defectCategory: 'PLUMBING_DRAINAGE',
      });

      expect(res.withinFiveYearWindow).toBe(false);
      expect(res.statutoryRemedy).toContain('after expiry of 5-year statutory warranty');
    });
  });

  describe('evaluateReraEvidenceReadiness', () => {
    it('calculates readiness score and identifies missing mandatory documents', () => {
      const partialChecklist = {
        agreement_for_sale: true,
        allotment_letter: true,
        // payment_receipts missing!
      };

      const evalResult = evaluateReraEvidenceReadiness(partialChecklist);
      expect(evalResult.allMandatoryAttached).toBe(false);
      expect(evalResult.missingMandatory).toContain('Payment Receipts & Bank Account Statement');
      expect(evalResult.totalAttached).toBe(2);

      const completeChecklist = {
        agreement_for_sale: true,
        allotment_letter: true,
        payment_receipts: true,
      };

      const fullResult = evaluateReraEvidenceReadiness(completeChecklist);
      expect(fullResult.allMandatoryAttached).toBe(true);
      expect(fullResult.missingMandatory.length).toBe(0);
    });
  });

  describe('draftReraDisputePetition', () => {
    const mockPetitionData = {
      jurisdiction: 'KARNATAKA',
      formType: RERA_FORM_TYPE.FORM_M,
      agreementDate: '2021-03-15',
      committedPossessionDate: '2023-03-15',
      gracePeriodMonths: 6,
      evaluationDate: '2024-09-15',
      totalPaidInr: 7500000,
      totalAgreementCostInr: 8500000,
      reliefType: RERA_RELIEF_TYPE.WITHDRAWAL_REFUND,
      complainant: {
        name: 'Ramesh Kumar',
        address: 'Flat 402, Bengaluru, Karnataka',
        contact: '9876543210',
      },
      promoter: {
        name: 'Skyline Mega Infrastructure Ltd.',
        projectName: 'Skyline Palms Phase II',
        reraRegNo: 'PRM/KA/RERA/1251/310/PR/200122/003200',
        projectLocation: 'Whitefield, Bengaluru',
      },
      unitDetails: {
        unitNo: 'Unit B-1204',
      },
      interimReliefs: [
        'Restrain promoter from canceling allotment.',
        'Deposit interest in court escrow account.',
      ],
    };

    it('drafts a complete Form M statutory petition with proper headings and calculations', () => {
      const text = draftReraDisputePetition(mockPetitionData);

      expect(text).toContain('BEFORE THE REAL ESTATE REGULATORY AUTHORITY, KARNATAKA');
      expect(text).toContain('COMPLAINT UNDER SECTION 31');
      expect(text).toContain('[STATUTORY FORM M]');
      expect(text).toContain('Ramesh Kumar');
      expect(text).toContain('Skyline Mega Infrastructure Ltd.');
      expect(text).toContain('Unit B-1204');
      expect(text).toContain('PRM/KA/RERA/1251/310/PR/200122/003200');
      expect(text).toContain('Rs. 75,00,000');
      expect(text).toContain('Restrain promoter from canceling allotment.');
      expect(text).toContain('Direct the Respondent to forthwith refund the entire principal sum');
      expect(text).toContain('SBI MCLR of 8.75% + 2.0% statutory margin');
      expect(text).toContain('Signature of Complainant');
    });

    it('adapts petition structure for Form N before Adjudicating Officer', () => {
      const formNData = {
        ...mockPetitionData,
        jurisdiction: 'MAHARASHTRA',
        formType: RERA_FORM_TYPE.FORM_N,
        reliefType: RERA_RELIEF_TYPE.POSSESSION_DELAY_INTEREST,
      };

      const text = draftReraDisputePetition(formNData);

      expect(text).toContain('BEFORE THE ADJUDICATING OFFICER, MAHARASHTRA');
      expect(text).toContain('COMPLAINT UNDER SECTION 71');
      expect(text).toContain('[STATUTORY FORM N]');
      expect(text).toContain('Monthly Delay Compensation');
    });
  });

  describe('RERA Jurisdictions Configuration', () => {
    it('covers major states with valid portals and citations', () => {
      expect(RERA_JURISDICTIONS.MAHARASHTRA.authorityName).toContain('MahaRERA');
      expect(RERA_JURISDICTIONS.KARNATAKA.portalUrl).toContain('rera.karnataka.gov.in');
      expect(RERA_JURISDICTIONS.UTTAR_PRADESH.standardFeeInr).toBe(1000);
      expect(RERA_JURISDICTIONS.HARYANA_GURUGRAM.rulesCitation).toContain('Rule 18');
    });
  });
});

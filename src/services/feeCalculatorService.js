import { APPLICANT_CATEGORIES, PROCESSING_TIERS } from '../data/feeConcessionRules';

export const feeCalculatorService = {
  extractNumericBaseFee(feeString) {
    if (!feeString) return 100;
    const lower = feeString.toLowerCase();
    if (lower.includes('free') || lower.includes('nil') || lower.includes('zero')) return 0;
    
    // Extract first number found
    const match = feeString.match(/(\d+[\d,]*)/);
    if (match) {
      const clean = match[1].replace(/,/g, '');
      const parsed = parseInt(clean, 10);
      return isNaN(parsed) ? 100 : parsed;
    }
    return 100;
  },

  calculateBreakdown({ baseFeeRaw, categoryId = 'general', tierId = 'standard', includeNotary = false, includeDelivery = true }) {
    const baseFee = typeof baseFeeRaw === 'number' ? baseFeeRaw : this.extractNumericBaseFee(baseFeeRaw);
    const category = APPLICANT_CATEGORIES.find(c => c.id === categoryId) || APPLICANT_CATEGORIES[0];
    const tier = PROCESSING_TIERS.find(t => t.id === tierId) || PROCESSING_TIERS[0];

    // Concession calculation
    const rawDiscount = Math.round(baseFee * category.discountRate);
    const adjustedBase = Math.max(0, baseFee - rawDiscount);

    // Addons
    const convenienceCharge = baseFee > 0 ? 15 : 0;
    const notaryCharge = includeNotary ? 100 : 0;
    const expressCharge = tier.extraCharge;
    const deliveryCharge = includeDelivery && baseFee > 0 ? 50 : 0;

    const totalPayable = adjustedBase + convenienceCharge + notaryCharge + expressCharge + deliveryCharge;
    const totalSavings = rawDiscount;

    // Timeline estimate
    const defaultDays = baseFee === 0 ? 3 : 15;
    const calculatedDays = Math.max(1, defaultDays + tier.daysOffset);

    return {
      baseFee,
      category,
      tier,
      rawDiscount,
      adjustedBase,
      convenienceCharge,
      notaryCharge,
      expressCharge,
      deliveryCharge,
      totalPayable,
      totalSavings,
      calculatedDays,
      timelineSteps: [
        { title: 'Application Submission & Payment', day: 'Day 1', status: 'Immediate' },
        { title: 'Document Verification & Scrutiny', day: `Day ${Math.max(2, Math.floor(calculatedDays * 0.3))}`, status: 'Department Counter' },
        { title: 'Field / Police Verification (if applicable)', day: `Day ${Math.max(3, Math.floor(calculatedDays * 0.6))}`, status: 'On-Ground Officer' },
        { title: 'Approval & Certificate Generation', day: `Day ${Math.max(4, Math.floor(calculatedDays * 0.85))}`, status: 'Digital Dispatch' },
        { title: 'Final Home Delivery / Download Ready', day: `Day ${calculatedDays}`, status: 'Completed' }
      ]
    };
  }
};

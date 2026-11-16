/**
 * RERA Homebuyer Dispute & Statutory Interest Service
 *
 * Implements deterministic statutory calculations, jurisdiction rules,
 * Section 14 structural defect evaluations, and Form M / Form N dispute
 * petition drafting under the Real Estate (Regulation and Development) Act, 2016.
 */

/**
 * Standard SBI 1-Year Marginal Cost of Funds Based Lending Rate (MCLR).
 * State RERA Rules benchmark statutory delay interest to SBI MCLR + 2%.
 */
export const DEFAULT_SBI_MCLR_RATE = 8.75; // 8.75% per annum
export const STATUTORY_MARGIN_RATE = 2.0;  // +2.0% statutory margin
export const DEFAULT_STATUTORY_INTEREST_RATE = DEFAULT_SBI_MCLR_RATE + STATUTORY_MARGIN_RATE; // 10.75%

/**
 * Supported State RERA Jurisdictions with official portals, statutory benches,
 * standard filing fees, and conciliation availability.
 */
export const RERA_JURISDICTIONS = {
  MAHARASHTRA: {
    id: 'MAHARASHTRA',
    stateName: 'Maharashtra',
    authorityName: 'Maharashtra Real Estate Regulatory Authority (MahaRERA)',
    portalUrl: 'https://maharera.mahaonline.gov.in',
    standardFeeInr: 5000,
    conciliationFeeInr: 1000,
    hasConciliationForum: true,
    rulesCitation: 'MahaRERA (General) Regulations, 2017 & Rule 18',
    registrationPrefix: 'P5',
  },
  KARNATAKA: {
    id: 'KARNATAKA',
    stateName: 'Karnataka',
    authorityName: 'Karnataka Real Estate Regulatory Authority (K-RERA)',
    portalUrl: 'https://rera.karnataka.gov.in',
    standardFeeInr: 2000,
    conciliationFeeInr: 1000,
    hasConciliationForum: true,
    rulesCitation: 'Karnataka Real Estate (Regulation and Development) Rules, 2017 - Rule 15',
    registrationPrefix: 'PRM/KA/RERA',
  },
  UTTAR_PRADESH: {
    id: 'UTTAR_PRADESH',
    stateName: 'Uttar Pradesh',
    authorityName: 'Uttar Pradesh Real Estate Regulatory Authority (UP RERA)',
    portalUrl: 'https://www.up-rera.in',
    standardFeeInr: 1000,
    conciliationFeeInr: 500,
    hasConciliationForum: true,
    rulesCitation: 'UP Real Estate (Regulation and Development) Rules, 2016 - Rule 16',
    registrationPrefix: 'UPRERAPRJ',
  },
  HARYANA_GURUGRAM: {
    id: 'HARYANA_GURUGRAM',
    stateName: 'Haryana (Gurugram)',
    authorityName: 'Haryana Real Estate Regulatory Authority (HARERA Gurugram)',
    portalUrl: 'https://haryanarera.gov.in',
    standardFeeInr: 1000,
    conciliationFeeInr: 500,
    hasConciliationForum: true,
    rulesCitation: 'Haryana Real Estate (Regulation and Development) Rules, 2017 - Rule 18',
    registrationPrefix: 'RC/REP/HARERA/GGM',
  },
  TAMIL_NADU: {
    id: 'TAMIL_NADU',
    stateName: 'Tamil Nadu',
    authorityName: 'Tamil Nadu Real Estate Regulatory Authority (TNRERA)',
    portalUrl: 'https://www.rera.tn.gov.in',
    standardFeeInr: 1000,
    conciliationFeeInr: 500,
    hasConciliationForum: true,
    rulesCitation: 'Tamil Nadu Real Estate (Regulation and Development) Rules, 2017 - Rule 19',
    registrationPrefix: 'TN/RERA',
  },
  DELHI: {
    id: 'DELHI',
    stateName: 'NCT of Delhi',
    authorityName: 'Real Estate Regulatory Authority Delhi (Delhi RERA)',
    portalUrl: 'https://rera.delhi.gov.in',
    standardFeeInr: 1000,
    conciliationFeeInr: 500,
    hasConciliationForum: false,
    rulesCitation: 'National Capital Territory of Delhi Real Estate Rules, 2016',
    registrationPrefix: 'DLRERA',
  },
  GUJARAT: {
    id: 'GUJARAT',
    stateName: 'Gujarat',
    authorityName: 'Gujarat Real Estate Regulatory Authority (GujRERA)',
    portalUrl: 'https://gujrera.gujarat.gov.in',
    standardFeeInr: 1000,
    conciliationFeeInr: 500,
    hasConciliationForum: true,
    rulesCitation: 'Gujarat Real Estate (Regulation and Development) Rules, 2017',
    registrationPrefix: 'PR/GJ',
  },
};

/**
 * Statutory relief types under RERA Section 18.
 */
export const RERA_RELIEF_TYPE = {
  WITHDRAWAL_REFUND: 'WITHDRAWAL_REFUND', // Section 18(1) 1st Proviso: Return of paid amount + interest + compensation
  POSSESSION_DELAY_INTEREST: 'POSSESSION_DELAY_INTEREST', // Section 18(1) 2nd Proviso: Stay in project, monthly delay interest
};

/**
 * Statutory petition forms.
 */
export const RERA_FORM_TYPE = {
  FORM_M: 'FORM_M', // Section 31 complaint before Real Estate Regulatory Authority
  FORM_N: 'FORM_N', // Section 71 complaint before Adjudicating Officer for compensation
};

/**
 * Section 14(3) defect classifications.
 */
export const STRUCTURAL_DEFECT_CATEGORIES = {
  RCC_STRUCTURAL: {
    id: 'RCC_STRUCTURAL',
    label: 'Structural Foundation & RCC Failure (Cracks, Beam deflection, Sinking)',
    severity: 'CRITICAL',
    statutoryRef: 'Section 14(3) - Structural Defect',
  },
  WATERPROOFING_SEEPAGE: {
    id: 'WATERPROOFING_SEEPAGE',
    label: 'Waterproofing & Severe Efflorescence / Leakage (Roof, Podium, Basement)',
    severity: 'HIGH',
    statutoryRef: 'Section 14(3) - Workmanship / Quality Defect',
  },
  FIRE_SAFETY_ELECTRICAL: {
    id: 'FIRE_SAFETY_ELECTRICAL',
    label: 'Fire Fighting System & Substation / Transformer Defect',
    severity: 'CRITICAL',
    statutoryRef: 'Section 14(3) - Provision of Services Defect',
  },
  PLUMBING_DRAINAGE: {
    id: 'PLUMBING_DRAINAGE',
    label: 'Sewage Ingress, Common Riser Pipe Rupture & Water Supply Failure',
    severity: 'HIGH',
    statutoryRef: 'Section 14(3) - Workmanship / Quality Defect',
  },
  FINISHING_PLASTER: {
    id: 'FINISHING_PLASTER',
    label: 'Exterior Plaster Spalling, Hollow Tiles & Material Delamination',
    severity: 'MODERATE',
    statutoryRef: 'Section 14(3) - Workmanship Defect',
  },
};

/**
 * Validates whether a date string is valid ISO YYYY-MM-DD.
 */
export function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const match = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!match) return false;
  const d = new Date(dateStr);
  return !Number.isNaN(d.getTime());
}

/**
 * Computes difference in calendar days between two ISO dates.
 */
export function getDaysBetween(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Computes difference in approximate months between two ISO dates.
 */
export function getMonthsBetween(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

/**
 * Calculates RERA Section 18 statutory delayed possession interest and refund entitlement.
 *
 * @param {Object} params
 * @param {string} params.committedPossessionDate ISO date (YYYY-MM-DD) committed in Agreement for Sale
 * @param {number} [params.gracePeriodMonths=0] Grace period granted in Agreement (e.g. 3 or 6 months)
 * @param {string} [params.evaluationDate] Current evaluation date (defaults to today's date)
 * @param {number} params.totalPaidInr Total monetary amount paid by homebuyer to promoter (in INR)
 * @param {number} [params.totalAgreementCostInr=0] Total sanctioned purchase price in Agreement for Sale
 * @param {number} [params.annualInterestRate=DEFAULT_STATUTORY_INTEREST_RATE] Annual interest percentage (SBI MCLR + 2%)
 * @param {string} [params.reliefType=RERA_RELIEF_TYPE.POSSESSION_DELAY_INTEREST] Relief type (Withdrawal vs Possession)
 * @returns {Object} Comprehensive delay interest and claim breakdown
 */
export function calculateReraDelayInterest({
  committedPossessionDate,
  gracePeriodMonths = 0,
  evaluationDate,
  totalPaidInr = 0,
  totalAgreementCostInr = 0,
  annualInterestRate = DEFAULT_STATUTORY_INTEREST_RATE,
  reliefType = RERA_RELIEF_TYPE.POSSESSION_DELAY_INTEREST,
}) {
  const paid = Math.max(0, Number(totalPaidInr) || 0);
  const agreementCost = Math.max(0, Number(totalAgreementCostInr) || paid);
  const rate = Math.max(0.1, Number(annualInterestRate) || DEFAULT_STATUTORY_INTEREST_RATE);
  const grace = Math.max(0, parseInt(gracePeriodMonths, 10) || 0);

  if (!isValidDate(committedPossessionDate)) {
    return {
      isValid: false,
      error: 'Invalid or missing committed possession date.',
      isDelayed: false,
      delayDays: 0,
      delayMonths: 0,
      accruedInterestInr: 0,
      monthlyDelayCompensationInr: 0,
      totalClaimableAmountInr: paid,
    };
  }

  const effectivePossessionDateObj = new Date(committedPossessionDate);
  if (grace > 0) {
    effectivePossessionDateObj.setMonth(effectivePossessionDateObj.getMonth() + grace);
  }
  const effectivePossessionDate = effectivePossessionDateObj.toISOString().slice(0, 10);

  const evalDate = isValidDate(evaluationDate)
    ? evaluationDate
    : new Date().toISOString().slice(0, 10);

  const delayDays = getDaysBetween(effectivePossessionDate, evalDate);
  const isDelayed = delayDays > 0;
  const delayMonths = isDelayed ? getMonthsBetween(effectivePossessionDate, evalDate) : 0;

  // Statutory simple interest formula: Interest = Principal * Rate * (Days / 365)
  // Per Section 18 and standard appellate tribunal benchmarks:
  const accruedInterestInr = isDelayed
    ? Math.round((paid * (rate / 100) * delayDays) / 365)
    : 0;

  // Monthly delay compensation (for Option B: staying in the project):
  // Monthly interest = Principal * (Rate / 100) / 12
  const monthlyDelayCompensationInr = isDelayed
    ? Math.round((paid * (rate / 100)) / 12)
    : 0;

  // Total claimable amount:
  // If WITHDRAWAL_REFUND: Principal Paid + Accrued Delay Interest
  // If POSSESSION_DELAY_INTEREST: Accrued Delay Interest up to evaluation date (Principal remains invested in unit)
  const totalClaimableAmountInr = reliefType === RERA_RELIEF_TYPE.WITHDRAWAL_REFUND
    ? paid + accruedInterestInr
    : accruedInterestInr;

  const paidPercentage = agreementCost > 0
    ? Math.min(100, Math.round((paid / agreementCost) * 100))
    : 100;

  return {
    isValid: true,
    isDelayed,
    committedPossessionDate,
    gracePeriodMonths: grace,
    effectivePossessionDate,
    evaluationDate: evalDate,
    delayDays,
    delayMonths,
    totalPaidInr: paid,
    totalAgreementCostInr: agreementCost,
    paidPercentage,
    annualInterestRate: rate,
    reliefType,
    accruedInterestInr,
    monthlyDelayCompensationInr,
    totalClaimableAmountInr,
    statutoryCitation: reliefType === RERA_RELIEF_TYPE.WITHDRAWAL_REFUND
      ? 'Section 18(1) First Proviso - Full Refund with Statutory Interest at SBI MCLR + 2%'
      : 'Section 18(1) Second Proviso - Monthly Delay Compensation until Possession Handover',
  };
}

/**
 * Evaluates Section 14(3) 5-year structural defect liability and 30-day notice SLA.
 *
 * @param {Object} params
 * @param {string} params.possessionHandoverDate Date when physical possession was taken (YYYY-MM-DD)
 * @param {string} params.defectNoticeDate Date when written notice was served to promoter (YYYY-MM-DD)
 * @param {string} params.defectCategory Category key from STRUCTURAL_DEFECT_CATEGORIES
 * @param {string} [params.evaluationDate] Current evaluation date (defaults to today)
 * @returns {Object} Defect liability evaluation
 */
export function evaluateStructuralDefectLiability({
  possessionHandoverDate,
  defectNoticeDate,
  defectCategory,
  evaluationDate,
}) {
  if (!isValidDate(possessionHandoverDate)) {
    return {
      isValid: false,
      error: 'Invalid or missing possession handover date.',
      withinFiveYearWindow: false,
      isPromoterSlaBreached: false,
    };
  }

  const evalDate = isValidDate(evaluationDate)
    ? evaluationDate
    : new Date().toISOString().slice(0, 10);

  const handoverObj = new Date(possessionHandoverDate);
  const fiveYearExpiryObj = new Date(handoverObj);
  fiveYearExpiryObj.setFullYear(fiveYearExpiryObj.getFullYear() + 5);
  const fiveYearExpiryDate = fiveYearExpiryObj.toISOString().slice(0, 10);

  const noticeDate = isValidDate(defectNoticeDate) ? defectNoticeDate : evalDate;
  const daysSinceHandover = getDaysBetween(possessionHandoverDate, noticeDate);
  const withinFiveYearWindow = new Date(noticeDate) <= fiveYearExpiryObj;

  // Section 14(3) mandates rectification within 30 days from notice
  let daysSinceNotice = 0;
  let isPromoterSlaBreached = false;
  let remainingSlaDays = 30;

  if (isValidDate(defectNoticeDate)) {
    daysSinceNotice = getDaysBetween(defectNoticeDate, evalDate);
    isPromoterSlaBreached = daysSinceNotice > 30;
    remainingSlaDays = Math.max(0, 30 - daysSinceNotice);
  }

  const defectMeta = STRUCTURAL_DEFECT_CATEGORIES[defectCategory] || {
    id: 'OTHER',
    label: 'Unspecified Workmanship / Material Defect',
    severity: 'MODERATE',
    statutoryRef: 'Section 14(3)',
  };

  return {
    isValid: true,
    possessionHandoverDate,
    fiveYearExpiryDate,
    defectNoticeDate: isValidDate(defectNoticeDate) ? defectNoticeDate : null,
    evaluationDate: evalDate,
    daysSinceHandover,
    withinFiveYearWindow,
    daysSinceNotice,
    remainingSlaDays,
    isPromoterSlaBreached,
    defectCategory: defectMeta.id,
    defectLabel: defectMeta.label,
    severity: defectMeta.severity,
    statutoryRemedy: withinFiveYearWindow
      ? isPromoterSlaBreached
        ? 'Statutory 30-Day SLA Expired: Allottee entitled to claim compensatory damages under Section 14(3) read with Section 71.'
        : `Within 30-Day Rectification Period: ${remainingSlaDays} days remaining for promoter to rectify without charge.`
      : 'Defect reported after expiry of 5-year statutory warranty window.',
  };
}

/**
 * Standard evidence items required for filing a RERA Form M or Form N complaint.
 */
export const RERA_EVIDENCE_CHECKLIST = [
  {
    id: 'agreement_for_sale',
    label: 'Registered Agreement for Sale / Builder-Buyer Agreement (BBA)',
    mandatory: true,
    description: 'Stamped agreement detailing unit specification, total consideration, and promised possession date.',
  },
  {
    id: 'allotment_letter',
    label: 'Allotment Letter & Booking Application Form',
    mandatory: true,
    description: 'Initial booking confirmation establishing locus standi and unit assignment.',
  },
  {
    id: 'payment_receipts',
    label: 'Payment Receipts & Bank Account Statement',
    mandatory: true,
    description: 'Chronological proof of every installment paid to the promoter or escrow account.',
  },
  {
    id: 'rera_project_certificate',
    label: 'RERA Project Registration Certificate / Web Printout',
    mandatory: false,
    description: 'Official RERA registration number and quarterly progress report (QPR) printout.',
  },
  {
    id: 'delay_correspondence',
    label: 'Delay Notices & Communication with Promoter',
    mandatory: false,
    description: 'Emails, demand letters, or replies acknowledging delay or force majeure claims.',
  },
  {
    id: 'site_photographs',
    label: 'Photographs of Incomplete Work / Structural Defects',
    mandatory: false,
    description: 'Geotagged site inspection images evidencing unfinished construction or structural flaws.',
  },
  {
    id: 'demand_notice_served',
    label: 'Written Legal Notice / Demand Letter Served to Promoter',
    mandatory: false,
    description: 'Proof of dispatch and delivery of formal notice claiming possession or defect cure.',
  },
];

/**
 * Evaluates evidence completeness and readiness score.
 */
export function evaluateReraEvidenceReadiness(checklistState = {}) {
  const items = RERA_EVIDENCE_CHECKLIST.map((item) => ({
    ...item,
    attached: Boolean(checklistState[item.id]),
  }));

  const mandatoryItems = items.filter((i) => i.mandatory);
  const attachedMandatory = mandatoryItems.filter((i) => i.attached);
  const allMandatoryAttached = attachedMandatory.length === mandatoryItems.length;

  const totalAttached = items.filter((i) => i.attached).length;
  const readinessPercentage = Math.round((totalAttached / items.length) * 100);

  return {
    items,
    readinessPercentage,
    allMandatoryAttached,
    totalAttached,
    totalItems: items.length,
    missingMandatory: mandatoryItems.filter((i) => !i.attached).map((i) => i.label),
  };
}

/**
 * Drafts a formal, court-ready RERA Form M or Form N Dispute Complaint.
 *
 * @param {Object} petitionData
 * @returns {string} Formatted statutory legal petition text
 */
export function draftReraDisputePetition(petitionData = {}) {
  const jurisdictionKey = petitionData.jurisdiction || 'MAHARASHTRA';
  const jurisdiction = RERA_JURISDICTIONS[jurisdictionKey] || RERA_JURISDICTIONS.MAHARASHTRA;
  const formType = petitionData.formType || RERA_FORM_TYPE.FORM_M;

  const calculation = calculateReraDelayInterest({
    committedPossessionDate: petitionData.committedPossessionDate,
    gracePeriodMonths: petitionData.gracePeriodMonths || 0,
    evaluationDate: petitionData.evaluationDate,
    totalPaidInr: petitionData.totalPaidInr || 0,
    totalAgreementCostInr: petitionData.totalAgreementCostInr || 0,
    annualInterestRate: petitionData.annualInterestRate || DEFAULT_STATUTORY_INTEREST_RATE,
    reliefType: petitionData.reliefType || RERA_RELIEF_TYPE.POSSESSION_DELAY_INTEREST,
  });

  const isFormM = formType === RERA_FORM_TYPE.FORM_M;
  const forumTitle = isFormM
    ? `BEFORE THE REAL ESTATE REGULATORY AUTHORITY, ${jurisdiction.stateName.toUpperCase()}`
    : `BEFORE THE ADJUDICATING OFFICER, ${jurisdiction.stateName.toUpperCase()}`;

  const complainantName = petitionData.complainant?.name || '[COMPLAINANT NAME]';
  const complainantAddress = petitionData.complainant?.address || '[COMPLAINANT RESIDENTIAL ADDRESS]';
  const complainantContact = petitionData.complainant?.contact || '[COMPLAINANT PHONE / EMAIL]';

  const promoterName = petitionData.promoter?.name || '[PROMOTER / BUILDER NAME]';
  const projectName = petitionData.promoter?.projectName || '[PROJECT NAME]';
  const reraRegNo = petitionData.promoter?.reraRegNo || '[RERA REGISTRATION NUMBER]';
  const projectLocation = petitionData.promoter?.projectLocation || '[PROJECT LOCATION / TALUK / DISTRICT]';
  const unitNo = petitionData.unitDetails?.unitNo || '[UNIT / FLAT / PLOT NUMBER]';

  const interimReliefs = Array.isArray(petitionData.interimReliefs) && petitionData.interimReliefs.length > 0
    ? petitionData.interimReliefs
    : [
        'Restrain the Respondent Promoter from creating any third-party rights or alienating the subject unit.',
        'Direct the Respondent Promoter to submit escrow account bank statements for the subject project.',
      ];

  const lines = [
    '================================================================================',
    forumTitle,
    `COMPLAINT UNDER SECTION ${isFormM ? '31' : '71'} OF THE REAL ESTATE (REGULATION AND DEVELOPMENT) ACT, 2016`,
    `[STATUTORY ${isFormM ? 'FORM M' : 'FORM N'}]`,
    '================================================================================',
    '',
    'IN THE MATTER OF:',
    `1. COMPLAINANT / ALLOTTEE:`,
    `   ${complainantName}`,
    `   Address: ${complainantAddress}`,
    `   Contact: ${complainantContact}`,
    '',
    '                       VERSUS',
    '',
    `2. RESPONDENT / PROMOTER:`,
    `   ${promoterName}`,
    `   Project Name: ${projectName}`,
    `   RERA Registration No.: ${reraRegNo}`,
    `   Project Site: ${projectLocation}`,
    '',
    '--------------------------------------------------------------------------------',
    'I. PARTICULARS OF THE SUBJECT UNIT & TRANSACTION:',
    '--------------------------------------------------------------------------------',
    `1. Unit Assigned: ${unitNo}`,
    `2. Agreement for Sale Executed On: ${petitionData.agreementDate || '[DATE OF AGREEMENT]'}`,
    `3. Committed Possession Handover Date: ${calculation.committedPossessionDate || '[COMMITTED DATE]'}`,
    `4. Permissible Grace Period: ${calculation.gracePeriodMonths} Months`,
    `5. Effective Statutory Possession Deadline: ${calculation.effectivePossessionDate || '[EFFECTIVE DEADLINE]'}`,
    `6. Total Agreed Consideration: Rs. ${calculation.totalAgreementCostInr.toLocaleString('en-IN')}`,
    `7. Total Amount Disbursed by Complainant: Rs. ${calculation.totalPaidInr.toLocaleString('en-IN')} (${calculation.paidPercentage}% of agreed consideration)`,
    '',
    '--------------------------------------------------------------------------------',
    'II. CONCISE STATEMENT OF FACTS & GROUNDS OF COMPLAINT:',
    '--------------------------------------------------------------------------------',
    '1. The Complainant booked the aforementioned residential unit in the Respondent\'s registered project and has faithfully paid all demanded installments in accordance with the construction-linked payment plan.',
    `2. Under the registered Agreement for Sale, the Respondent was under a strict statutory duty under Section 18 to deliver vacant and peaceful possession on or before ${calculation.effectivePossessionDate}.`,
    `3. As of the evaluation date (${calculation.evaluationDate}), the Respondent has failed to obtain an Occupancy Certificate (OC) or hand over lawful possession, resulting in an unlawful delay of ${calculation.delayDays} days (${calculation.delayMonths} months).`,
    '4. The default is solely attributable to gross neglect, financial diversion, and administrative mismanagement by the Respondent Promoter, causing immense financial distress and mental agony to the Complainant.',
    '',
    '--------------------------------------------------------------------------------',
    'III. STATUTORY DELAY INTEREST & COMPENSATION COMPUTATION:',
    '--------------------------------------------------------------------------------',
    `Prescribed Benchmark Interest Rate: ${calculation.annualInterestRate}% p.a. (SBI MCLR of ${DEFAULT_SBI_MCLR_RATE}% + 2.0% statutory margin)`,
    `Statutory Remedy Invoked: ${calculation.statutoryCitation}`,
    `Total Accrued Statutory Delay Interest: Rs. ${calculation.accruedInterestInr.toLocaleString('en-IN')}`,
    calculation.reliefType === RERA_RELIEF_TYPE.POSSESSION_DELAY_INTEREST
      ? `Ongoing Monthly Delay Compensation: Rs. ${calculation.monthlyDelayCompensationInr.toLocaleString('en-IN')} per month until actual possession handover.`
      : `Full Refund Entitlement (Principal + Interest): Rs. ${calculation.totalClaimableAmountInr.toLocaleString('en-IN')}`,
    '',
    '--------------------------------------------------------------------------------',
    'IV. INTERIM PRAYERS / DIRECTIONS SOUGHT PENDING INQUIRY:',
    '--------------------------------------------------------------------------------',
    ...interimReliefs.map((relief, idx) => `${idx + 1}. ${relief}`),
    '',
    '--------------------------------------------------------------------------------',
    'V. FINAL PRAYER / RELIEFS:',
    '--------------------------------------------------------------------------------',
    'In light of the statutory facts and violations stated above, the Complainant respectfully prays that this Hon\'ble Forum may be pleased to:',
    calculation.reliefType === RERA_RELIEF_TYPE.WITHDRAWAL_REFUND
      ? `(a) Direct the Respondent to forthwith refund the entire principal sum of Rs. ${calculation.totalPaidInr.toLocaleString('en-IN')} along with statutory interest of Rs. ${calculation.accruedInterestInr.toLocaleString('en-IN')} computed at ${calculation.annualInterestRate}% p.a.`
      : `(a) Direct the Respondent to pay monthly delay compensation of Rs. ${calculation.monthlyDelayCompensationInr.toLocaleString('en-IN')} from the default date (${calculation.effectivePossessionDate}) until actual handover of possession with valid Occupancy Certificate.`,
    '(b) Award compensatory costs towards mental harassment and legal litigation expenses under Section 71.',
    '(c) Pass any such further orders as this Hon\'ble Authority deems fit and proper in the interest of justice.',
    '',
    '--------------------------------------------------------------------------------',
    'VI. VERIFICATION',
    '--------------------------------------------------------------------------------',
    `I, ${complainantName}, the Complainant above-named, do hereby verify that the contents of paragraphs I to V are true and correct to the best of my knowledge, and no part thereof is false and nothing material has been concealed therefrom.`,
    '',
    `Verified at: ${jurisdiction.stateName}`,
    `Date: ${calculation.evaluationDate}`,
    '',
    '______________________________',
    'Signature of Complainant',
    '================================================================================',
  ];

  return lines.join('\n');
}

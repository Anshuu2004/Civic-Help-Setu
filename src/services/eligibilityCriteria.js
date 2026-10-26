/**
 * Per-requirement breakdown for the scheme results in assessmentStorage.js.
 *
 * Every criterion ends up in exactly one of four states:
 *   satisfied - the answers given meet the requirement
 *   missing   - the answers given do not meet it
 *   unknown   - the answer is blank, or this checker does not collect the data
 *   confirm   - the answers look fine but an official office has to verify it
 *
 * `field` is the profile key of the wizard input the user should look at to
 * change the outcome (null when no wizard input applies), and FIELD_STEPS says
 * which wizard step that input is on.
 */

export const CRITERION_STATES = ['satisfied', 'missing', 'unknown', 'confirm'];

export const CRITERION_STATE_LABELS = {
  satisfied: 'Satisfied',
  missing: 'Missing',
  unknown: 'Unknown',
  confirm: 'Needs confirmation',
};

export const FIELD_STEPS = {
  age: 1,
  annualIncome: 1,
  employment: 1,
  category: 1,
  state: 1,
  hasAadhaar: 2,
  hasPan: 2,
  hasLearnerLicense: 2,
  hasIncomeCertificate: 2,
  ownsAgriculturalLand: 2,
  isStudent: 2,
};

const inr = (n) => `₹${n.toLocaleString('en-IN')}`;

// A blank or non-numeric answer is "not answered", not zero.
const toNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const satisfied = (detail) => ({ state: 'satisfied', detail });
const missing = (detail) => ({ state: 'missing', detail });
const unknown = (detail) => ({ state: 'unknown', detail });
const confirm = (detail) => ({ state: 'confirm', detail });

const maxIncome = (limit) => (profile) => {
  const income = toNumber(profile.annualIncome);
  if (income === null) return unknown('Annual family income is blank.');
  return income <= limit
    ? satisfied(`Your income is ${inr(income)}.`)
    : missing(`Your income is ${inr(income)}, above ${inr(limit)}.`);
};

const holds = (key, yes, no) => (profile) => (profile[key] ? satisfied(yes) : missing(no));

export const SCHEME_CRITERIA = {
  'pm-kisan': [
    {
      id: 'landholding',
      label: 'Cultivator or holder of agricultural land',
      field: 'ownsAgriculturalLand',
      check: (p) =>
        p.employment === 'farmer' || p.ownsAgriculturalLand
          ? satisfied('You marked farming or agricultural land ownership.')
          : missing('You did not mark farming or agricultural land ownership.'),
    },
    {
      id: 'income',
      label: 'Family income within the limit used by this checker',
      field: 'annualIncome',
      check: maxIncome(800000),
    },
    {
      id: 'aadhaar-ekyc',
      label: 'Aadhaar linked to bank account for e-KYC',
      field: 'hasAadhaar',
      check: (p) => {
        if (p.hasAadhaar) return satisfied('You have an Aadhaar with a linked mobile number.');
        return p.ownsAgriculturalLand
          ? missing('Aadhaar is needed to receive the direct benefit transfer.')
          : confirm('You did not tick Aadhaar. Payments need Aadhaar e-KYC, so confirm this with the office.');
      },
    },
    {
      id: 'land-records',
      label: 'Land records match what you declared',
      field: 'ownsAgriculturalLand',
      check: () => confirm('The state revenue office verifies Khatauni / Patta records. This checker cannot.'),
    },
  ],
  'ration-card': [
    {
      id: 'income',
      label: 'Family income within the limit used by this checker',
      field: 'annualIncome',
      check: maxIncome(300000),
    },
    {
      id: 'income-certificate',
      label: 'Income Certificate from the Tehsildar',
      field: 'hasIncomeCertificate',
      check: holds(
        'hasIncomeCertificate',
        'You have an income certificate.',
        'You did not tick that you have an income certificate.'
      ),
    },
    {
      id: 'household-bracket',
      label: 'Household bracket (AAY or Priority Household)',
      field: 'annualIncome',
      check: () => confirm('Your state food department decides the bracket after checking your documents.'),
    },
  ],
  'scholarship-post-matric': [
    {
      id: 'enrolled',
      label: 'Currently enrolled in a recognised institution',
      field: 'isStudent',
      check: holds('isStudent', 'You marked that you are a student.', 'You did not mark that you are enrolled.'),
    },
    {
      id: 'income',
      label: 'Family income within the limit used by this checker',
      field: 'annualIncome',
      check: maxIncome(250000),
    },
    {
      id: 'category',
      label: 'Social category quota (SC, ST, OBC or EWS)',
      field: 'category',
      check: (p) =>
        ['SC', 'ST', 'OBC', 'EWS'].includes(p.category)
          ? satisfied(`You selected ${p.category}.`)
          : missing('General category students need an EWS certificate.'),
    },
    {
      id: 'marks',
      label: 'Marks in the previous examination (General category)',
      field: null, // nothing in the wizard to change: it never asks for marks
      // Only General category has a marks rule here.
      appliesTo: (p) => p.category === 'General',
      check: () => unknown('This checker does not ask for your marks.'),
    },
    {
      id: 'enrolment-records',
      label: 'Enrolment and certificates verified on the scholarship portal',
      field: 'isStudent',
      check: () => confirm('The institute and the scholarship portal verify these, not this checker.'),
    },
  ],
  'driving-license': [
    {
      id: 'age',
      label: 'At least 18 years old',
      field: 'age',
      check: (p) => {
        const age = toNumber(p.age);
        if (age === null || age <= 0) return unknown('Age is blank.');
        return age >= 18 ? satisfied(`You are ${age}.`) : missing(`You are ${age}.`);
      },
    },
    {
      id: 'learner-licence',
      label: 'Learner Licence held for 30+ days',
      field: 'hasLearnerLicense',
      check: holds(
        'hasLearnerLicense',
        'You ticked that you hold a learner licence for 30+ days.',
        'You did not tick that you hold a learner licence for 30+ days.'
      ),
    },
    {
      id: 'documents',
      label: 'Proof of age and address accepted by the RTO',
      field: 'age',
      check: () => confirm('The RTO checks your original documents at the test slot.'),
    },
  ],
  'udyam-registration': [
    {
      id: 'aadhaar',
      label: 'Aadhaar with mobile number linked',
      field: 'hasAadhaar',
      check: holds('hasAadhaar', 'You have an Aadhaar.', 'You did not tick that you have an Aadhaar.'),
    },
    {
      id: 'pan',
      label: 'PAN Card',
      field: 'hasPan',
      check: holds('hasPan', 'You hold a PAN.', 'You did not tick that you hold a PAN.'),
    },
    {
      id: 'enterprise',
      label: 'You run an enterprise to register',
      field: 'employment',
      check: (p) =>
        p.employment === 'self-employed' || p.employment === 'business'
          ? satisfied('You selected self-employed.')
          : confirm('Your occupation is not self-employed. Udyam is for a business you run, so confirm that.'),
    },
  ],
  passport: [
    {
      id: 'address-proof',
      label: 'Address proof for verification (Aadhaar is the quickest)',
      field: 'hasAadhaar',
      check: holds(
        'hasAadhaar',
        'You have an Aadhaar.',
        'You did not tick Aadhaar. Another address proof such as Voter ID can work.'
      ),
    },
    {
      id: 'citizenship',
      label: 'Indian citizenship',
      field: null,
      check: () => confirm('This checker does not ask about citizenship. The passport office verifies it.'),
    },
    {
      id: 'dob-proof',
      label: 'Date of birth proof',
      field: 'age',
      check: () => confirm('Birth certificate, PAN or marksheet must show your date of birth.'),
    },
  ],
};

/**
 * Criteria for one scheme given the answers. A scheme with no criteria data
 * returns one "unknown" row rather than guessing either way.
 */
export function evaluateCriteria(schemeId, profile = {}) {
  const defs = SCHEME_CRITERIA[schemeId];
  if (!Array.isArray(defs) || defs.length === 0) {
    return [
      {
        id: 'criteria-not-listed',
        label: 'Requirements for this service',
        field: null,
        step: null,
        state: 'unknown',
        detail: 'The requirement list for this service is incomplete here. Check the official source before applying.',
      },
    ];
  }

  return defs
    .filter((def) => !def.appliesTo || def.appliesTo(profile))
    .map((def) => {
      const { state, detail } = def.check(profile);
      return { id: def.id, label: def.label, field: def.field, step: FIELD_STEPS[def.field] || null, state, detail };
    });
}

export function summarizeCriteria(criteria = []) {
  const counts = { satisfied: 0, missing: 0, unknown: 0, confirm: 0 };
  criteria.forEach((c) => {
    if (c.state in counts) counts[c.state] += 1;
  });
  return counts;
}

/**
 * The overall state shown for a scheme. The scheme rules in assessmentStorage
 * stay the source of truth, with two corrections so blank answers are not
 * treated as a "no":
 *  - not matched, but nothing is actually missing and something is unknown -> unknown
 *  - matched, but something is unknown -> conditional
 */
export function resolveStatus(status, criteria = []) {
  const counts = summarizeCriteria(criteria);
  if (status === 'ineligible' && counts.missing === 0 && counts.unknown > 0) return 'unknown';
  if (status === 'eligible' && counts.unknown > 0) return 'conditional';
  return status;
}

export const UNKNOWN_STATUS_REASON =
  'Some answers needed for this scheme are blank or not collected here, so we cannot tell yet. Review your answers or check the official source.';

/** Wizard result row plus its per-criterion breakdown and the resolved status. */
export function applyCriteria(evaluation, profile) {
  const criteria = evaluateCriteria(evaluation.schemeId, profile);
  const status = resolveStatus(evaluation.status, criteria);
  return {
    ...evaluation,
    status,
    reason: status === 'unknown' ? UNKNOWN_STATUS_REASON : evaluation.reason,
    criteria,
  };
}

export const RESULT_STATUS_LABELS = {
  eligible: 'Potentially relevant',
  conditional: 'Potentially relevant, action needed',
  ineligible: 'Not matched on your answers',
  unknown: 'Not enough information',
};

export const ELIGIBILITY_RULES = {
  'birth-certificate': {
    serviceId: 'birth-certificate',
    title: 'Birth Certificate Eligibility Assessment',
    questions: [
      {
        id: 'registered_21_days',
        prompt: 'Was the birth reported to the local registrar or hospital within 21 days?',
        options: [
          { label: 'Yes, within 21 days (Standard processing)', value: 'yes', score: 2 },
          { label: 'Between 21 days and 1 year (Late registration)', value: 'late', score: 1 },
          { label: 'Over 1 year ago (Requires Magistrate order)', value: 'very_late', score: 0 },
        ],
      },
      {
        id: 'has_parent_id',
        prompt: 'Do the parents have valid government photo ID (Aadhaar / Voter ID / Passport)?',
        options: [
          { label: 'Yes, both parents have valid ID', value: 'yes', score: 2 },
          { label: 'Single parent has valid ID', value: 'single', score: 2 },
          { label: 'No valid government ID available', value: 'no', score: 0 },
        ],
      },
      {
        id: 'has_hospital_slip',
        prompt: 'Do you possess the hospital discharge summary or institutional birth slip?',
        options: [
          { label: 'Yes, official hospital record is available', value: 'yes', score: 2 },
          { label: 'Home birth (Requires local village/ward witness affidavit)', value: 'home', score: 1 },
          { label: 'No records available', value: 'no', score: 0 },
        ],
      },
    ],
    evaluate: (answers) => {
      const q1 = answers.registered_21_days;
      const q2 = answers.has_parent_id;
      const q3 = answers.has_hospital_slip;

      if (q2 === 'no') {
        return {
          status: 'ineligible',
          title: 'Prerequisite Identification Missing',
          message: 'At least one parent or legal guardian must provide valid government photo ID to register a birth.',
          actionText: 'Obtain Parent Aadhaar/ID First',
          actionLink: '/services/aadhaar-card',
        };
      }

      if (q1 === 'very_late') {
        return {
          status: 'conditional',
          title: 'Delayed Registration Procedure Required',
          message: 'Birth registrations after 1 year require an affidavit and an order from an Executive Magistrate (Revenue Department).',
          actionText: 'Review Affidavit Requirements',
        };
      }

      return {
        status: 'eligible',
        title: 'You Meet All Standard Criteria!',
        message: 'You have all necessary parent ID proofs and institutional records for direct municipal or Gram Panchayat issuance.',
        actionText: 'Fast-Track Apply Now',
      };
    },
  },

  'driving-license': {
    serviceId: 'driving-license',
    title: 'Driving License Eligibility Assessment',
    questions: [
      {
        id: 'age',
        prompt: 'Are you at least 18 years of age (or 16+ for gearless 50cc scooters)?',
        options: [
          { label: 'Yes, 18 years or older', value: '18_plus', score: 2 },
          { label: '16 to 17 years (Gearless scooter only)', value: 'minor_gearless', score: 1 },
          { label: 'Under 16 years of age', value: 'underage', score: 0 },
        ],
      },
      {
        id: 'learner_license',
        prompt: 'Do you hold an active Learner\'s License (LL)?',
        options: [
          { label: 'Yes, held for more than 30 days', value: 'valid_ll_30_days', score: 2 },
          { label: 'Yes, but received less than 30 days ago', value: 'll_less_30_days', score: 1 },
          { label: 'No, I do not have a Learner\'s License yet', value: 'no_ll', score: 0 },
        ],
      },
      {
        id: 'test_vehicle',
        prompt: 'Will you bring a vehicle of the requested category with valid insurance to the RTO test?',
        options: [
          { label: 'Yes, vehicle and RC/Insurance are ready', value: 'yes', score: 2 },
          { label: 'No, vehicle not yet arranged', value: 'no', score: 1 },
        ],
      },
    ],
    evaluate: (answers) => {
      const q1 = answers.age;
      const q2 = answers.learner_license;

      if (q1 === 'underage') {
        return {
          status: 'ineligible',
          title: 'Minimum Age Requirement Not Met',
          message: 'The Motor Vehicles Act mandates a minimum age of 18 years for regular motor vehicles and 16 years for gearless mopeds.',
        };
      }

      if (q2 === 'no_ll') {
        return {
          status: 'conditional',
          title: 'Learner License Prerequisite Needed',
          message: 'You must first apply for and clear a computer-based traffic rules test to obtain a Learner\'s License.',
          actionText: 'Apply for Learner License First',
          actionLink: 'https://parivahan.gov.in',
        };
      }

      if (q2 === 'll_less_30_days') {
        return {
          status: 'conditional',
          title: 'Mandatory 30-Day Waiting Period Active',
          message: 'Regulations require holding a Learner\'s License for a minimum of 30 days before booking a permanent driving test slot.',
          actionText: 'Wait for 30-Day Milestone',
        };
      }

      return {
        status: 'eligible',
        title: 'Ready for Permanent Driving Test!',
        message: 'You meet age requirements and satisfy the 30-day learner period. You can proceed to slot booking.',
        actionText: 'Book Driving Test Slot',
      };
    },
  },

  'aadhaar-card': {
    serviceId: 'aadhaar-card',
    title: 'Aadhaar Enrollment & Update Criteria',
    questions: [
      {
        id: 'residency',
        prompt: 'Have you resided in India for 182 days or more during the past 12 months?',
        options: [
          { label: 'Yes, resident of India', value: 'resident', score: 2 },
          { label: 'Non-Resident Indian (NRI holding valid passport)', value: 'nri', score: 2 },
          { label: 'Foreign national residing under 182 days', value: 'foreign_visitor', score: 0 },
        ],
      },
      {
        id: 'has_poi_poa',
        prompt: 'Do you have original Proof of Identity (POI) and Proof of Address (POA)?',
        options: [
          { label: 'Yes, original physical documents ready', value: 'yes', score: 2 },
          { label: 'No document in my name (Need Head of Family - HOF verification)', value: 'hof', score: 1 },
          { label: 'No documents or HOF proof available', value: 'no', score: 0 },
        ],
      },
    ],
    evaluate: (answers) => {
      if (answers.residency === 'foreign_visitor') {
        return {
          status: 'ineligible',
          title: 'Residency Threshold Not Met',
          message: 'Aadhaar enrollment is strictly reserved for residents who have stayed 182+ days in India.',
        };
      }

      if (answers.has_poi_poa === 'hof') {
        return {
          status: 'conditional',
          title: 'Eligible via Head of Family (HOF) Mode',
          message: 'You can enroll using Head of Family authentication with ration card or parent Aadhaar consent.',
          actionText: 'Prepare HOF Consent Form',
        };
      }

      return {
        status: 'eligible',
        title: 'Full Enrollment Eligibility Confirmed!',
        message: 'New enrollment is 100% free of cost at all authorized Aadhaar Seva Kendras.',
        actionText: 'Book Kendra Appointment',
      };
    },
  },

  'pan-card': {
    serviceId: 'pan-card',
    title: 'PAN Card Eligibility & Instant Issuance Check',
    questions: [
      {
        id: 'aadhaar_linked',
        prompt: 'Do you have an active Aadhaar card with your mobile number linked for OTP?',
        options: [
          { label: 'Yes, Aadhaar + mobile OTP active (Instant e-PAN eligible)', value: 'instant_otp', score: 2 },
          { label: 'Have Aadhaar, but mobile not linked', value: 'no_otp', score: 1 },
          { label: 'Do not have an Aadhaar card', value: 'no_aadhaar', score: 0 },
        ],
      },
      {
        id: 'existing_pan',
        prompt: 'Do you already hold a PAN card number allocated by the IT Department?',
        options: [
          { label: 'No, this is my first PAN application', value: 'first_time', score: 2 },
          { label: 'Yes, I already have one (Need reprint / correction)', value: 'duplicate', score: 1 },
        ],
      },
    ],
    evaluate: (answers) => {
      if (answers.existing_pan === 'duplicate') {
        return {
          status: 'conditional',
          title: 'Reprint / Correction Service Required',
          message: 'Possessing more than one PAN is illegal under Section 272B. Please apply for a reprint or correction of your existing PAN.',
          actionText: 'Apply for PAN Correction / Reprint',
        };
      }

      if (answers.aadhaar_linked === 'instant_otp') {
        return {
          status: 'eligible',
          title: 'Eligible for 10-Minute Instant Free e-PAN!',
          message: 'Using Aadhaar paperless e-KYC, you can receive your digital PAN PDF in approximately 10 minutes free of cost.',
          actionText: 'Proceed to Instant e-PAN Portal',
        };
      }

      return {
        status: 'conditional',
        title: 'Physical Submission / Non-OTP Route Required',
        message: 'You can still obtain a PAN by submitting physical copies of address and identity proofs to NSDL or UTIITSL.',
        actionText: 'View Physical Document Route',
      };
    },
  },
};

export const getEligibilityRuleForService = (serviceId) => {
  return ELIGIBILITY_RULES[serviceId] || null;
};

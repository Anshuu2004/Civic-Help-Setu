export const APPLICANT_CATEGORIES = [
  { id: 'general', label: 'General Resident Citizen', discountRate: 0, description: 'Standard government statutory fees' },
  { id: 'bpl', label: 'BPL / Antyodaya Ration Card Holder', discountRate: 1.0, description: '100% Fee Exemption under State Welfare Directives' },
  { id: 'senior', label: 'Senior Citizen (60+ Years)', discountRate: 0.5, description: '50% concession on standard processing charges' },
  { id: 'student', label: 'Student / Youth (Under 25)', discountRate: 0.35, description: '35% educational & skill scheme concession' },
  { id: 'pwd', label: 'Person with Disability (PwD / Divyangjan)', discountRate: 1.0, description: '100% fee exemption across all civic services' },
  { id: 'female', label: 'Women Applicant (State Empowerment Scheme)', discountRate: 0.25, description: '25% stamp and administrative fee rebate' }
];

export const PROCESSING_TIERS = [
  { id: 'standard', label: 'Standard Processing', multiplier: 1.0, daysOffset: 0, extraCharge: 0 },
  { id: 'tatkaal', label: 'Expedited / Tatkaal Fast-Track', multiplier: 1.5, daysOffset: -7, extraCharge: 500 },
  { id: 'postal_express', label: 'Speed Post Home Delivery', multiplier: 1.0, daysOffset: -2, extraCharge: 75 }
];

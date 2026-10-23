/**
 * Curated database of common civic application rejection reasons,
 * error severities, and actionable prevention steps across government services.
 */

export const REJECTION_REASONS = [
  {
    id: 'rej-name-mismatch',
    serviceIds: ['pan-card', 'passport', 'aadhaar-update', 'voter-id', 'driving-license'],
    categories: ['Identity', 'Documents', 'Revenue'],
    title: 'Name & Initial Discrepancy Across Documents',
    severity: 'critical', // 'critical' | 'high' | 'medium'
    frequency: '38% of all rejections',
    departmentNotice: 'Spelling mismatch between primary identity proof (Aadhaar/PAN) and educational mark sheet or birth certificate.',
    cause: 'Using abbreviated initials (e.g., "R. K. Sharma" instead of "Rajesh Kumar Sharma") or variations in surname spelling after marriage.',
    prevention: 'Ensure exact character-by-character match across all submitted IDs. If your name changed after marriage or gazette notification, submit the official Gazette Copy or Marriage Certificate along with the application.',
    checklistCheck: 'My name is spelled identically on both my identity and address proofs.'
  },
  {
    id: 'rej-outdated-address-proof',
    serviceIds: ['passport', 'driving-license', 'ration-card', 'voter-id', 'water-connection', 'electricity-meter'],
    categories: ['Identity', 'Documents', 'Municipal'],
    title: 'Utility Bill / Rent Agreement Exceeding Validity Period',
    severity: 'critical',
    frequency: '29% of all rejections',
    departmentNotice: 'Address proof submitted is older than the mandated 3-month threshold or rent agreement is unregistered.',
    cause: 'Submitting electricity or water bills from over 90 days ago, or notarized rent agreements that have expired or lack sub-registrar registration stamps.',
    prevention: 'Always generate the latest utility bill from the official discom/jal board website dated within the last 60 days. For tenants, ensure the rent agreement is active and stamped.',
    checklistCheck: 'My utility bill or proof of residence is dated within the last 90 days.'
  },
  {
    id: 'rej-photo-specs',
    serviceIds: ['passport', 'pan-card', 'driving-license', 'visa'],
    categories: ['Identity', 'Documents'],
    title: 'Passport Photograph Specs Non-Compliance',
    severity: 'high',
    frequency: '22% of all rejections',
    departmentNotice: 'Photograph does not conform to biometric capture standards (shadowed background, side angles, spectacles with reflection).',
    cause: 'Selfies taken at home, tinted glasses, background not pure white/light grey, face occupying less than 70-80% of photo frame.',
    prevention: 'Obtain studio-quality photos (35mm x 45mm for passport) with neutral facial expression, ears clearly visible, without glare on glasses, and with pure white background.',
    checklistCheck: 'My passport photo has a solid white background with ears clearly visible and neutral expression.'
  },
  {
    id: 'rej-missing-self-attestation',
    serviceIds: ['caste-certificate', 'income-certificate', 'birth-certificate', 'ration-card', 'domicile'],
    categories: ['Revenue', 'Certificates', 'Welfare'],
    title: 'Unsigned Photocopies (Missing Self-Attestation)',
    severity: 'high',
    frequency: '18% of all rejections',
    departmentNotice: 'Supporting xerox copies of documents lack physical signature or "Self Attested" endorsement.',
    cause: 'Submitting plain photocopies without manual endorsement across the bottom half of each page.',
    prevention: 'Write "Self Attested" followed by your signature and current date on every single page of supporting photocopies before submission or scanning.',
    checklistCheck: 'All attached document photocopies are signed with "Self Attested" and dated.'
  },
  {
    id: 'rej-dob-document-disparity',
    serviceIds: ['passport', 'pan-card', 'driving-license', 'epfo'],
    categories: ['Identity', 'Documents'],
    title: 'Date of Birth (DOB) Contradiction',
    severity: 'critical',
    frequency: '16% of all rejections',
    departmentNotice: 'Date of birth on Aadhaar/School Leaving Certificate contradicts Birth Certificate.',
    cause: 'Historical discrepancies in school admission records or Aadhaar cards displaying only the birth year (YYYY) rather than DD/MM/YYYY.',
    prevention: 'Update your Aadhaar card with complete DD/MM/YYYY DOB first using your Municipal Birth Certificate before applying for Passport or Driving License.',
    checklistCheck: 'My date of birth (Day, Month, Year) matches exactly across all records.'
  },
  {
    id: 'rej-jurisdiction-mismatch',
    serviceIds: ['caste-certificate', 'income-certificate', 'domicile', 'ration-card'],
    categories: ['Revenue', 'Certificates', 'Welfare'],
    title: 'Filing Under Incorrect Sub-Division / Tehsildar Jurisdiction',
    severity: 'medium',
    frequency: '14% of all rejections',
    departmentNotice: 'Application routed to incorrect circle office or ward administrative authority.',
    cause: 'Selecting the nearest government office rather than the designated revenue circle mapped to your residential pincode.',
    prevention: 'Check your municipal ward or taluk jurisdiction map on the state e-District portal before selecting the issuing office.',
    checklistCheck: 'I have verified that my residential pin code falls under this designated revenue office.'
  }
];

/**
 * Returns rejection reasons matching a service ID or broad category
 */
export const getRejectionReasonsForService = (serviceId, category = '') => {
  if (!serviceId) return REJECTION_REASONS;
  
  const directMatches = REJECTION_REASONS.filter(r => 
    r.serviceIds.includes(serviceId)
  );

  const categoryMatches = REJECTION_REASONS.filter(r => 
    !r.serviceIds.includes(serviceId) && 
    category && 
    r.categories.some(c => c.toLowerCase() === category.toLowerCase())
  );

  const combined = [...directMatches, ...categoryMatches];
  return combined.length > 0 ? combined : REJECTION_REASONS.slice(0, 3);
};

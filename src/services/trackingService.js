const STORAGE_KEY = 'civicbridge_applications';

const DEFAULT_APPLICATIONS = [
  {
    id: 'SRV-98234710',
    serviceId: 'income-certificate',
    serviceName: 'Income Certificate',
    category: 'Finance',
    applicantName: 'Ramesh Patel',
    appliedDate: 'Oct 12, 2026',
    estimatedCompletion: 'Oct 22, 2026',
    status: 'in-progress',
    currentStageIndex: 1,
    stages: [
      {
        title: 'Application Submitted',
        description: 'Application and supporting income documents received.',
        timestamp: 'Oct 12, 2026 • 10:15 AM',
        completed: true,
      },
      {
        title: 'Document & Revenue Verification',
        description: 'Tahsildar office is verifying salary slips and revenue records.',
        timestamp: 'Oct 14, 2026 • 03:30 PM',
        completed: false,
        inProgress: true,
      },
      {
        title: 'Digital Signature & Approval',
        description: 'Revenue Inspector approval and digital seal generation.',
        timestamp: 'Pending verification',
        completed: false,
      },
      {
        title: 'Certificate Issuance',
        description: 'Final certificate ready for direct citizen download.',
        timestamp: 'Estimated Oct 22',
        completed: false,
      },
    ],
  },
  {
    id: 'SRV-41829304',
    serviceId: 'driving-license',
    serviceName: 'Driving License',
    category: 'Transport',
    applicantName: 'Sunita Sharma',
    appliedDate: 'Sep 24, 2026',
    estimatedCompletion: 'Oct 10, 2026',
    status: 'completed',
    currentStageIndex: 3,
    stages: [
      {
        title: 'Application & Learner Pass Recorded',
        description: 'Learner license validity authenticated at RTO portal.',
        timestamp: 'Sep 24, 2026 • 11:00 AM',
        completed: true,
      },
      {
        title: 'Driving Skill Test Passed',
        description: 'Track examination cleared with RTO motor inspector.',
        timestamp: 'Oct 02, 2026 • 02:45 PM',
        completed: true,
      },
      {
        title: 'Smart Card Endorsement',
        description: 'Biometric chip encoded and approved by RTO officer.',
        timestamp: 'Oct 06, 2026 • 04:10 PM',
        completed: true,
      },
      {
        title: 'Dispatched via Speed Post',
        description: 'Physical smart card dispatched. Tracking: SP-IN948271.',
        timestamp: 'Oct 09, 2026 • 09:20 AM',
        completed: true,
      },
    ],
  },
  {
    id: 'SRV-77319482',
    serviceId: 'birth-certificate',
    serviceName: 'Birth Certificate',
    category: 'Certificates',
    applicantName: 'Aarav Kumar',
    appliedDate: 'Oct 19, 2026',
    estimatedCompletion: 'Nov 02, 2026',
    status: 'submitted',
    currentStageIndex: 0,
    stages: [
      {
        title: 'Application Submitted',
        description: 'Institutional birth record uploaded from registrar registry.',
        timestamp: 'Oct 19, 2026 • 09:00 AM',
        completed: true,
      },
      {
        title: 'Municipal Record Matching',
        description: 'Verification with hospital birth registers.',
        timestamp: 'Scheduled for Oct 23',
        completed: false,
        inProgress: true,
      },
      {
        title: 'Registrar Authentication',
        description: 'Final sign-off by Municipal Health Officer.',
        timestamp: 'Pending verification',
        completed: false,
      },
      {
        title: 'QR-Verified Certificate Generation',
        description: 'Digitally signed certificate issued.',
        timestamp: 'Estimated Nov 02',
        completed: false,
      },
    ],
  },
];

export const getApplications = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_APPLICATIONS));
      return DEFAULT_APPLICATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse applications from storage', err);
    return DEFAULT_APPLICATIONS;
  }
};

export const getApplicationById = (searchId) => {
  if (!searchId) return null;
  const clean = searchId.trim().toUpperCase();
  const all = getApplications();
  return all.find((app) => app.id.toUpperCase() === clean) || null;
};

export const createApplication = ({ serviceId, serviceName, category, applicantName, aadhaarId }) => {
  const all = getApplications();
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
  const newId = `SRV-${randomSuffix}`;

  const estDate = new Date();
  estDate.setDate(estDate.getDate() + 15);
  const estDateStr = estDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const newApp = {
    id: newId,
    serviceId: serviceId || 'custom-service',
    serviceName: serviceName || 'Civic Service Request',
    category: category || 'General',
    applicantName: applicantName || 'Citizen Applicant',
    appliedDate: dateStr,
    estimatedCompletion: estDateStr,
    status: 'submitted',
    currentStageIndex: 0,
    aadhaarMasked: aadhaarId ? `XXXX-XXXX-${aadhaarId.slice(-4)}` : 'XXXX-XXXX-8921',
    stages: [
      {
        title: 'Application Submitted',
        description: 'Application submitted digitally via Civic Help Setu Fast-Track.',
        timestamp: `${dateStr} • Just now`,
        completed: true,
      },
      {
        title: 'Document & Identity Verification',
        description: 'Verifying submitted identity proof and prerequisite documents.',
        timestamp: 'Estimated within 3 business days',
        completed: false,
        inProgress: true,
      },
      {
        title: 'Competent Authority Assessment',
        description: 'Departmental review and approval clearance.',
        timestamp: 'Pending document check',
        completed: false,
      },
      {
        title: 'Final Certificate / Service Issuance',
        description: 'Digital certificate or dispatch tracking notification.',
        timestamp: `Target completion by ${estDateStr}`,
        completed: false,
      },
    ],
  };

  const updated = [newApp, ...all];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newApp;
};

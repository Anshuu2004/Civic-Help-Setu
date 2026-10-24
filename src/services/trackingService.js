const STORAGE_KEY = 'civicbridge_applications';

export const STATUS_META = {
  submitted: { label: 'Submitted', color: '#94a3b8', background: 'rgba(148, 163, 184, 0.2)' },
  'in-progress': { label: 'In Progress', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.2)' },
  'action-required': { label: 'Action Required', color: '#ef4444', background: 'rgba(239, 68, 68, 0.2)' },
  completed: { label: 'Completed', color: '#10b981', background: 'rgba(16, 185, 129, 0.2)' },
};

export const DEFAULT_STATUS = 'submitted';

// Anything we do not recognise is shown as Submitted.
export const normalizeStatus = (status) =>
  Object.prototype.hasOwnProperty.call(STATUS_META, status) ? status : DEFAULT_STATUS;

export const getStatusMeta = (status) => STATUS_META[normalizeStatus(status)];

// Stage 0 is the submission itself, stage 1 is where review happens.
const REVIEW_STAGE_INDEX = 1;

/**
 * The only place that turns a status into stage flags.
 * Stages before the current one are completed, the current one is
 * in progress or needs action, and the rest stay pending.
 */
export const buildStages = (status, stages = []) => {
  const safeStatus = normalizeStatus(status);
  const list = Array.isArray(stages) ? stages : [];
  return list.map((stage, idx) => {
    const rest = { ...stage };
    delete rest.completed;
    delete rest.inProgress;
    delete rest.actionRequired;
    let completed = false;
    let inProgress = false;
    let actionRequired = false;

    if (safeStatus === 'completed') {
      completed = true;
    } else if (idx < REVIEW_STAGE_INDEX) {
      completed = true;
    } else if (idx === REVIEW_STAGE_INDEX) {
      inProgress = safeStatus === 'in-progress';
      actionRequired = safeStatus === 'action-required';
    }
    return { ...rest, completed, inProgress, actionRequired };
  });
};

export const getCurrentStageIndex = (status, stageCount = 4) => {
  const last = Math.max(stageCount - 1, 0);
  const safeStatus = normalizeStatus(status);
  if (safeStatus === 'completed') return last;
  if (safeStatus === 'submitted') return 0;
  return Math.min(REVIEW_STAGE_INDEX, last);
};

export const NOT_AVAILABLE = 'Not available';

export const formatDisplayDate = (value) => {
  if (typeof value !== 'string') return NOT_AVAILABLE;
  const text = value.trim();
  if (!text || /^(invalid date|undefined|null|nan)$/i.test(text)) return NOT_AVAILABLE;
  return text;
};

const normalizeApplication = (app) => {
  const status = normalizeStatus(app?.status);
  const stages = buildStages(status, app?.stages);
  return {
    ...app,
    status,
    stages,
    currentStageIndex: getCurrentStageIndex(status, stages.length || 4),
  };
};

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
    notes: [
      { id: 'n1', text: 'Submitted salary slips from employer via Tahsildar portal.', date: 'Oct 12, 2026 • 10:30 AM' },
      { id: 'n2', text: 'Revenue inspector scheduled site verification visit.', date: 'Oct 15, 2026 • 02:00 PM' },
    ],
    linkedDocs: [
      { id: 'd1', name: 'Salary_Slip_Aug2026.pdf', size: '1.2 MB', linkedAt: 'Oct 12, 2026' },
      { id: 'd2', name: 'Aadhaar_Card_Copy.pdf', size: '850 KB', linkedAt: 'Oct 12, 2026' },
    ],
    pendingAction: null,
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
    notes: [
      { id: 'n3', text: 'Track test cleared with zero negative marks on 8-track.', date: 'Oct 02, 2026 • 03:15 PM' },
    ],
    linkedDocs: [
      { id: 'd3', name: 'Learner_License_Extract.pdf', size: '540 KB', linkedAt: 'Sep 24, 2026' },
      { id: 'd4', name: 'Medical_Certificate_Form1A.pdf', size: '720 KB', linkedAt: 'Sep 24, 2026' },
    ],
    pendingAction: null,
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
    status: 'action-required',
    currentStageIndex: 1,
    notes: [
      { id: 'n4', text: 'Hospital discharge certificate requires clearer stamp copy.', date: 'Oct 20, 2026 • 11:30 AM' },
    ],
    linkedDocs: [
      { id: 'd5', name: 'Hospital_Discharge_Summary.pdf', size: '920 KB', linkedAt: 'Oct 19, 2026' },
    ],
    pendingAction: {
      title: 'Upload Clearer Hospital Birth Record',
      description: 'The municipal registrar rejected hospital discharge slip due to illegible physician seal. Please upload a re-scanned copy.',
      deadline: 'Oct 28, 2026',
      documentRequired: 'Hospital Birth Card (Seal visible)',
    },
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
        timestamp: 'Action Needed: Re-upload seal copy',
        completed: false,
        actionRequired: true,
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
      return DEFAULT_APPLICATIONS.map(normalizeApplication);
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_APPLICATIONS.map(normalizeApplication);
    // Older saved data can have flags that disagree with the status, so fix them on read.
    return parsed.filter((a) => a && typeof a.id === 'string').map(normalizeApplication);
  } catch (err) {
    console.error('Failed to parse applications from storage', err);
    return DEFAULT_APPLICATIONS.map(normalizeApplication);
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
    notes: [
      { id: `n-${Date.now()}`, text: 'Application initiated digitally via Civic Help Setu.', date: `${dateStr} • Just now` },
    ],
    linkedDocs: [],
    pendingAction: null,
    stages: buildStages('submitted', [
      {
        title: 'Application Submitted',
        description: 'Application submitted digitally via Civic Help Setu Fast-Track.',
        timestamp: `${dateStr} • Just now`,
      },
      {
        title: 'Document & Identity Verification',
        description: 'Verifying submitted identity proof and prerequisite documents.',
        timestamp: 'Estimated within 3 business days',
      },
      {
        title: 'Competent Authority Assessment',
        description: 'Departmental review and approval clearance.',
        timestamp: 'Pending document check',
      },
      {
        title: 'Final Certificate / Service Issuance',
        description: 'Digital certificate or dispatch tracking notification.',
        timestamp: `Target completion by ${estDateStr}`,
      },
    ]),
  };

  const updated = [newApp, ...all];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newApp;
};

export const addManualApplication = ({
  referenceId,
  serviceName,
  category = 'General',
  appliedDate,
  estimatedCompletion,
  status = 'submitted',
  initialNote = '',
  applicantName = 'Citizen Applicant',
}) => {
  const all = getApplications();
  const cleanId = referenceId.trim().toUpperCase();

  const safeStatus = normalizeStatus(status);
  const stages = buildStages(safeStatus, [
    {
      title: 'Application Submitted',
      description: 'Submitted at district portal / physical center.',
      timestamp: appliedDate || 'Submitted',
    },
    {
      title: 'Document Verification',
      description: 'Scrutiny of applicant credentials and attachments.',
      timestamp: safeStatus === 'submitted' ? 'Pending initiation' : 'In review',
    },
    {
      title: 'Departmental Processing',
      description: 'Officer evaluation and statutory approvals.',
      timestamp: safeStatus === 'completed' ? 'Cleared' : 'Pending prior stages',
    },
    {
      title: 'Final Issuance / Dispatch',
      description: 'Ready for collection, digital download, or courier delivery.',
      timestamp: safeStatus === 'completed' ? 'Issued' : (estimatedCompletion ? `Est: ${estimatedCompletion}` : 'Pending'),
    },
  ]);

  const currentStageIndex = getCurrentStageIndex(safeStatus, stages.length);

  const newApp = {
    id: cleanId,
    serviceId: cleanId.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    serviceName: serviceName.trim(),
    category,
    applicantName,
    appliedDate: appliedDate || 'Recent',
    estimatedCompletion: estimatedCompletion || 'Within 15 days',
    status: safeStatus,
    currentStageIndex,
    notes: initialNote
      ? [{ id: `n-${Date.now()}`, text: initialNote, date: `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` }]
      : [],
    linkedDocs: [],
    pendingAction: safeStatus === 'action-required' ? {
      title: 'Additional Documentation or Clarification Needed',
      description: 'Department requested supplementary records for reference ' + cleanId,
      deadline: 'Within 7 business days',
      documentRequired: 'Supplementary Proof Document',
    } : null,
    stages,
  };

  const updated = [newApp, ...all.filter((a) => a.id.toUpperCase() !== cleanId)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newApp;
};

export const addNoteToApplication = (appId, noteText) => {
  const all = getApplications();
  const target = all.find((a) => a.id.toUpperCase() === appId.toUpperCase());
  if (!target) return null;

  const newNote = {
    id: `n-${Date.now()}`,
    text: noteText.trim(),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };

  target.notes = [...(target.notes || []), newNote];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return target;
};

export const linkDocumentToApplication = (appId, doc) => {
  const all = getApplications();
  const target = all.find((a) => a.id.toUpperCase() === appId.toUpperCase());
  if (!target) return null;

  const newDoc = {
    id: `doc-${Date.now()}`,
    name: doc.name || 'Citizen_Attachment.pdf',
    size: doc.size || '750 KB',
    linkedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  };

  target.linkedDocs = [...(target.linkedDocs || []), newDoc];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return target;
};

export const unlinkDocumentFromApplication = (appId, docId) => {
  const all = getApplications();
  const target = all.find((a) => a.id.toUpperCase() === appId.toUpperCase());
  if (!target) return null;

  target.linkedDocs = (target.linkedDocs || []).filter((d) => d.id !== docId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return target;
};

export const resolveApplicationPendingAction = (appId, resolutionNote = '') => {
  const all = getApplications();
  const target = all.find((a) => a.id.toUpperCase() === appId.toUpperCase());
  if (!target) return null;

  // Already resolved (or never needed action): nothing to change.
  if (target.status !== 'action-required' && !target.pendingAction) return target;

  target.pendingAction = null;
  target.status = 'in-progress';
  target.stages = buildStages('in-progress', target.stages);
  target.currentStageIndex = getCurrentStageIndex('in-progress', target.stages.length);
  if (target.stages[REVIEW_STAGE_INDEX]) {
    target.stages[REVIEW_STAGE_INDEX].timestamp = 'Action resolved • Resumed verification';
  }

  if (resolutionNote) {
    target.notes = [
      ...(target.notes || []),
      {
        id: `n-${Date.now()}`,
        text: `Action Resolved: ${resolutionNote}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
    ];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return target;
};

export const getTrackingMetrics = () => {
  const all = getApplications();
  return {
    total: all.length,
    inProgress: all.filter((a) => a.status === 'in-progress').length,
    actionRequired: all.filter((a) => a.status === 'action-required').length,
    completed: all.filter((a) => a.status === 'completed').length,
    submitted: all.filter((a) => a.status === 'submitted').length,
  };
};

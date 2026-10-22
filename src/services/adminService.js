import { MOCK_SERVICES } from '../data/services';

const SERVICES_KEY = 'civicbridge_custom_services';
const REPORTS_KEY = 'civicbridge_error_reports';
const AUDIT_LOGS_KEY = 'civicbridge_audit_logs';
const USERS_KEY = 'civicbridge_rbac_users';
const SUBMISSIONS_KEY = 'civicbridge_service_submissions';

const DEFAULT_REPORTS = [
  {
    id: 'rep-101',
    serviceId: 'birth-certificate',
    serviceName: 'Birth Certificate',
    issueType: 'Broken URL / 404 Link',
    description: 'The state portal redirect for municipal birth registration in Karnataka returns 404.',
    reporterEmail: 'citizen.karan@gmail.com',
    createdAt: '2 hours ago',
    status: 'pending',
  },
  {
    id: 'rep-102',
    serviceId: 'driving-license',
    serviceName: 'Driving License',
    issueType: 'Outdated Fees',
    description: 'RTO revised smart card issuance charges to ₹300 starting last month.',
    reporterEmail: 'meera.s@outlook.com',
    createdAt: '1 day ago',
    status: 'pending',
  },
  {
    id: 'rep-103',
    serviceId: 'pan-card',
    serviceName: 'PAN Card',
    issueType: 'Missing Document Step',
    description: 'Minor PAN applications now require Form 49A signed by legal guardian.',
    reporterEmail: 'taxpayer.dev@gmail.com',
    createdAt: '3 days ago',
    status: 'pending',
  },
];

const DEFAULT_USERS = [
  { id: 'usr-1', username: 'SuperAdmin', email: 'admin@civicbridge.setu', role: 'admin', joinedAt: '2026-09-01' },
  { id: 'usr-2', username: 'PriyaSharma', email: 'priya.moderator@delhi.gov.in', role: 'moderator', joinedAt: '2026-09-15' },
  { id: 'usr-3', username: 'AmitEditor', email: 'amit.verma@civic.org', role: 'editor', joinedAt: '2026-10-02' },
  { id: 'usr-4', username: 'CitizenRamesh', email: 'ramesh.patel@gmail.com', role: 'citizen', joinedAt: '2026-10-10' },
  { id: 'usr-5', username: 'SnehaReddy', email: 'sneha.reddy@gmail.com', role: 'citizen', joinedAt: '2026-10-18' },
];

const DEFAULT_AUDIT_LOGS = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    action: 'SERVICE_UPDATED',
    actor: 'SuperAdmin',
    target: 'Birth Certificate',
    details: 'Updated processing fees and state municipal links.',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    action: 'ROLE_CHANGED',
    actor: 'SuperAdmin',
    target: 'PriyaSharma (usr-2)',
    details: 'Promoted user from Editor to Moderator.',
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    action: 'REPORT_RESOLVED',
    actor: 'PriyaSharma',
    target: 'rep-102 (Driving License)',
    details: 'Verified RTO fee change with Parivahan portal and published correction.',
  },
];

const DEFAULT_SUBMISSIONS = [
  {
    id: 'sub-201',
    name: 'Senior Citizen Identity Card',
    category: 'Identity',
    shortDescription: 'Official identity and concession card for citizens aged 60 and above.',
    processingTime: '7 - 14 days',
    fees: 'Free of Cost',
    officialUrl: 'https://socialjustice.gov.in',
    submittedBy: 'AmitEditor',
    contributorEmail: 'amit.verma@civic.org',
    status: 'pending',
    submittedAt: '2026-10-20',
  },
  {
    id: 'sub-202',
    name: 'Disability Certificate & UDID Card',
    category: 'Welfare',
    shortDescription: 'Unique ID for Persons with Disabilities providing access to welfare schemes.',
    processingTime: '15 - 30 days',
    fees: 'Free of Cost',
    officialUrl: 'https://www.swavlambancard.gov.in',
    submittedBy: 'CitizenRamesh',
    contributorEmail: 'ramesh.patel@gmail.com',
    status: 'pending',
    submittedAt: '2026-10-21',
  },
];

export const getAdminServices = () => {
  try {
    const raw = localStorage.getItem(SERVICES_KEY);
    const custom = raw ? JSON.parse(raw) : [];
    const base = [...MOCK_SERVICES];
    const customIds = new Set(custom.map((c) => c.id));
    const merged = base.filter((b) => !customIds.has(b.id)).concat(custom);
    return merged;
  } catch (err) {
    console.error('Failed to load admin services', err);
    return MOCK_SERVICES;
  }
};

export const saveAdminService = (serviceData, actorName = 'SuperAdmin') => {
  try {
    const raw = localStorage.getItem(SERVICES_KEY);
    const custom = raw ? JSON.parse(raw) : [];

    let updated;
    const isEdit = serviceData.id && custom.some((s) => s.id === serviceData.id);

    if (isEdit) {
      updated = custom.map((s) => (s.id === serviceData.id ? { ...s, ...serviceData } : s));
    } else {
      const id =
        serviceData.id ||
        serviceData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newService = {
        ...serviceData,
        id,
        lastVerified: new Date().toISOString().split('T')[0],
      };
      updated = [newService, ...custom];
    }

    localStorage.setItem(SERVICES_KEY, JSON.stringify(updated));

    addAuditLog({
      action: isEdit ? 'SERVICE_UPDATED' : 'SERVICE_CREATED',
      actor: actorName,
      target: serviceData.name,
      details: isEdit ? 'Modified service fields and source references.' : 'Created new service catalog entry.',
    });

    return getAdminServices();
  } catch (err) {
    console.error('Failed to save service', err);
    return getAdminServices();
  }
};

export const deleteAdminService = (id, actorName = 'SuperAdmin') => {
  try {
    const raw = localStorage.getItem(SERVICES_KEY);
    const custom = raw ? JSON.parse(raw) : [];
    const target = custom.find((s) => s.id === id);
    const updated = custom.filter((s) => s.id !== id);
    localStorage.setItem(SERVICES_KEY, JSON.stringify(updated));

    addAuditLog({
      action: 'SERVICE_DELETED',
      actor: actorName,
      target: target?.name || id,
      details: `Service entry ${id} permanently removed from directory.`,
    });

    return getAdminServices();
  } catch (err) {
    console.error('Failed to delete service', err);
    return getAdminServices();
  }
};

export const getReports = () => {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(DEFAULT_REPORTS));
      return DEFAULT_REPORTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load error reports', err);
    return DEFAULT_REPORTS;
  }
};

export const submitErrorReport = ({ serviceId, serviceName, issueType, description, reporterEmail }) => {
  const current = getReports();
  const newReport = {
    id: `rep-${Date.now()}`,
    serviceId: serviceId || 'general',
    serviceName: serviceName || 'General Platform',
    issueType: issueType || 'Incorrect Information',
    description: description || 'User reported an inaccuracy in this guide.',
    reporterEmail: reporterEmail || 'anonymous.citizen@civicbridge.org',
    createdAt: 'Just now',
    status: 'pending',
  };
  const updated = [newReport, ...current];
  localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  return updated;
};

export const resolveReport = (id, resolution = 'Verified and updated', actorName = 'SuperAdmin') => {
  const current = getReports();
  const updated = current.map((r) =>
    r.id === id ? { ...r, status: 'resolved', resolutionNotes: resolution } : r
  );
  localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));

  addAuditLog({
    action: 'REPORT_RESOLVED',
    actor: actorName,
    target: id,
    details: `Resolved report with notes: "${resolution}"`,
  });

  return updated;
};

export const dismissReport = (id) => {
  const current = getReports();
  const updated = current.filter((r) => r.id !== id);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  return updated;
};

/* --- AUDIT LOGS --- */
export const getAuditLogs = () => {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_KEY);
    if (!raw) {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(DEFAULT_AUDIT_LOGS));
      return DEFAULT_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_AUDIT_LOGS;
  }
};

export const addAuditLog = ({ action, actor = 'SuperAdmin', target = '', details = '' }) => {
  const logs = getAuditLogs();
  const newLog = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action,
    actor,
    target,
    details,
  };
  logs.unshift(newLog);
  try {
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs.slice(0, 150))); // Keep last 150
  } catch (err) {
    console.error('Failed to save audit log:', err);
  }
  return logs;
};

/* --- USER RBAC ROLE MANAGEMENT --- */
export const getUserList = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
};

export const updateUserRole = (userId, newRole, customPermissions = {}, actorName = 'SuperAdmin') => {
  const users = getUserList();
  const updated = users.map((u) =>
    u.id === userId ? { ...u, role: newRole, permissions: customPermissions } : u
  );
  localStorage.setItem(USERS_KEY, JSON.stringify(updated));

  const targetUser = users.find((u) => u.id === userId);
  addAuditLog({
    action: 'ROLE_CHANGED',
    actor: actorName,
    target: `${targetUser?.username || userId} (${userId})`,
    details: `Changed role to ${newRole.toUpperCase()}.`,
  });

  return updated;
};

/* --- COMMUNITY SUBMISSION REVIEW QUEUE --- */
export const getServiceSubmissions = () => {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(DEFAULT_SUBMISSIONS));
      return DEFAULT_SUBMISSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SUBMISSIONS;
  }
};

export const approveServiceSubmission = (submissionId, reviewNotes = '', actorName = 'SuperAdmin') => {
  const submissions = getServiceSubmissions();
  const target = submissions.find((s) => s.id === submissionId);
  if (!target) return submissions;

  // Publish to custom services
  saveAdminService(
    {
      name: target.name,
      category: target.category,
      shortDescription: target.shortDescription,
      processingTime: target.processingTime,
      fees: target.fees,
      officialSources: [{ name: 'Government Official Portal', url: target.officialUrl, verified: true }],
      steps: [{ title: 'Online Registration', description: 'Apply via the official portal link.' }],
      documents: ['Aadhaar Card', 'Age/Address Proof'],
    },
    actorName
  );

  const updated = submissions.map((s) =>
    s.id === submissionId ? { ...s, status: 'approved', reviewNotes } : s
  );
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));

  addAuditLog({
    action: 'SUBMISSION_APPROVED',
    actor: actorName,
    target: target.name,
    details: `Approved community submission and published to live directory.`,
  });

  return updated;
};

export const rejectServiceSubmission = (submissionId, reviewNotes = '', actorName = 'SuperAdmin') => {
  const submissions = getServiceSubmissions();
  const target = submissions.find((s) => s.id === submissionId);
  const updated = submissions.map((s) =>
    s.id === submissionId ? { ...s, status: 'rejected', reviewNotes } : s
  );
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));

  addAuditLog({
    action: 'SUBMISSION_REJECTED',
    actor: actorName,
    target: target?.name || submissionId,
    details: `Rejected submission: "${reviewNotes}"`,
  });

  return updated;
};

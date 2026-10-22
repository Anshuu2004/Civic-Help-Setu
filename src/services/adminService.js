import { MOCK_SERVICES } from '../data/services';

const SERVICES_KEY = 'civicbridge_custom_services';
const REPORTS_KEY = 'civicbridge_error_reports';

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

export const getAdminServices = () => {
  try {
    const raw = localStorage.getItem(SERVICES_KEY);
    const custom = raw ? JSON.parse(raw) : [];
    // Overlay custom services onto mock services
    const base = [...MOCK_SERVICES];
    const customIds = new Set(custom.map((c) => c.id));
    const merged = base.filter((b) => !customIds.has(b.id)).concat(custom);
    return merged;
  } catch (err) {
    console.error('Failed to load admin services', err);
    return MOCK_SERVICES;
  }
};

export const saveAdminService = (serviceData) => {
  try {
    const raw = localStorage.getItem(SERVICES_KEY);
    const custom = raw ? JSON.parse(raw) : [];

    let updated;
    if (serviceData.id && custom.some((s) => s.id === serviceData.id)) {
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
    return getAdminServices();
  } catch (err) {
    console.error('Failed to save service', err);
    return getAdminServices();
  }
};

export const deleteAdminService = (id) => {
  try {
    const raw = localStorage.getItem(SERVICES_KEY);
    const custom = raw ? JSON.parse(raw) : [];
    const updated = custom.filter((s) => s.id !== id);
    localStorage.setItem(SERVICES_KEY, JSON.stringify(updated));
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

export const resolveReport = (id, resolution = 'Verified and updated') => {
  const current = getReports();
  const updated = current.map((r) =>
    r.id === id ? { ...r, status: 'resolved', resolutionNotes: resolution } : r
  );
  localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  return updated;
};

export const dismissReport = (id) => {
  const current = getReports();
  const updated = current.filter((r) => r.id !== id);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  return updated;
};

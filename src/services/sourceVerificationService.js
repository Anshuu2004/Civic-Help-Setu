/**
 * Source Verification Service: Normalizes, audits, and formats official government
 * sources and verification timestamps for civic services.
 */

const GOV_DOMAIN_PATTERNS = [
  /\.gov\.in$/i,
  /\.nic\.in$/i,
  /\.gov$/i,
  /\.ac\.in$/i,
  /\.edu\.in$/i,
  /\.org\.in$/i,
];

/**
 * Parses and formats an ISO date string into a consistent, readable format
 * e.g. "2023-10-01" -> "October 1, 2023"
 * @param {string|Date|null|undefined} dateInput
 * @returns {string|null}
 */
export const formatVerificationDate = (dateInput) => {
  if (!dateInput) return null;

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC', // Ensure deterministic rendering across timezones
    });
  } catch {
    return null;
  }
};

/**
 * Calculates verification freshness status
 * @param {string|Date|null} lastVerifiedDate
 * @returns {{ status: 'recent'|'standard'|'overdue'|'unverified', label: string, color: string, badgeBg: string }}
 */
export const getVerificationFreshness = (lastVerifiedDate) => {
  if (!lastVerifiedDate) {
    return {
      status: 'unverified',
      label: 'Audit Due',
      color: 'var(--text-tertiary, #94a3b8)',
      badgeBg: 'rgba(148, 163, 184, 0.12)',
    };
  }

  const date = new Date(lastVerifiedDate);
  if (isNaN(date.getTime())) {
    return {
      status: 'unverified',
      label: 'Audit Due',
      color: 'var(--text-tertiary, #94a3b8)',
      badgeBg: 'rgba(148, 163, 184, 0.12)',
    };
  }

  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 90) {
    return {
      status: 'recent',
      label: 'Verified Fresh',
      color: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
    };
  } else if (diffDays <= 365) {
    return {
      status: 'standard',
      label: 'Govt. Verified',
      color: '#3b82f6',
      badgeBg: 'rgba(59, 130, 246, 0.15)',
    };
  } else {
    return {
      status: 'overdue',
      label: 'Annual Audit Due',
      color: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
    };
  }
};

/**
 * Validates and inspects an official source object
 * @param {Object} source
 * @returns {{ isValid: boolean, isGovDomain: boolean, domain: string, cleanUrl: string, name: string }}
 */
export const inspectOfficialSource = (source) => {
  if (!source || typeof source !== 'object') {
    return {
      isValid: false,
      isGovDomain: false,
      domain: '',
      cleanUrl: '',
      name: 'Official Resource',
    };
  }

  const name = (source.name || 'Official Portal').trim();
  const rawUrl = (source.url || '').trim();

  let domain = '';
  let isValid = false;

  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      isValid = true;
      domain = parsed.hostname.toLowerCase();
    }
  } catch {
    isValid = false;
  }

  const isGovDomain = GOV_DOMAIN_PATTERNS.some((pattern) => pattern.test(domain));

  return {
    isValid,
    isGovDomain,
    domain,
    cleanUrl: isValid ? rawUrl : '',
    name,
    verified: Boolean(source.verified),
    lastVerified: formatVerificationDate(source.lastVerified),
  };
};

/**
 * Normalizes service sources and returns verified metadata
 * @param {Object} service
 * @returns {{ sources: Array, formattedLastVerified: string|null, freshness: Object, hasSources: boolean }}
 */
export const getServiceSourceMetadata = (service = {}) => {
  if (!service) {
    return {
      sources: [],
      formattedLastVerified: null,
      freshness: getVerificationFreshness(null),
      hasSources: false,
    };
  }

  const rawSources = Array.isArray(service.officialSources) ? service.officialSources : [];
  const sources = rawSources
    .map((src) => inspectOfficialSource(src))
    .filter((src) => src.isValid);

  const formattedLastVerified = formatVerificationDate(service.lastVerified);
  const freshness = getVerificationFreshness(service.lastVerified);

  return {
    sources,
    formattedLastVerified,
    freshness,
    hasSources: sources.length > 0,
  };
};

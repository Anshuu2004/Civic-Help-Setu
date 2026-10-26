// Pure helpers for the "Nearby offices" location-permission flow (#171).
// Kept free of React and of direct geolocation calls so every outcome is testable.

export const LOCATION_DENIED_KEY = 'civicbridge_location_denied';

export const LOCATION_STATUS = {
  IDLE: 'idle',
  REQUESTING: 'requesting',
  DENIED: 'denied',
  UNSUPPORTED: 'unsupported',
  UNAVAILABLE: 'unavailable',
  TIMEOUT: 'timeout',
};

const FAILURE_COPY = {
  denied: {
    title: 'Location access is blocked',
    message:
      'We will not ask again in this session. To use GPS later, allow location for this site in your browser settings.',
  },
  unsupported: {
    title: 'This browser cannot share location',
    message: 'Your browser does not support location access, so GPS sorting is not available here.',
  },
  unavailable: {
    title: 'Could not work out your location',
    message: 'Your device could not provide a position right now. Check that location services are on, then try again.',
  },
  timeout: {
    title: 'Location request timed out',
    message: 'Finding your position took too long. You can try again, or search manually instead.',
  },
};

/** Maps an error kind from requestUserCoordinates() to a status; unknown kinds count as unavailable. */
export const statusFromErrorKind = (kind) => {
  if (kind === 'denied') return LOCATION_STATUS.DENIED;
  if (kind === 'unsupported') return LOCATION_STATUS.UNSUPPORTED;
  if (kind === 'timeout') return LOCATION_STATUS.TIMEOUT;
  return LOCATION_STATUS.UNAVAILABLE;
};

/** Title and message for a failure status, or null for non-failure statuses. */
export const getLocationFailureCopy = (status) => FAILURE_COPY[status] || null;

/**
 * Whether the explicit "share my location" button may trigger the browser prompt.
 * permissionState is the Permissions API result ('granted' | 'prompt' | 'denied') or 'unknown'.
 * After a denial we never prompt again while the browser still reports it as denied;
 * when the browser cannot tell us (unknown), the user must confirm they changed the setting.
 */
export const canRequestLocation = ({ status, permissionState = 'unknown' }) => {
  if (status === LOCATION_STATUS.REQUESTING || status === LOCATION_STATUS.UNSUPPORTED) return false;
  if (permissionState === 'denied') return false;
  return true;
};

/** Fallback states are all those where the user needs the manual search route. */
export const isFallbackStatus = (status) =>
  status === LOCATION_STATUS.DENIED ||
  status === LOCATION_STATUS.UNSUPPORTED ||
  status === LOCATION_STATUS.UNAVAILABLE ||
  status === LOCATION_STATUS.TIMEOUT;

export const readDeniedFlag = (storage = globalThis.sessionStorage) => {
  try {
    return storage.getItem(LOCATION_DENIED_KEY) === '1';
  } catch {
    return false;
  }
};

export const writeDeniedFlag = (denied, storage = globalThis.sessionStorage) => {
  try {
    if (denied) storage.setItem(LOCATION_DENIED_KEY, '1');
    else storage.removeItem(LOCATION_DENIED_KEY);
  } catch {
    // storage unavailable: the denial just will not survive a reload
  }
};

/** Reads the Permissions API without ever triggering a prompt. Resolves to a status object. */
export const queryGeolocationPermission = async (nav = globalThis.navigator) => {
  try {
    if (!nav?.permissions?.query) return { state: 'unknown', status: null };
    const status = await nav.permissions.query({ name: 'geolocation' });
    return { state: status.state, status };
  } catch {
    return { state: 'unknown', status: null };
  }
};

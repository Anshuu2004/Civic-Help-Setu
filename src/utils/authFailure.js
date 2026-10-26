/**
 * Turns whatever a failed sign-in throws into one of a few fixed, safe states.
 *
 * Only the failure kind is used to pick the text. The original message, error
 * codes, ids and anything else on the error are never copied into the result,
 * so provider internals, tokens or account details cannot reach the screen.
 *
 * Kinds:
 *   network              offline or the request could not be sent  (retryable)
 *   session_expired      the earlier sign-in is no longer valid     (retryable)
 *   service_unavailable  provider script/API down, timed out, 5xx, 429 (retryable)
 *   access_blocked       provider answered 403, so retrying will not help (not retryable)
 *   unknown              anything we cannot identify: generic wording
 */

export const AUTH_FAILURE_KINDS = {
  NETWORK: 'network',
  SESSION_EXPIRED: 'session_expired',
  SERVICE_UNAVAILABLE: 'service_unavailable',
  ACCESS_BLOCKED: 'access_blocked',
  UNKNOWN: 'unknown',
};

// Codes seen on Clerk errors. failed_to_load_clerk_js(_timeout) and
// authentication_invalid are present in the installed @clerk packages.
const NETWORK_CODES = ['network_error'];
const SESSION_CODES = ['authentication_invalid'];
const SERVICE_CODES = ['failed_to_load_clerk_js', 'failed_to_load_clerk_js_timeout'];

const NETWORK_MESSAGE = /network ?error|failed to fetch|load failed|network request failed/i;

const FAILURES = {
  network: {
    retryable: true,
    title: 'You seem to be offline',
    message:
      "We couldn't reach the sign-in service. Check your connection and try again. Nothing was changed on your account.",
  },
  session_expired: {
    retryable: true,
    title: 'Your session has expired',
    message: 'For your security, the earlier sign-in is no longer valid. Sign in again to continue.',
  },
  service_unavailable: {
    retryable: true,
    title: 'Sign-in is temporarily unavailable',
    message:
      'The sign-in service did not respond as expected. This is usually short-lived, so try again in a moment.',
  },
  access_blocked: {
    retryable: false,
    title: "Sign-in isn't available right now",
    message:
      'Google sign-in is not available for this site at the moment, and trying again will not change that. You can keep browsing without an account, or let us know.',
  },
  unknown: {
    retryable: true,
    title: 'Sign-in did not finish',
    message:
      'Something went wrong while signing you in and we could not tell why. You can try again, or head back to the home page.',
  },
};

const codeOf = (error) => {
  const code = error?.code ?? error?.errors?.[0]?.code;
  return typeof code === 'string' ? code : '';
};

const statusOf = (error) => {
  const status = error?.status ?? error?.statusCode;
  return Number.isInteger(status) ? status : null;
};

const detectKind = (error, online) => {
  if (online === false) return AUTH_FAILURE_KINDS.NETWORK;

  const code = codeOf(error);
  const status = statusOf(error);
  const text = typeof error?.message === 'string' ? `${error.name || ''} ${error.message}` : '';

  if (NETWORK_CODES.includes(code) || NETWORK_MESSAGE.test(text)) return AUTH_FAILURE_KINDS.NETWORK;
  if (SESSION_CODES.includes(code) || status === 401) return AUTH_FAILURE_KINDS.SESSION_EXPIRED;
  if (SERVICE_CODES.includes(code) || status === 429 || (status !== null && status >= 500)) {
    return AUTH_FAILURE_KINDS.SERVICE_UNAVAILABLE;
  }
  if (status === 403) return AUTH_FAILURE_KINDS.ACCESS_BLOCKED;
  return AUTH_FAILURE_KINDS.UNKNOWN;
};

/**
 * @param {unknown} error whatever was thrown
 * @param {{online?: boolean}} [context] pass navigator.onLine when available
 * @returns {{kind: string, retryable: boolean, title: string, message: string}}
 */
export const classifyAuthFailure = (error, { online } = {}) => {
  const kind = detectKind(error, online);
  return { kind, ...FAILURES[kind] };
};

/** The failure to show when a stage of the flow stalls without throwing anything. */
export const failureForKind = (kind) => ({
  kind,
  ...(FAILURES[kind] || FAILURES.unknown),
});

/**
 * Lets one sign-in redirect run at a time. A second click while the first is
 * still starting is ignored. After a successful start the gate stays closed
 * because the browser is already leaving the page; release() reopens it, for
 * example when the page comes back from the back/forward cache.
 */
export const createRedirectGate = () => {
  let busy = false;
  return {
    isBusy: () => busy,
    release: () => {
      busy = false;
    },
    /** @returns {Promise<{status: 'busy'} | {status: 'started'} | {status: 'failed', error: unknown}>} */
    async run(task) {
      if (busy) return { status: 'busy' };
      busy = true;
      try {
        await task();
        return { status: 'started' };
      } catch (error) {
        busy = false;
        return { status: 'failed', error };
      }
    },
  };
};

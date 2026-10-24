/**
 * Helpers for sending people back to the page they wanted after they sign in
 * or sign up.
 *
 * The destination travels two ways: in router state (set by ProtectedRoute)
 * and in a `redirect_url` query param. Router state is lost on a page refresh
 * and on the Google OAuth round trip, the query param is not. `redirect_url`
 * is also the name Clerk's own <SignIn /> / <SignUp /> components read.
 */

export const REDIRECT_PARAM = 'redirect_url';

const AUTH_PATHS = ['/login', '/signup', '/sso-callback'];

const PROTECTED_PAGE_LABELS = {
  '/saved': 'your saved services',
  '/vault': 'your document vault',
  '/profile': 'your profile',
  '/admin': 'the admin dashboard',
};

const isAuthPath = (pathname) =>
  AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

/**
 * Returns `path` if it is a safe in-app destination, otherwise null.
 * Relative paths are allowed ("/saved", "/saved?folder=x"), and so are full
 * URLs on our own origin (turned into a path). Other sites, protocol-relative
 * URLs ("//evil.com") and the auth pages themselves (which would loop) are
 * rejected.
 */
export const sanitizeRedirectPath = (path, origin = globalThis.location?.origin) => {
  if (typeof path !== 'string') return null;
  let trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (!origin || url.origin !== origin) return null;
      trimmed = `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return null;
    }
  }
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return null;
  }
  const pathname = trimmed.split(/[?#]/)[0];
  if (isAuthPath(pathname)) return null;
  return trimmed;
};

/** Turns a router location object into "/path?search#hash". */
export const locationToPath = (location) => {
  if (!location || typeof location.pathname !== 'string') return null;
  return `${location.pathname}${location.search || ''}${location.hash || ''}`;
};

/**
 * Works out where to send the user after auth. Router state wins, then the
 * `redirect_url` query param, then null (caller decides the default).
 */
export const getRedirectTarget = (location) => {
  const fromState = location?.state?.from;
  const statePath = typeof fromState === 'string' ? fromState : locationToPath(fromState);
  const safeStatePath = sanitizeRedirectPath(statePath);
  if (safeStatePath) return safeStatePath;

  const params = new URLSearchParams(location?.search || '');
  return sanitizeRedirectPath(params.get(REDIRECT_PARAM));
};

/**
 * Builds a link to an auth page that keeps the destination, e.g.
 * buildAuthPath('/signup', '/saved') -> "/signup?redirect_url=%2Fsaved".
 */
export const buildAuthPath = (authPath, redirectTo) => {
  const safe = sanitizeRedirectPath(redirectTo);
  if (!safe) return authPath;
  const params = new URLSearchParams({ [REDIRECT_PARAM]: safe });
  return `${authPath}?${params.toString()}`;
};

/**
 * Friendly name for a protected page, used in the sign in notice.
 * Returns null when there is nothing worth explaining (no target, or home).
 */
export const describeProtectedPath = (path) => {
  const safe = sanitizeRedirectPath(path);
  if (!safe) return null;
  const pathname = safe.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  if (pathname === '/') return null;
  const match = Object.keys(PROTECTED_PAGE_LABELS).find(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  return match ? PROTECTED_PAGE_LABELS[match] : 'that page';
};

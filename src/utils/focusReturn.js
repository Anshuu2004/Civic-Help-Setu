/**
 * Helpers for giving focus back to the element that opened a dialog.
 * Kept free of React and of the real DOM so they can be unit tested
 * (the repo has no jsdom).
 */

/**
 * Remember what had focus when the dialog opened.
 * Returns null when nothing useful had focus (page body, no document).
 */
export const captureFocusedElement = (doc = typeof document === 'undefined' ? null : document) => {
  if (!doc) return null;
  const active = doc.activeElement;
  if (!active || active === doc.body || active === doc.documentElement) return null;
  return active;
};

/**
 * Pick the element to focus when the dialog closes, or null if there is
 * nothing safe to focus. The opener may have been removed meanwhile (for
 * example the row that was just deleted), and focusing a detached node does nothing.
 */
export const pickFocusRestoreTarget = (previous) => {
  if (!previous || typeof previous.focus !== 'function') return null;
  if (previous.isConnected === false) return null;
  return previous;
};

/** Focus the remembered element if it can still take focus. Returns true when it did. */
export const restoreFocus = (previous) => {
  const target = pickFocusRestoreTarget(previous);
  if (!target) return false;
  target.focus();
  return true;
};

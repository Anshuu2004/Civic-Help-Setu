/**
 * Helpers for the unsaved-draft warning. Kept free of React so the rules
 * can be unit tested directly.
 */

/**
 * True when any field differs from the last saved/initial baseline.
 * Compares plain objects of primitive values by key (order independent).
 */
export const isFormDirty = (current, baseline) => {
  if (!current || !baseline) return false;
  const keys = new Set([...Object.keys(current), ...Object.keys(baseline)]);
  for (const key of keys) {
    if (!Object.is(current[key], baseline[key])) return true;
  }
  return false;
};

/**
 * Whether a navigation should be intercepted. Only leaving the current
 * page (path, search or hash change) while dirty would discard the draft.
 */
export const shouldBlockNavigation = (isDirty, currentLocation, nextLocation) => {
  if (!isDirty) return false;
  if (!currentLocation || !nextLocation) return true;
  return (
    currentLocation.pathname !== nextLocation.pathname ||
    currentLocation.search !== nextLocation.search ||
    currentLocation.hash !== nextLocation.hash
  );
};

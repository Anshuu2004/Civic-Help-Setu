import { useCallback, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { shouldBlockNavigation } from '../utils/formDraft';

/**
 * Warns before unsaved form changes are discarded.
 * - In-app navigation and browser back/forward are intercepted through the
 *   router's useBlocker (requires a data router).
 * - Tab close / reload falls back to the native beforeunload prompt.
 * Nothing is blocked while `isDirty` is false.
 *
 * Returns { isBlocked, stay, discard } to drive a confirmation dialog.
 */
const useUnsavedChangesGuard = (isDirty) => {
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        shouldBlockNavigation(isDirty, currentLocation, nextLocation),
      [isDirty],
    ),
  );

  useEffect(() => {
    if (!isDirty) return undefined;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const isBlocked = blocker.state === 'blocked';
  const stay = useCallback(() => {
    if (blocker.state === 'blocked') blocker.reset();
  }, [blocker]);
  const discard = useCallback(() => {
    if (blocker.state === 'blocked') blocker.proceed();
  }, [blocker]);

  return { isBlocked, stay, discard };
};

export default useUnsavedChangesGuard;

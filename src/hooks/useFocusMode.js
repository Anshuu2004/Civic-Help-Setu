import { useCallback, useEffect, useState } from 'react';
import { loadFocusMode, saveFocusMode } from '../utils/preferencesStorage';

// Reading-layout preference for the service detail page. Presentation only,
// so it is kept in localStorage like the theme and accessibility settings.
// The toggle exists both in the navbar and on the page, so every instance
// listens for a change event to stay in sync.
export const FOCUS_MODE_EVENT = 'civicbridge:focus-mode-change';

export const useFocusMode = () => {
  const [focusMode, setFocusMode] = useState(loadFocusMode);

  useEffect(() => {
    const sync = () => setFocusMode(loadFocusMode());
    window.addEventListener(FOCUS_MODE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(FOCUS_MODE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggleFocusMode = useCallback(() => {
    const next = !loadFocusMode();
    saveFocusMode(next);
    setFocusMode(next);
    window.dispatchEvent(new Event(FOCUS_MODE_EVENT));
  }, []);

  return { focusMode, toggleFocusMode };
};

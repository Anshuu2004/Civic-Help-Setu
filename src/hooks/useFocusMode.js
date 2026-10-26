import { useCallback, useState } from 'react';
import { loadFocusMode, saveFocusMode } from '../utils/preferencesStorage';

// Reading-layout preference for the service detail page. Presentation only,
// so it is kept in localStorage like the theme and accessibility settings.
export const useFocusMode = () => {
  const [focusMode, setFocusMode] = useState(loadFocusMode);

  const toggleFocusMode = useCallback(() => {
    setFocusMode((prev) => {
      const next = !prev;
      saveFocusMode(next);
      return next;
    });
  }, []);

  return { focusMode, toggleFocusMode };
};

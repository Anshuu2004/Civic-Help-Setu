import { useFocusMode } from '../../hooks/useFocusMode';
import FocusModeToggle from './FocusModeToggle';

// Sits next to the plain language toggle in the navbar. It only matters on a
// service detail page, so the navbar renders it there and nowhere else.
const FocusModeNavToggle = () => {
  const { focusMode, toggleFocusMode } = useFocusMode();
  return <FocusModeToggle enabled={focusMode} onToggle={toggleFocusMode} />;
};

export default FocusModeNavToggle;

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import {
  CHECKLIST_STORAGE_KEY,
  createChecklistSession,
} from '../services/checklistStorage';

const STATUS_TEXT = {
  saving: 'Saving...',
  saved: 'All changes saved.',
  updated: 'Updated from another tab or window.',
};

// `items` is an array of labels. Pass `checklistId` to save progress in the
// browser; without it the list only lives in memory, as before.
const Checklist = ({ items = [], checklistId, label = 'Checklist' }) => {
  const itemsKey = items.join('\u0000');
  const session = useMemo(
    () => createChecklistSession({ id: checklistId, items }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checklistId, itemsKey]
  );

  const { checked, status } = useSyncExternalStore(
    session.subscribe,
    session.getState,
    session.getState
  );

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === null || event.key === CHECKLIST_STORAGE_KEY) {
        session.refresh();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [session]);

  const done = items.filter((item) => checked.includes(item)).length;
  const blocked = status === 'conflict';

  return (
    <div className="cl-root">
      <p className="cl-progress">
        {done} of {items.length} completed
      </p>
      <ul className="cl-list" aria-label={label}>
        {items.map((item) => {
          const isChecked = checked.includes(item);
          return (
            <li key={item} className={`cl-item${isChecked ? ' is-done' : ''}`}>
              <label className="cl-label">
                <input
                  type="checkbox"
                  className="cl-input"
                  checked={isChecked}
                  disabled={blocked}
                  onChange={() => session.toggle(item)}
                />
                <span className="cl-box" aria-hidden="true">
                  {isChecked ? <CheckSquare size={22} /> : <Square size={22} />}
                </span>
                <span className="cl-text">{item}</span>
                <span className="cl-state">{isChecked ? 'Done' : 'To do'}</span>
              </label>
            </li>
          );
        })}
      </ul>

      <p className="cl-status" role="status" aria-live="polite">
        {STATUS_TEXT[status] || ''}
      </p>

      {status === 'error' && (
        <div className="cl-alert cl-alert-error" role="alert">
          <span>
            Your changes could not be saved in this browser. They are shown here
            but may be lost if you leave.
          </span>
          <button type="button" className="btn btn-secondary" onClick={session.retry}>
            Retry saving
          </button>
        </div>
      )}

      {status === 'conflict' && (
        <div className="cl-alert cl-alert-conflict" role="alert">
          <span>
            This checklist was changed in another tab or window, so your latest
            change was not saved. Choose which version to keep.
          </span>
          <span className="cl-actions">
            <button type="button" className="btn btn-secondary" onClick={session.reloadLatest}>
              Load latest version
            </button>
            <button type="button" className="btn btn-secondary" onClick={session.overwrite}>
              Keep mine and save
            </button>
          </span>
        </div>
      )}
    </div>
  );
};
export default Checklist;

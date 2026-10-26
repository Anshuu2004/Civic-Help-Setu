import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy } from 'lucide-react';
import {
  buildReviewRows,
  fieldIssueCounts,
  filterReviewRows,
  paginate,
  REVIEW_PAGE_SIZE,
} from '../../services/importReview';

const STATUS = {
  ready: { label: 'Ready to import', Icon: CheckCircle2 },
  invalid: { label: 'Has errors, will not import', Icon: AlertTriangle },
  duplicate: { label: 'Duplicate, will not import', Icon: Copy },
};

const ImportReviewTable = ({ report }) => {
  const [invalidOnly, setInvalidOnly] = useState(false);
  const [field, setField] = useState('');
  const [page, setPage] = useState(1);

  const allRows = useMemo(() => buildReviewRows(report), [report]);
  const fieldCounts = useMemo(() => fieldIssueCounts(allRows), [allRows]);
  const rows = useMemo(() => filterReviewRows(allRows, { invalidOnly, field }), [allRows, invalidOnly, field]);
  const view = paginate(rows, page);

  if (allRows.length === 0) return null;

  const blocked = report.invalid.length + report.duplicates.length;

  const changeFilter = (nextInvalidOnly, nextField) => {
    setInvalidOnly(nextInvalidOnly);
    setField(nextField);
    setPage(1);
  };

  return (
    <section className="import-review" aria-labelledby="import-review-title">
      <h4 id="import-review-title" className="import-review__title">Review before importing</h4>

      <div className="import-review__controls">
        <label className="import-review__toggle">
          <input
            type="checkbox"
            checked={invalidOnly}
            disabled={blocked === 0}
            onChange={(e) => changeFilter(e.target.checked, field)}
          />
          Show only rows that will not import ({blocked})
        </label>

        {fieldCounts.length > 0 && (
          <div role="group" aria-label="Go to problems in a field" className="import-review__fields">
            <span className="import-review__fields-label">Jump to field:</span>
            {fieldCounts.map(({ field: name, count }) => (
              <button
                key={name}
                type="button"
                className="import-review__chip"
                aria-pressed={field === name}
                onClick={() => changeFilter(invalidOnly, field === name ? '' : name)}
              >
                <code>{name}</code> ({count})
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="import-review__scroll" tabIndex={0} role="region" aria-label="Import review table">
        <table className="import-review__table">
          <caption className="sr-only">
            Import validation results by row. Only rows marked ready to import will be saved.
          </caption>
          <thead>
            <tr>
              <th scope="col">Row</th>
              <th scope="col">Status</th>
              <th scope="col">Name</th>
              <th scope="col">Field</th>
              <th scope="col">Problem</th>
              <th scope="col">Suggested fix</th>
            </tr>
          </thead>
          <tbody>
            {view.items.map((r) => {
              const { label, Icon } = STATUS[r.status];
              return (
                <tr key={r.key} className={`import-review__row import-review__row--${r.status}`}>
                  <th scope="row">{r.row}</th>
                  <td><span className="import-review__status"><Icon size={14} aria-hidden="true" /> {label}</span></td>
                  <td>{r.name || <em>(no name)</em>}</td>
                  <td>{r.field ? <code>{r.field}</code> : <span aria-label="Not tied to one field">-</span>}</td>
                  <td>{r.message || (r.status === 'ready' ? 'No problems found.' : '')}</td>
                  <td>{r.suggestion}</td>
                </tr>
              );
            })}
            {view.total === 0 && (
              <tr><td colSpan={6}>No rows match this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <nav className="import-review__pager" aria-label="Import review pages">
        <span aria-live="polite">
          {view.total === 0
            ? 'Showing 0 of 0'
            : `Showing ${view.start + 1}-${view.end} of ${view.total}`}
          {view.pageCount > 1 && ` (page ${view.page} of ${view.pageCount}, ${REVIEW_PAGE_SIZE} per page)`}
        </span>
        {view.pageCount > 1 && (
          <span className="import-review__pager-buttons">
            <button type="button" className="btn btn-secondary" disabled={view.page <= 1} onClick={() => setPage(view.page - 1)}>
              Previous
            </button>
            <button type="button" className="btn btn-secondary" disabled={view.page >= view.pageCount} onClick={() => setPage(view.page + 1)}>
              Next
            </button>
          </span>
        )}
      </nav>
    </section>
  );
};

export default ImportReviewTable;

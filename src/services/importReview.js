// Review layer for the bulk service import. It does not parse or validate
// anything itself: it reshapes the report from buildImportPreview into one
// flat list of rows (row number, field, message, suggested fix) so the admin
// can filter and page through the results.

export const REVIEW_PAGE_SIZE = 25;

const FIELD_PATTERN = /^([A-Za-z]+)(?:\[\d+\])?(?=[\s"]|$)/;
const OFFICIAL_SOURCE_PATTERN = /^(official source|at least one official source|officialSources)/;

// Name of the column/key the admin needs to fix in the file they uploaded.
function fieldFromMessage(message, format) {
  const match = FIELD_PATTERN.exec(message);
  const field = OFFICIAL_SOURCE_PATTERN.test(message) ? 'officialSources' : match ? match[1] : null;
  // Only keys that exist in the import format are real fields; sentences such as
  // "Each record must be an object" are not tied to one.
  const KNOWN = [
    'id', 'name', 'shortDescription', 'category', 'department', 'type', 'difficulty', 'feeType', 'fees',
    'processingTime', 'speedDays', 'popularityScore', 'lastVerified', 'eligibility', 'documents', 'warnings',
    'steps', 'officialSources',
  ];
  if (!KNOWN.includes(field)) return null;
  // The CSV has flat source columns instead of an officialSources array.
  if (field === 'officialSources' && format === 'csv') return 'officialSourceUrl';
  return field;
}

/** Suggested correction for a validator message, or '' when there is no safe general advice. */
export function suggestFix(message, field) {
  if (/ is required$/.test(message)) return `Add a value for ${field || 'this field'}.`;
  const options = /(?:is not one of|must be one of): (.+)$/.exec(message);
  if (options) return `Use one of: ${options[1]}.`;
  if (/must be "free" or "paid"/.test(message)) return 'Use "free" or "paid".';
  if (/YYYY-MM-DD/.test(message)) return 'Write the date as YYYY-MM-DD, for example 2026-01-31.';
  if (/is not a real date/.test(message)) return 'Check that the day exists in that month.';
  if (/is in the future/.test(message)) return "Use today's date or an earlier one.";
  if (/^speedDays/.test(message)) return 'Enter a whole number of days, for example 14.';
  if (/^popularityScore/.test(message)) return 'Enter a number from 0 to 100.';
  if (/must be lowercase letters/.test(message)) return 'Use lowercase letters, numbers and dashes, for example senior-citizen-card.';
  if (/must contain letters or numbers/.test(message)) return 'Give the service a name that contains letters or numbers.';
  if (/not a valid http\(s\) link/.test(message)) return 'Use a full link that starts with https://.';
  if (/at least one official source/.test(message)) return 'Add the official website of the department.';
  if (/^steps must/.test(message)) return 'Give each step a title and a description (JSON imports only).';
  if (/must be a list of non-empty text values/.test(message)) return 'In CSV, separate values with | and leave no empty values.';
  if (/must be text/.test(message)) return 'Use plain text for this field.';
  if (/^Each record must be an object/.test(message)) return 'Make every item in the JSON list an object with the service fields.';
  return '';
}

function duplicateField(reason) {
  return /^(id |same id)/.test(reason) ? 'id' : 'name';
}

/**
 * Flatten a buildImportPreview report into display lines ordered by row.
 * An invalid row produces one line per error so every problem is visible;
 * ready and duplicate rows produce one line each.
 * status is 'ready' | 'invalid' | 'duplicate'; only 'ready' rows are importable.
 */
export function buildReviewRows(report) {
  if (!report || report.fileErrors?.length) return [];
  const format = report.format;
  const records = [];

  for (const { row, service, warnings } of report.valid) {
    records.push({
      row,
      status: 'ready',
      name: service.name,
      issues: [{ field: null, message: warnings.join('; '), suggestion: '' }],
    });
  }
  for (const { row, name, errors } of report.invalid) {
    records.push({
      row,
      status: 'invalid',
      name,
      issues: errors.map((message) => {
        const field = fieldFromMessage(message, format);
        return { field, message, suggestion: suggestFix(message, field) };
      }),
    });
  }
  for (const { row, name, reason } of report.duplicates) {
    records.push({
      row,
      status: 'duplicate',
      name,
      issues: [
        {
          field: duplicateField(reason),
          message: `Duplicate: ${reason}`,
          suggestion: 'Change the id or name, or remove this row from the file.',
        },
      ],
    });
  }

  records.sort((a, b) => a.row - b.row);
  return records.flatMap((rec) =>
    rec.issues.map((issue, idx) => ({
      key: `${rec.status}-${rec.row}-${idx}`,
      row: rec.row,
      status: rec.status,
      name: rec.name,
      field: issue.field,
      message: issue.message,
      suggestion: issue.suggestion,
    })),
  );
}

/** Rows that still need fixing, optionally narrowed to one field. */
export function filterReviewRows(rows, { invalidOnly = false, field = '' } = {}) {
  return rows.filter((r) => {
    if (invalidOnly && r.status === 'ready') return false;
    if (field && r.field !== field) return false;
    return true;
  });
}

/** Fields that have at least one problem, with how many, for the jump-to-field buttons. */
export function fieldIssueCounts(rows) {
  const counts = new Map();
  for (const r of rows) {
    if (r.status === 'ready' || !r.field) continue;
    counts.set(r.field, (counts.get(r.field) || 0) + 1);
  }
  return [...counts].map(([field, count]) => ({ field, count })).sort((a, b) => b.count - a.count || a.field.localeCompare(b.field));
}

/** One page of rows. The page number is clamped, so a stale page never shows nothing. */
export function paginate(rows, page, pageSize = REVIEW_PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;
  return { items: rows.slice(start, start + pageSize), page: current, pageCount, start, end: Math.min(start + pageSize, rows.length), total: rows.length };
}

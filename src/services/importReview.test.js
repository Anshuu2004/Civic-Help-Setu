import { describe, expect, it } from 'vitest';
import { buildImportPreview } from './serviceImportService';
import {
  buildReviewRows,
  fieldIssueCounts,
  filterReviewRows,
  paginate,
  REVIEW_PAGE_SIZE,
  suggestFix,
} from './importReview';

const svc = (overrides = {}) => ({
  name: 'Senior Citizen Card',
  shortDescription: 'Identity card for people aged 60 and above.',
  category: 'Identity',
  officialSources: [{ name: 'Dept', url: 'https://socialjustice.gov.in' }],
  ...overrides,
});
const review = (list, existingServices = []) =>
  buildReviewRows(buildImportPreview(JSON.stringify(list), { fileName: 'x.json', existingServices }));

describe('buildReviewRows', () => {
  it('maps several errors on one record to their own row and field', () => {
    const rows = review([svc({ category: 'Nope', speedDays: 0, lastVerified: '31-12-2026' })]);
    expect(rows.every((r) => r.row === 1 && r.status === 'invalid')).toBe(true);
    expect(rows.map((r) => r.field).sort()).toEqual(['category', 'lastVerified', 'speedDays']);
    expect(rows.find((r) => r.field === 'category').suggestion).toMatch(/^Use one of: /);
  });

  it('points each error at the record it came from', () => {
    const rows = review([svc(), svc({ name: 'Other', shortDescription: '' })]);
    expect(rows.map((r) => [r.row, r.status, r.field])).toEqual([
      [1, 'ready', null],
      [2, 'invalid', 'shortDescription'],
    ]);
  });

  it('names the CSV column for source problems in CSV files and the key in JSON', () => {
    const csv = 'name,shortDescription,category,officialSourceUrl\nA,desc,Identity,not-a-url\n';
    const csvRows = buildReviewRows(buildImportPreview(csv, { fileName: 'a.csv' }));
    expect(csvRows[0].field).toBe('officialSourceUrl');
    const jsonRows = review([svc({ officialSources: [{ url: 'not-a-url' }] })]);
    expect(jsonRows[0].field).toBe('officialSources');
  });

  it('leaves the field empty when an error is not tied to one field', () => {
    const rows = review(['just a string']);
    expect(rows[0]).toMatchObject({ status: 'invalid', field: null });
    expect(rows[0].suggestion).toMatch(/object/);
  });

  it('marks duplicates (in the catalog and in the file) as not importable', () => {
    const rows = review([svc(), svc(), svc({ name: 'Existing' })], [{ id: 'existing', name: 'Existing' }]);
    expect(rows.map((r) => r.status)).toEqual(['ready', 'duplicate', 'duplicate']);
    expect(rows[1].message).toMatch(/same id as row 1/);
    expect(rows[2].field).toBe('id');
  });

  it('keeps warnings on ready rows', () => {
    const rows = review([svc({ officialSources: [{ url: 'http://socialjustice.gov.in' }] })]);
    expect(rows[0].status).toBe('ready');
    expect(rows[0].message).toMatch(/http instead of https/);
  });

  it('returns nothing for empty, malformed and missing reports', () => {
    expect(buildReviewRows(null)).toEqual([]);
    expect(buildReviewRows(buildImportPreview('', {}))).toEqual([]);
    expect(buildReviewRows(buildImportPreview('[]', { fileName: 'x.json' }))).toEqual([]);
    expect(buildReviewRows(buildImportPreview('{"a":', { fileName: 'x.json' }))).toEqual([]);
  });
});

describe('filterReviewRows and fieldIssueCounts', () => {
  const rows = review([
    svc(),
    svc({ name: 'B', category: 'Nope' }),
    svc({ name: 'C', category: 'Nope', speedDays: 0 }),
    svc(),
  ]);

  it('invalid-only drops ready rows but keeps duplicates', () => {
    const filtered = filterReviewRows(rows, { invalidOnly: true });
    expect(filtered.map((r) => r.status)).toEqual(['invalid', 'invalid', 'invalid', 'duplicate']);
  });

  it('narrows to one field', () => {
    expect(filterReviewRows(rows, { field: 'category' }).map((r) => r.row)).toEqual([2, 3]);
  });

  it('counts problems per field, most frequent first, ignoring ready rows', () => {
    expect(fieldIssueCounts(rows)).toEqual([
      { field: 'category', count: 2 },
      { field: 'id', count: 1 },
      { field: 'speedDays', count: 1 },
    ]);
  });
});

describe('paginate', () => {
  const rows = Array.from({ length: REVIEW_PAGE_SIZE * 2 + 1 }, (_, i) => ({ row: i + 1 }));

  it('returns bounded pages with correct ranges', () => {
    const first = paginate(rows, 1);
    expect(first.items).toHaveLength(REVIEW_PAGE_SIZE);
    expect([first.start, first.end, first.pageCount]).toEqual([0, REVIEW_PAGE_SIZE, 3]);
    expect(paginate(rows, 3).items).toEqual([{ row: rows.length }]);
  });

  it('clamps out-of-range pages and handles an empty list', () => {
    expect(paginate(rows, 99).page).toBe(3);
    expect(paginate(rows, -4).page).toBe(1);
    expect(paginate([], 5)).toMatchObject({ items: [], page: 1, pageCount: 1, total: 0 });
  });

  it('pages a 500 row import instead of returning every row', () => {
    const big = Array.from({ length: 500 }, (_, i) => svc({ name: `Service ${i}` }));
    const all = review(big);
    expect(all).toHaveLength(500);
    expect(paginate(all, 1).items).toHaveLength(REVIEW_PAGE_SIZE);
  });
});

describe('suggestFix', () => {
  it('has advice for common validator messages and none for unknown ones', () => {
    expect(suggestFix('name is required', 'name')).toBe('Add a value for name.');
    expect(suggestFix('lastVerified must be a date in YYYY-MM-DD format', 'lastVerified')).toMatch(/YYYY-MM-DD/);
    expect(suggestFix('something unexpected', null)).toBe('');
  });
});

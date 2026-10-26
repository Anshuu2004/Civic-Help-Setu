import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ImportReviewTable from './ImportReviewTable';
import { buildImportPreview } from '../../services/serviceImportService';
import { REVIEW_PAGE_SIZE } from '../../services/importReview';

const svc = (overrides = {}) => ({
  name: 'Senior Citizen Card',
  shortDescription: 'Identity card for people aged 60 and above.',
  category: 'Identity',
  officialSources: [{ name: 'Dept', url: 'https://socialjustice.gov.in' }],
  ...overrides,
});
const render = (text) =>
  renderToStaticMarkup(<ImportReviewTable report={buildImportPreview(text, { fileName: 'x.json' })} />);
const html = (list) => render(JSON.stringify(list));

describe('ImportReviewTable', () => {
  it('uses real table semantics with a caption and scoped headers', () => {
    const out = html([svc(), svc({ name: 'B', category: 'Nope' })]);
    expect(out).toContain('<caption');
    expect(out).toContain('scope="col">Suggested fix');
    expect(out).toContain('<th scope="row">2</th>');
  });

  it('labels invalid and duplicate rows as not importable and ready rows as ready', () => {
    const out = html([svc(), svc(), svc({ name: 'B', category: 'Nope' })]);
    expect(out).toContain('Ready to import');
    expect(out).toContain('Duplicate, will not import');
    expect(out).toContain('Has errors, will not import');
  });

  it('shows jump-to-field buttons and the invalid-only toggle with counts', () => {
    const out = html([svc({ category: 'Nope', speedDays: 0 })]);
    expect(out).toContain('aria-pressed="false"');
    expect(out).toContain('<code>category</code>');
    expect(out).toContain('will not import (1)');
  });

  it('renders at most one page of a large import and shows paging controls', () => {
    const big = Array.from({ length: REVIEW_PAGE_SIZE * 2 }, (_, i) => svc({ name: `Service ${i}` }));
    const out = html(big);
    expect(out.match(/import-review__row /g)).toHaveLength(REVIEW_PAGE_SIZE);
    expect(out).toContain(`Showing 1-${REVIEW_PAGE_SIZE} of ${REVIEW_PAGE_SIZE * 2}`);
    expect(out).toContain('Next');
  });

  it('renders nothing for empty or malformed imports (the panel shows the file error)', () => {
    expect(html([])).toBe('');
    expect(render('{"a":')).toBe('');
  });
});

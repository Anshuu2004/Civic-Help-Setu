import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Checklist from './Checklist';

describe('Checklist markup', () => {
  const html = renderToStaticMarkup(
    <Checklist items={['Aadhaar Card', 'Affidavit']} checklistId="SRV-TEST" label="Docs" />
  );

  it('renders a labelled list of real checkboxes', () => {
    expect(html).toContain('<ul class="cl-list" aria-label="Docs"');
    expect(html.match(/type="checkbox"/g)).toHaveLength(2);
    expect(html).toContain('<label class="cl-label">');
  });

  it('states completion in text, not only colour', () => {
    expect(html).toContain('0 of 2 completed');
    expect(html).toContain('To do');
  });

  it('has a polite live region for save status', () => {
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
  });

  it('shows no error or conflict message initially', () => {
    expect(html).not.toContain('role="alert"');
  });

  it('renders just the summary for an empty list', () => {
    expect(renderToStaticMarkup(<Checklist />)).toContain('0 of 0 completed');
  });
});

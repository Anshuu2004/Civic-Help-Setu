import { readFileSync } from 'node:fs';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { isValidElement } from 'react';
import ServiceRecordList from './ServiceRecordList';

const longUrlName = 'Pradhan Mantri Awas Yojana https://pmaymis.gov.in/PMAYMIS2_2024/PmayDefault.aspx/very/long/path/segment';
const services = [
  { id: 'birth-certificate', name: 'Birth Certificate', category: 'Certificates', type: 'Online / Offline' },
  { id: 'long-one', name: longUrlName, category: 'Housing and Urban Development', type: 'Online' },
  { id: 'no-type', name: 'Ration Card', category: 'Welfare' },
];

const props = () => ({ services, onEdit: vi.fn(), onDelete: vi.fn() });

// ServiceRecordList has no hooks, so calling it returns the element tree and
// the real onClick handlers can be walked and called without a DOM.
const collect = (node, predicate, found = []) => {
  if (Array.isArray(node)) {
    node.forEach((n) => collect(n, predicate, found));
  } else if (isValidElement(node)) {
    if (predicate(node)) found.push(node);
    collect(node.props.children, predicate, found);
  }
  return found;
};

describe('ServiceRecordList markup', () => {
  const html = renderToStaticMarkup(<ServiceRecordList {...props()} />);

  it('keeps the table with one row per record', () => {
    expect(html).toContain('<table');
    expect(html.match(/<tbody>[\s\S]*<\/tbody>/)[0].match(/<tr/g)).toHaveLength(services.length);
    ['Service Name', 'Category', 'Delivery Mode', 'Actions'].forEach((h) => expect(html).toContain(h));
  });

  it('renders one card per record carrying the same information', () => {
    const cards = html.match(/<li class="admin-record-card">[\s\S]*?<\/li>/g);
    expect(cards).toHaveLength(services.length);
    expect(cards[0]).toContain('Birth Certificate');
    expect(cards[0]).toContain('Certificates');
    expect(cards[0]).toContain('Online / Offline');
    expect(cards[1]).toContain(longUrlName);
    expect(cards[1]).toContain('Housing and Urban Development');
  });

  it('shows the delivery mode as text, with the same fallback in both layouts', () => {
    expect(html.match(/Online \/ Offline/g)).toHaveLength(4); // birth certificate and the record without a type, in both layouts
    expect(html).toContain('Delivery mode');
  });

  it('gives every action an accessible name that includes the record', () => {
    const count = (label) => html.split(`aria-label="${label}"`).length - 1;
    services.forEach((svc) => {
      expect(count(`Edit ${svc.name}`)).toBe(2);
      expect(count(`Delete ${svc.name}`)).toBe(2);
    });
  });

  it('lets long names wrap instead of widening the layout', () => {
    expect(html).toContain('overflow-wrap:anywhere');
  });
});

describe('ServiceRecordList handlers', () => {
  it('table and card buttons call the same handlers with the same arguments', () => {
    const p = props();
    const tree = ServiceRecordList(p);
    const buttons = collect(tree, (el) => el.type === 'button');
    expect(buttons).toHaveLength(services.length * 4);

    buttons.forEach((btn) => btn.props.onClick());

    const editCalls = p.onEdit.mock.calls.map(([svc]) => svc.id);
    const deleteCalls = p.onDelete.mock.calls.map(([id]) => id);
    const ids = services.map((s) => s.id);
    expect(editCalls.sort()).toEqual([...ids, ...ids].sort());
    expect(deleteCalls.sort()).toEqual([...ids, ...ids].sort());
    // Edit receives the full record, Delete receives the id.
    expect(p.onEdit.mock.calls[0][0]).toBe(services[0]);
  });
});

describe('responsive contract in index.css', () => {
  const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  it('swaps table for cards with a 640px container query on the list itself', () => {
    expect(css).toMatch(/\.admin-records\s*\{[^}]*container-type:\s*inline-size/);
    const block = css.match(/@container admin-records \(max-width: 640px\)\s*\{([\s\S]*?)\n\}/)[1];
    expect(block).toMatch(/\.admin-records__table\s*\{\s*display:\s*none/);
    expect(block).toMatch(/\.admin-records__cards\s*\{\s*display:\s*block/);
  });

  it('keeps cards hidden by default so wide screens and old browsers see the table', () => {
    expect(css).toMatch(/\.admin-records__cards\s*\{\s*display:\s*none/);
  });

  it('stacks the admin sidebar above the content on narrow viewports', () => {
    expect(css).toMatch(/@media \(max-width: 768px\)\s*\{\s*\.admin-layout\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\)/);
  });
});

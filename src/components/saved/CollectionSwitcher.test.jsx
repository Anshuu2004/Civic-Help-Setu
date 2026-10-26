import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import CollectionSwitcher from './CollectionSwitcher';
import CollectionEmptyState from './CollectionEmptyState';
import { buildCollections } from '../../services/savedCollections';

const render = (el) => renderToStaticMarkup(<MemoryRouter>{el}</MemoryRouter>);

describe('CollectionSwitcher', () => {
  const collections = buildCollections(
    [{ serviceId: 'a', folder: 'Family' }, { serviceId: 'b', folder: 'Tax' }, { serviceId: 'c', folder: 'Tax' }],
    ['Housing']
  );
  const html = render(
    <CollectionSwitcher collections={collections} activeCollection="Tax" onSelect={() => {}} onCreate={() => {}} />
  );

  it('is a labelled group of native buttons with pressed state', () => {
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Saved collections"');
    expect(html).toContain('aria-pressed="true" aria-label="Tax, 2 guides"');
    expect(html).toContain('aria-pressed="false" aria-label="Family, 1 guide"');
    expect(html).toContain('type="button"');
  });

  it('shows counts, "All saved", and marks empty pending collections', () => {
    expect(html).toContain('aria-label="All saved, 3 guides"');
    expect(html).toContain('aria-label="Housing, 0 guides, empty collection"');
  });

  it('offers a New collection action and an alert region for errors', () => {
    expect(html).toContain('New collection');
    expect(html).toContain('role="alert"');
  });

  it('renders only "All saved" for an empty list', () => {
    const empty = render(
      <CollectionSwitcher collections={buildCollections([])} activeCollection="All" onSelect={() => {}} onCreate={() => {}} />
    );
    expect(empty).toContain('aria-pressed="true" aria-label="All saved, 0 guides"');
  });
});

describe('CollectionEmptyState', () => {
  const html = render(<CollectionEmptyState collectionName="Housing" onShowAll={() => {}} />);
  it('names the collection and gives next actions', () => {
    expect(html).toContain('aria-labelledby="collection-empty-title"');
    expect(html).toContain('Housing');
    expect(html).toContain('Show all saved guides');
    expect(html).toContain('href="/services"');
  });
});

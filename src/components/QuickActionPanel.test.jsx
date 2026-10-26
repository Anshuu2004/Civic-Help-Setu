import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import QuickActionPanel from './QuickActionPanel';
import { QUICK_ACTIONS } from '../utils/quickActions';

const appSource = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8');
const registeredPaths = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);

const html = renderToStaticMarkup(
  <MemoryRouter><QuickActionPanel /></MemoryRouter>
);

describe('quick action routes', () => {
  it('every action targets a route registered in App.jsx', () => {
    expect(registeredPaths).toContain('/services');
    for (const action of QUICK_ACTIONS) {
      expect(registeredPaths, action.to).toContain(action.to);
    }
  });

  it('has unique ids and paths', () => {
    expect(new Set(QUICK_ACTIONS.map((a) => a.id)).size).toBe(QUICK_ACTIONS.length);
    expect(new Set(QUICK_ACTIONS.map((a) => a.to)).size).toBe(QUICK_ACTIONS.length);
  });

  it('labels describe goals, not feature names', () => {
    const featureNames = ['Services', 'Eligibility', 'Saved', 'Track', 'Nearby Offices', 'Assistant', 'Vault'];
    for (const action of QUICK_ACTIONS) {
      expect(featureNames, action.label).not.toContain(action.label);
    }
  });
});

describe('QuickActionPanel markup', () => {
  it('is a labelled section with a heading', () => {
    expect(html).toContain('aria-labelledby="quick-actions-title"');
    expect(html).toContain('<h2 id="quick-actions-title"');
  });

  it('renders one real link per action inside a list', () => {
    expect(html.match(/<li>/g)).toHaveLength(QUICK_ACTIONS.length);
    for (const action of QUICK_ACTIONS) {
      expect(html).toContain(`href="${action.to}"`);
      expect(html).toContain(action.label);
    }
  });

  it('hides decorative icons from assistive tech', () => {
    expect(html).toContain('quick-action__icon" aria-hidden="true"');
  });
});

import { describe, expect, it } from 'vitest';
import { SERVICE_CATEGORIES } from './serviceCategories';
import { MOCK_SERVICES } from './services';
import { buildImportPreview } from '../services/serviceImportService';

describe('SERVICE_CATEGORIES', () => {
  it('contains every category used by the service directory', () => {
    const used = new Set(MOCK_SERVICES.map((s) => s.category));
    for (const category of used) {
      expect(SERVICE_CATEGORIES).toContain(category);
    }
  });

  it('has no duplicates', () => {
    expect(new Set(SERVICE_CATEGORIES).size).toBe(SERVICE_CATEGORIES.length);
  });

  it('is the list the import validates against', () => {
    const service = (name, category) => ({
      name,
      shortDescription: `About ${name}`,
      category,
      officialSources: [{ url: 'https://example.gov.in' }],
    });
    const records = [
      ...SERVICE_CATEGORIES.map((c, i) => service(`Service ${i}`, c)),
      service('Old Welfare Service', 'Welfare'),
    ];

    const report = buildImportPreview(JSON.stringify(records), { fileName: 'a.json' });

    expect(report.valid).toHaveLength(SERVICE_CATEGORIES.length);
    expect(report.invalid.map((r) => r.name)).toEqual(['Old Welfare Service']);
  });
});

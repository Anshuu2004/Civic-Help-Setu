import { describe, it, expect } from 'vitest';
import {
  buildCollections,
  validateNewCollection,
  isInCollection,
  resolveActiveCollection,
} from './savedCollections';

const items = [
  { serviceId: 'a', folder: 'Family' },
  { serviceId: 'b', folder: 'family' },
  { serviceId: 'c', folder: 'Tax' },
  { serviceId: 'd' },
];

describe('buildCollections', () => {
  it('returns only "All" with zero count for an empty list', () => {
    expect(buildCollections([])).toEqual([{ name: 'All', count: 0, pending: false }]);
  });

  it('counts each saved guide exactly once and groups folders case-insensitively', () => {
    const result = buildCollections(items);
    expect(result[0]).toEqual({ name: 'All', count: 4, pending: false });
    const groups = result.slice(1);
    expect(groups.map((g) => g.name)).toEqual(['Family', 'Tax', 'General']);
    expect(groups.reduce((n, g) => n + g.count, 0)).toBe(items.length);
    expect(groups[0].count).toBe(2);
  });

  it('adds pending empty collections without duplicating real ones', () => {
    const result = buildCollections(items, ['Docs', 'tax', ' ', 'all']);
    const names = result.map((c) => c.name);
    expect(names).toEqual(['All', 'Family', 'Tax', 'General', 'Docs']);
    expect(result.at(-1)).toEqual({ name: 'Docs', count: 0, pending: true });
  });

  it('drops a collection after its last guide is removed', () => {
    const remaining = items.filter((i) => i.serviceId !== 'c');
    expect(buildCollections(remaining).map((c) => c.name)).not.toContain('Tax');
  });
});

describe('validateNewCollection', () => {
  const collections = buildCollections(items);
  it('rejects empty, reserved and too-long names', () => {
    expect(validateNewCollection('   ', collections).ok).toBe(false);
    expect(validateNewCollection('all', collections).ok).toBe(false);
    expect(validateNewCollection('x'.repeat(41), collections).ok).toBe(false);
  });
  it('flags an existing name (case-insensitive) and returns its canonical name', () => {
    const r = validateNewCollection('  TAX ', collections);
    expect(r).toMatchObject({ ok: false, name: 'Tax', reason: 'exists' });
  });
  it('accepts and trims a new name', () => {
    expect(validateNewCollection('  Housing   docs ', collections)).toEqual({
      ok: true,
      name: 'Housing docs',
    });
  });
});

describe('isInCollection / resolveActiveCollection', () => {
  it('matches All, folder names case-insensitively and the General default', () => {
    expect(isInCollection(items[0], 'All')).toBe(true);
    expect(isInCollection(items[0], 'FAMILY')).toBe(true);
    expect(isInCollection(items[3], 'General')).toBe(true);
    expect(isInCollection(items[2], 'Family')).toBe(false);
  });
  it('falls back to All when the active collection no longer exists', () => {
    const remaining = items.filter((i) => i.folder !== 'Tax');
    expect(resolveActiveCollection('Tax', buildCollections(remaining))).toBe('All');
    expect(resolveActiveCollection('family', buildCollections(remaining))).toBe('Family');
  });
});

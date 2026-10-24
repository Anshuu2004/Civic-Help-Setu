import { describe, it, expect, beforeEach, vi } from 'vitest';

const makeStorage = () => {
  const data = new Map();
  return {
    getItem: vi.fn((k) => (data.has(k) ? data.get(k) : null)),
    setItem: vi.fn((k, v) => data.set(k, String(v))),
    removeItem: vi.fn((k) => data.delete(k)),
  };
};

describe('vaultStorage', () => {
  let storage;
  let mod;
  beforeEach(async () => {
    storage = makeStorage();
    vi.stubGlobal('localStorage', storage);
    mod = await import('./vaultStorage');
  });

  it('saveDocument sets createdAt on new documents', () => {
    const docs = mod.saveDocument({ type: 'Voter ID', number: 'V1' });
    expect(docs[0].createdAt).toBeTruthy();
    expect(docs[0].verified).toBe(false);
  });

  it('saveDocument throws a friendly error when storage is full', () => {
    mod.getDocuments();
    storage.setItem.mockImplementation(() => {
      const e = new Error('full');
      e.name = 'QuotaExceededError';
      throw e;
    });
    expect(() => mod.saveDocument({ type: 'X', number: '1' })).toThrow(/storage is full/i);
  });

  it('importVaultData skips invalid records and reports the count', () => {
    const backup = JSON.stringify({
      documents: [
        { id: 'ok-1', type: 'Passport', number: 'P1' },
        { id: 'bad-1', type: 'NoNumber' },
        null,
        'junk',
      ],
    });
    const res = mod.importVaultData(backup);
    expect(res.success).toBe(true);
    expect(res.count).toBe(1);
    expect(res.skipped).toBe(3);
    expect(mod.getDocuments().some((d) => d.id === 'ok-1')).toBe(true);
    expect(mod.getDocuments().some((d) => d.id === 'bad-1')).toBe(false);
  });

  it('importVaultData rejects a bad format', () => {
    expect(mod.importVaultData('{"nope":1}').success).toBe(false);
    expect(mod.importVaultData('not json').success).toBe(false);
  });
});

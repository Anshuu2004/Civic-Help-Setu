import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LANGUAGE_KEY, loadLanguage, saveLanguage, normalizeLanguage } from './languagePreference';

const makeStorage = (initial = {}) => {
  const data = { ...initial };
  return {
    getItem: vi.fn((k) => (k in data ? data[k] : null)),
    setItem: vi.fn((k, v) => { data[k] = String(v); }),
    data,
  };
};

describe('languagePreference', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.stubGlobal('localStorage', makeStorage());
  });

  it('defaults to English when nothing is saved', () => {
    expect(loadLanguage()).toBe('en');
  });

  it('remembers the chosen language', () => {
    expect(saveLanguage('ta')).toBe('ta');
    expect(localStorage.data[LANGUAGE_KEY]).toBe('ta');
    expect(loadLanguage()).toBe('ta');
  });

  it('ignores unsupported values', () => {
    expect(normalizeLanguage('fr')).toBe('en');
    expect(saveLanguage('fr')).toBe('en');
    vi.stubGlobal('localStorage', makeStorage({ [LANGUAGE_KEY]: 'xx' }));
    expect(loadLanguage()).toBe('en');
  });

  it('still applies the choice when storage is blocked', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
    });
    expect(loadLanguage()).toBe('en');
    expect(saveLanguage('hi')).toBe('hi');
    spy.mockRestore();
  });
});

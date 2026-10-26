import { describe, it, expect } from 'vitest';
import {
  DICTIONARIES,
  FALLBACK_NOTE,
  getLanguageAnnouncement,
  getUiCoverage,
  isServiceContentTranslated,
} from './translationCoverage';
import { SUPPORTED_LANGUAGES } from './languagePreference';

const flat = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flat(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]
  );

describe('getUiCoverage', () => {
  it('treats English as the complete source', () => {
    const c = getUiCoverage('en');
    expect(c.isComplete).toBe(true);
    expect(c.percent).toBe(100);
    expect(c.translated).toBe(c.total);
  });

  it('reports the other locales as partial, using the real locale files', () => {
    ['hi', 'bn', 'ta'].forEach((code) => {
      const c = getUiCoverage(code);
      expect(c.total).toBeGreaterThan(0);
      expect(c.translated).toBeGreaterThan(0);
      expect(c.isComplete).toBe(false);
      expect(c.translated).toBeLessThan(c.total);
    });
    expect(getUiCoverage('hi').translated).toBeGreaterThan(getUiCoverage('bn').translated);
  });

  it('counts only keys that exist in the source dictionary', () => {
    const dicts = {
      en: { a: { x: 'X', y: 'Y' }, b: 'B' },
      xx: { a: { x: 'translated' }, extra: 'not in english' },
    };
    expect(getUiCoverage('xx', dicts)).toEqual({ translated: 1, total: 3, percent: 33, isComplete: false });
  });

  it('handles an unknown language without throwing', () => {
    expect(getUiCoverage('zz').translated).toBe(0);
  });
});

describe('locale files', () => {
  it('has a dictionary for every supported language', () => {
    SUPPORTED_LANGUAGES.forEach((l) => expect(DICTIONARIES[l.code]).toBeTruthy());
  });

  it('does not copy English text into other locales as if it were translated', () => {
    const en = Object.fromEntries(flat(DICTIONARIES.en));
    ['hi', 'bn', 'ta'].forEach((code) => {
      flat(DICTIONARIES[code]).forEach(([key, value]) => {
        expect(value, `${code}:${key}`).not.toBe(en[key]);
      });
    });
  });
});

describe('service content fallback', () => {
  it('marks service content as translated only in English', () => {
    expect(isServiceContentTranslated('en')).toBe(true);
    ['hi', 'bn', 'ta'].forEach((code) => expect(isServiceContentTranslated(code)).toBe(false));
  });

  it('announces what is and is not translated', () => {
    const hi = SUPPORTED_LANGUAGES.find((l) => l.code === 'hi');
    const msg = getLanguageAnnouncement(hi, getUiCoverage('hi'));
    expect(msg).toContain('Language set to Hindi');
    expect(msg).toContain('Some interface labels are translated');
    expect(msg).toContain('stay in English');
    expect(getLanguageAnnouncement(SUPPORTED_LANGUAGES[0], getUiCoverage('en'))).toBe('Language set to English.');
  });

  it('documents the fallback in one short note', () => {
    expect(FALLBACK_NOTE).toMatch(/interface labels/i);
    expect(FALLBACK_NOTE).toMatch(/English/);
  });
});

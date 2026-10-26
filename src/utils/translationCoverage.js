import en from '../locales/en.json';
import hi from '../locales/hi.json';
import bn from '../locales/bn.json';
import ta from '../locales/ta.json';
import { SOURCE_LANGUAGE } from './languagePreference';

// Fallback rule used everywhere (see `t` in LanguageContext):
//   1. the selected language's string, if it exists
//   2. the English string for the same key
//   3. the `fallback` argument passed to t(), else the key itself
// Nothing is machine translated. A label that has no entry in a locale file
// stays in English, and service records (names, steps, fees, official text)
// are not in the locale files at all, so they always stay in their original
// language.
export const DICTIONARIES = { en, hi, bn, ta };

const flattenKeys = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flattenKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  );

export const getUiCoverage = (code, dictionaries = DICTIONARIES) => {
  const sourceKeys = flattenKeys(dictionaries[SOURCE_LANGUAGE] || {});
  const total = sourceKeys.length;
  if (code === SOURCE_LANGUAGE) return { translated: total, total, percent: 100, isComplete: true };

  const have = new Set(flattenKeys(dictionaries[code] || {}));
  const translated = sourceKeys.filter((k) => have.has(k)).length;
  return {
    translated,
    total,
    percent: total ? Math.round((translated / total) * 100) : 0,
    isComplete: translated === total,
  };
};

// Service records are English only today. They stay English until reviewed
// translations exist, so non-English users get a label instead of a guess.
export const isServiceContentTranslated = (code) => code === SOURCE_LANGUAGE;

export const FALLBACK_NOTE =
  'Only interface labels are translated. Service guides and official text stay in English.';

export const getLanguageAnnouncement = (lang, coverage) =>
  lang.code === SOURCE_LANGUAGE
    ? `Language set to ${lang.label}.`
    : `Language set to ${lang.label}. ${
        coverage.isComplete ? 'All interface labels are translated.' : 'Some interface labels are translated.'
      } Service guides and official text stay in English.`;

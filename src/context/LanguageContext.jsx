/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import bn from '../locales/bn.json';
import ta from '../locales/ta.json';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'civicbridge_lang';
const PLAIN_LANG_KEY = 'civicbridge_plain_lang';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', badge: 'EN' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', badge: 'हि' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', badge: 'বা' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', badge: 'த' },
];

const DICTIONARIES = { en, hi, bn, ta };

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return ['en', 'hi', 'bn', 'ta'].includes(saved) ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const [isPlainLanguage, setIsPlainLanguage] = useState(() => {
    try {
      return localStorage.getItem(PLAIN_LANG_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const setLanguage = useCallback((lang) => {
    const valid = ['en', 'hi', 'bn', 'ta'].includes(lang) ? lang : 'en';
    setLanguageState(valid);
    try {
      localStorage.setItem(STORAGE_KEY, valid);
      document.documentElement.lang = valid;
    } catch (err) {
      console.error('Failed to save language preference', err);
    }
  }, []);

  const togglePlainLanguage = useCallback(() => {
    setIsPlainLanguage((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PLAIN_LANG_KEY, String(next));
      } catch (err) {
        console.error('Failed to save plain language preference', err);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (path, fallback = '') => {
      const dict = DICTIONARIES[language] || en;
      const keys = path.split('.');
      let current = dict;

      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          // Fallback to English dictionary if key missing in translation
          let enCurrent = en;
          for (const enK of keys) {
            if (enCurrent && typeof enCurrent === 'object' && enK in enCurrent) {
              enCurrent = enCurrent[enK];
            } else {
              return fallback || path;
            }
          }
          return typeof enCurrent === 'string' ? enCurrent : fallback || path;
        }
      }

      return typeof current === 'string' ? current : fallback || path;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isPlainLanguage,
        togglePlainLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
};

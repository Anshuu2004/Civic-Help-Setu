/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'civicbridge_lang';

const DICTIONARIES = { en, hi };

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'hi' ? 'hi' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = useCallback((lang) => {
    const valid = lang === 'hi' ? 'hi' : 'en';
    setLanguageState(valid);
    try {
      localStorage.setItem(STORAGE_KEY, valid);
      document.documentElement.lang = valid;
    } catch (err) {
      console.error('Failed to save language preference', err);
    }
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
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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

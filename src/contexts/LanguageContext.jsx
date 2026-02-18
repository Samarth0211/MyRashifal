'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, DEFAULT_LANG } from '@/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('myrashifal_lang') : null;
    if (saved && translations[saved]) {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((newLang) => {
    if (translations[newLang]) {
      setLangState(newLang);
      localStorage.setItem('myrashifal_lang', newLang);
    }
  }, []);

  const t = useCallback((key, params = {}) => {
    let text = translations[lang]?.[key];
    if (!text) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Missing key "${key}" for lang "${lang}"`);
      }
      text = translations[DEFAULT_LANG]?.[key] || key;
    }
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    });
    return text;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}

'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Locale, TranslationDictionary, DEFAULT_LOCALE, getDictionary, isValidLocale } from '@/locales';
export const LOCALE_COOKIE_NAME = 'mm_locale';
export const LOCALE_STORAGE_KEY = 'mm_locale';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getSavedLocale(): Locale | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromStorage = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isValidLocale(fromStorage)) return fromStorage;
  } catch {
    // ignore localStorage errors
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`));
  const val = match ? decodeURIComponent(match[1]) : null;
  return isValidLocale(val) ? val : null;
}

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Sync client-side saved locale on mount
  useEffect(() => {
    const saved = getSavedLocale();
    if (saved && saved !== locale) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    if (!isValidLocale(newLocale)) return;
    setLocaleState(newLocale);

    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch {
      // ignore
    }

    // Persist in cookie for future SSR requests
    if (typeof document !== 'undefined') {
      document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale};path=/;max-age=${
        60 * 60 * 24 * 365
      };SameSite=Lax`;
    }
  };

  const t = useMemo(() => getDictionary(locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

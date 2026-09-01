"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  SupportedLocale,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LocaleInfo,
  translate,
} from "@/lib/i18n";

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  supportedLocales: LocaleInfo[];
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key: string) => key,
  supportedLocales: SUPPORTED_LOCALES,
  isRtl: false,
});

const STORAGE_KEY = "linkora_user_locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(DEFAULT_LOCALE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize from localStorage or navigator preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
      if (saved && (saved === "id" || saved === "en")) {
        setLocaleState(saved);
      } else {
        // Fallback to browser language if English is requested
        const browserLang = navigator.language.slice(0, 2);
        if (browserLang === "en") {
          setLocaleState("en");
        }
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      // Update HTML lang attribute
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLocale;
      }
    } catch {
      // Ignore errors
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translate(locale, key, params);
    },
    [locale]
  );

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      supportedLocales: SUPPORTED_LOCALES,
      isRtl: false,
    }),
    [locale, setLocale, t]
  );

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}

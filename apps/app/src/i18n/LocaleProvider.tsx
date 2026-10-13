import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { getLocales } from 'expo-localization';
import type { Locale as DateFnsLocale } from 'date-fns';
import { createI18n, resolveLocale, SUPPORTED_LOCALES, type LanguageSetting, type SupportedLocale } from '@cento/i18n';

interface LocaleContextValue {
  locale: SupportedLocale;
  dateFnsLocale: DateFnsLocale | null;
}

const LocaleContext = createContext<LocaleContextValue>({ locale: 'it', dateFnsLocale: null });

function deviceLocales(): string[] {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.languages?.length) {
    return [...navigator.languages];
  }
  return getLocales().map((l) => l.languageTag);
}

/**
 * Resolves the active locale from the Settings override and the device locale list, and
 * re-resolves whenever the override changes. Language changes take effect immediately.
 */
export function LocaleProvider({ language, children }: { language: LanguageSetting; children: React.ReactNode }) {
  const locale = useMemo(() => resolveLocale(language, deviceLocales()), [language]);
  const i18nRef = useRef(createI18n({ lng: locale }));
  const [dateFnsLocale, setDateFnsLocale] = useState<DateFnsLocale | null>(null);

  useEffect(() => {
    if (i18nRef.current.language !== locale) void i18nRef.current.changeLanguage(locale);
    let cancelled = false;
    void SUPPORTED_LOCALES[locale].dateFns().then((l) => {
      if (!cancelled) setDateFnsLocale(l);
    });
    if (Platform.OS === 'web' && typeof document !== 'undefined') document.documentElement.lang = locale;
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const value = useMemo(() => ({ locale, dateFnsLocale }), [locale, dateFnsLocale]);

  return (
    <LocaleContext.Provider value={value}>
      <I18nextProvider i18n={i18nRef.current}>{children}</I18nextProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

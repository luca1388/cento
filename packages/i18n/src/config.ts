import type { Locale as DateFnsLocale } from 'date-fns';

/**
 * The single list of supported locales. Everything else (language picker, detection,
 * date formatting, widget snapshot) is derived from this object. No other file enumerates languages.
 */
export const SUPPORTED_LOCALES = {
  it: { label: 'Italiano', dateFns: () => import('date-fns/locale/it').then((m) => m.it) },
  en: { label: 'English', dateFns: () => import('date-fns/locale/en-GB').then((m) => m.enGB) },
} as const satisfies Record<string, { label: string; dateFns: () => Promise<DateFnsLocale> }>;

export type SupportedLocale = keyof typeof SUPPORTED_LOCALES;
export const DEFAULT_LOCALE: SupportedLocale = 'it';
export const LOCALE_CODES = Object.keys(SUPPORTED_LOCALES) as SupportedLocale[];

/** The Settings value: 'system' re-evaluates the device locale on every launch. */
export type LanguageSetting = 'system' | SupportedLocale;

export function isSupportedLocale(code: string): code is SupportedLocale {
  return code in SUPPORTED_LOCALES;
}

/**
 * override != 'system' → use override
 * else → first device locale whose language subtag is supported, else DEFAULT_LOCALE
 */
export function resolveLocale(override: LanguageSetting, deviceLocales: readonly string[]): SupportedLocale {
  if (override !== 'system') return override;
  for (const tag of deviceLocales) {
    const lang = tag.toLowerCase().split(/[-_]/)[0] ?? '';
    if (isSupportedLocale(lang)) return lang;
  }
  return DEFAULT_LOCALE;
}

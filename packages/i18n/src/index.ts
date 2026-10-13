import i18next, { type i18n as I18nInstance } from 'i18next';
import it from './locales/it.json';
import en from './locales/en.json';
import { DEFAULT_LOCALE, LOCALE_CODES, type SupportedLocale } from './config';

export * from './config';
export type { TranslationKey } from './keys';

/** i18next resources derived from the catalogs; flat keys with a `.` separator disabled. */
export const RESOURCES: Record<SupportedLocale, { translation: Record<string, string> }> = {
  it: { translation: it },
  en: { translation: en },
};

export interface CreateI18nOptions {
  lng: SupportedLocale;
}

/**
 * Creates a configured i18next instance. Keys are flat strings (`upcoming.group.today`), so
 * keySeparator is turned off; plurals use `_one` / `_other` suffixes.
 */
export function createI18n(opts: CreateI18nOptions): I18nInstance {
  const instance = i18next.createInstance();
  void instance.init({
    lng: opts.lng,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: LOCALE_CODES,
    resources: RESOURCES,
    keySeparator: false,
    nsSeparator: false,
    interpolation: { escapeValue: false },
    returnNull: false,
    initAsync: false,
  });
  return instance;
}

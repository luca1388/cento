import { useTranslation } from 'react-i18next';
import type { TranslationKey } from '@cento/i18n';

/** Typed `t`: only keys from the Italian source catalog compile. */
export function useT() {
  const { t } = useTranslation();
  return (key: TranslationKey, options?: Record<string, unknown>) => t(key, options);
}

export type T = ReturnType<typeof useT>;

import type { Locale as DateFnsLocale } from 'date-fns';
import {
  buildWidgetSnapshot,
  planNotifications,
  type Celebration,
  type Person,
  type PlannedNotification,
  type WidgetSnapshot,
} from '@cento/core';
import { createI18n, resolveLocale, SUPPORTED_LOCALES, type SupportedLocale } from '@cento/i18n';
import type { Settings } from '@/storage/repository';
import { formatShortDate } from '@/utils/format';

export interface SyncInput {
  people: Person[];
  celebrations: Celebration[];
  settings: Settings;
  locale: SupportedLocale;
  dateFnsLocale: DateFnsLocale | null;
  today: string;
  t: (key: string, options?: Record<string, unknown>) => string;
}

/** Everything derived from the data that lives outside React: the widget snapshot and the notification plan. */
export function buildDerived(input: SyncInput): { snapshot: WidgetSnapshot; plan: PlannedNotification[] } {
  const common = {
    today: input.today,
    celebrations: input.celebrations,
    feb29Policy: input.settings.feb29Policy,
    includeNameDays: input.settings.showNameDays,
  };
  const formatDate = (d: string) => formatShortDate(d, input.dateFnsLocale);
  const snapshot = buildWidgetSnapshot(input.people, { t: input.t, formatDate, locale: input.locale }, common);
  const plan = input.settings.notificationsEnabled
    ? planNotifications(input.people, {
        ...common,
        notificationTime: input.settings.notificationTime,
        defaultCelebrationOffsets: input.settings.defaultCelebrationOffsets,
        formatDate,
        t: input.t,
      })
    : [];
  return { snapshot, plan };
}

/**
 * Builds the i18n pieces without React, for the background task. Mirrors LocaleProvider.
 */
export async function headlessLocale(settings: Settings, deviceLocales: string[]) {
  const locale = resolveLocale(settings.language, deviceLocales);
  const i18n = createI18n({ lng: locale });
  const dateFnsLocale = await SUPPORTED_LOCALES[locale].dateFns();
  return { locale, dateFnsLocale, t: (k: string, o?: Record<string, unknown>) => i18n.t(k, o) as string };
}

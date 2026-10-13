import { format as dfFormat, parseISO } from 'date-fns';
import type { Locale as DateFnsLocale } from 'date-fns';
import type { ISODate, MonthDay } from '@cento/core';

/** "mer 15 ott" / "Wed 15 Oct". Never hand-formatted. */
export function formatShortDate(date: ISODate, locale: DateFnsLocale | null): string {
  return dfFormat(parseISO(date), 'EEE d MMM', locale ? { locale } : undefined);
}

/** "15 ottobre" / "15 October". */
export function formatDayMonth(md: MonthDay, locale: DateFnsLocale | null): string {
  const d = new Date(2000, md.month - 1, md.day);
  return dfFormat(d, 'd MMMM', locale ? { locale } : undefined);
}

/** "15 ottobre 1997" / "15 October 1997". */
export function formatLongDate(date: ISODate, locale: DateFnsLocale | null): string {
  return dfFormat(parseISO(date), 'd MMMM yyyy', locale ? { locale } : undefined);
}

export function monthNames(locale: DateFnsLocale | null): string[] {
  return Array.from({ length: 12 }, (_, i) => dfFormat(new Date(2000, i, 1), 'MMMM', locale ? { locale } : undefined));
}

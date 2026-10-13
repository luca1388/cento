/**
 * Relative-day phrasing shared by list rows, notifications and the widget snapshot.
 * The catalog function is injected so core stays free of i18n dependencies.
 */
export type Translate = (key: string, options?: Record<string, unknown>) => string;

export function relativeDays(daysUntil: number, t: Translate): string {
  if (daysUntil <= 0) return t('relative.today');
  if (daysUntil === 1) return t('relative.tomorrow');
  return t('relative.inDays', { count: daysUntil });
}

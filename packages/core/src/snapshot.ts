import { addDays, daysBetween } from './dates';
import { buildUpcomingEvents, type BuildEventsOptions } from './events';
import { relativeDays, type Translate } from './relative';
import { buildBirthdayWidgetModel, type BirthdayWidgetModel } from './birthdayWidget';
import type { EventKind, ISODate, Person } from './types';

/**
 * Pre-rendered, day-indexed widget snapshot. The native widgets (SwiftUI / Glance) only pick the
 * entry for the current date and show the strings as they are: no translations live in native code.
 */
export interface WidgetItem {
  id: string;
  personId: string;
  kind: EventKind;
  name: string;
  /** Lock-screen sizes: "Giulia · 3 giorni". */
  short: string;
  /** Home-screen sizes: "Tra 3 giorni · compie 29 anni". */
  long: string;
  /** Kept for backwards compatibility with the first snapshot shape; same as `long`. */
  line: string;
  deepLink: string;
}

export interface WidgetDay {
  date: ISODate;
  headline: string;
  items: WidgetItem[];
  birthdayWidget: BirthdayWidgetModel;
}

export interface WidgetSnapshot {
  locale: string;
  generatedAt: ISODate;
  days: WidgetDay[];
}

export interface SnapshotFormatters {
  t: Translate;
  /** Short localized date, e.g. "sab 18 ott". */
  formatDate: (date: ISODate) => string;
  formatWidgetDate?: (date: ISODate) => string;
  formatWidgetMonth?: (date: ISODate) => string;
  locale: string;
}

export interface BuildSnapshotOptions extends Omit<BuildEventsOptions, 'today'> {
  today: ISODate;
  /** Days ahead to pre-render (default 14). */
  horizonDays?: number;
  /** Max items per day entry (default 10). */
  maxItems?: number;
  deepLinkScheme?: string;
}

export function buildWidgetSnapshot(people: Person[], fmt: SnapshotFormatters, opts: BuildSnapshotOptions): WidgetSnapshot {
  const horizon = opts.horizonDays ?? 14;
  const maxItems = opts.maxItems ?? 10;
  const scheme = opts.deepLinkScheme ?? 'cento';
  const days: WidgetDay[] = [];

  for (let i = 0; i < horizon; i++) {
    const date = addDays(opts.today, i);
    const events = buildUpcomingEvents(people, { ...opts, today: date }).slice(0, maxItems);
    const items: WidgetItem[] = events.map((ev) => {
      const when = relativeDays(daysBetween(date, ev.date), fmt.t);
      const firstName = ev.personName.split(/\s+/)[0] ?? ev.personName;
      let detail: string;
      if (ev.kind === 'birthday') {
        detail = ev.age !== undefined ? fmt.t('event.turns', { count: ev.age }) : fmt.t('event.birthday');
      } else if (ev.kind === 'nameday') {
        detail = fmt.t('event.nameday');
      } else {
        detail = fmt.t('event.celebration');
      }
      const long = `${when} · ${detail}`;
      const shortWhen = ev.daysUntil <= 0 ? fmt.t('relative.today') : fmt.t('relative.daysShort', { count: ev.daysUntil });
      const short = `${firstName} · ${shortWhen}`;
      return {
        id: ev.id,
        personId: ev.personId,
        kind: ev.kind,
        name: ev.personName,
        short,
        long,
        line: long,
        deepLink: `${scheme}://person/${ev.personId}`,
      };
    });
    const first = items[0];
    const headline = first
      ? first.kind === 'celebration'
        ? fmt.t('widget.headlineCelebration', { name: first.name.split(/\s+/)[0], date: fmt.formatDate(date) })
        : fmt.t('widget.headlineNext')
      : fmt.t('widget.headlineEmpty');
    days.push({
      date,
      headline,
      items,
      birthdayWidget: buildBirthdayWidgetModel(people, {
        today: date,
        locale: fmt.locale,
        t: fmt.t,
        formatDate: fmt.formatWidgetDate ?? fmt.formatDate,
        formatMonth: fmt.formatWidgetMonth,
        feb29Policy: opts.feb29Policy,
      }),
    });
  }

  return { locale: fmt.locale, generatedAt: opts.today, days };
}

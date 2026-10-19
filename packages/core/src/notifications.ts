import { addDays, compareISODate, daysBetween } from './dates';
import { buildUpcomingEvents, type BuildEventsOptions } from './events';
import { relativeDays, type Translate } from './relative';
import type { EventKind, ISODate, Person } from './types';

/**
 * One local notification to schedule. Everything is already localized: the scheduler only hands these
 * to the OS. When the language changes the app cancels everything and rebuilds the plan.
 */
export interface PlannedNotification {
  /** Stable id: `${kind}:${personId}:${date}:${offset}` */
  id: string;
  personId: string;
  kind: EventKind | 'prompt';
  fireDate: ISODate;
  /** HH:MM local time. */
  fireTime: string;
  title: string;
  body: string;
  deepLink: string;
}

export interface PlanOptions extends BuildEventsOptions {
  /** Time of day for reminders, HH:MM (Settings). */
  notificationTime: string;
  /** Default lead times for celebrations when the celebration has none. */
  defaultCelebrationOffsets?: number[];
  /** Max notifications to keep (iOS allows 64 pending). Default 60. */
  limit?: number;
  deepLinkScheme?: string;
  /** Short localized date for bodies. */
  formatDate: (date: ISODate) => string;
  t: Translate;
}

function minusHours(time: string, hours: number): string | null {
  const [h, m] = time.split(':').map(Number);
  if (h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m)) return null;
  const hh = h - hours;
  if (hh < 0) return null;
  return `${hh < 10 ? '0' : ''}${hh}:${m < 10 ? '0' : ''}${m}`;
}

/**
 * Builds the nearest batch of notifications for every person: birthday offsets, celebration offsets
 * (plus two hours before a timed party), the name-day morning reminder, and the "What did you give?"
 * prompt the day after a birthday or celebration.
 */
export function planNotifications(people: Person[], opts: PlanOptions): PlannedNotification[] {
  const scheme = opts.deepLinkScheme ?? 'cento';
  const time = opts.notificationTime;
  const out: PlannedNotification[] = [];
  const byId = new Map(people.map((p) => [p.id, p]));
  const events = buildUpcomingEvents(people, opts);

  for (const ev of events) {
    const person = byId.get(ev.personId);
    if (!person) continue;
    const firstName = person.firstName || person.name;
    const link = `${scheme}://person/${person.id}`;

    if (ev.kind === 'birthday') {
      for (const offset of new Set(person.reminderOffsets)) {
        const fireDate = addDays(ev.date, -offset);
        if (compareISODate(fireDate, opts.today) < 0) continue;
        const title =
          offset === 0
            ? opts.t('notifications.birthday.title', { name: firstName })
            : opts.t('notifications.birthdaySoon.title', { name: firstName, when: relativeDays(offset, opts.t).toLowerCase() });
        const body =
          offset > 0
            ? opts.t('notifications.birthdaySoon.body', { date: opts.formatDate(ev.date) })
            : ev.age !== undefined
              ? opts.t('notifications.birthday.body', { count: ev.age, date: opts.formatDate(ev.date) })
              : opts.t('notifications.birthday.bodyNoAge', { date: opts.formatDate(ev.date) });
        out.push({
          id: `birthday:${person.id}:${ev.date}:${offset}`,
          personId: person.id,
          kind: 'birthday',
          fireDate,
          fireTime: time,
          title,
          body,
          deepLink: link,
        });
      }
      // The day after: what did you give?
      out.push({
        id: `prompt:${person.id}:${ev.date}:birthday`,
        personId: person.id,
        kind: 'prompt',
        fireDate: addDays(ev.date, 1),
        fireTime: time,
        title: opts.t('notifications.whatDidYouGive', { name: firstName }),
        body: opts.t('notifications.whatDidYouGive.body'),
        deepLink: `${scheme}://person/${person.id}/record?occasion=birthday&year=${ev.date.slice(0, 4)}`,
      });
    } else if (ev.kind === 'nameday') {
      out.push({
        id: `nameday:${person.id}:${ev.date}:0`,
        personId: person.id,
        kind: 'nameday',
        fireDate: ev.date,
        fireTime: time,
        title: opts.t('notifications.nameday.title', { name: firstName }),
        body: opts.t('notifications.nameday.body'),
        deepLink: link,
      });
    } else if (ev.kind === 'celebration' && ev.celebration) {
      const c = (opts.celebrations ?? []).find((x) => x.id === ev.celebration!.id);
      const offsets = c && c.reminderOffsets.length ? c.reminderOffsets : (opts.defaultCelebrationOffsets ?? [3, 0]);
      const place = c?.place ? ` · ${c.place}` : '';
      for (const offset of new Set(offsets)) {
        const fireDate = addDays(ev.date, -offset);
        if (compareISODate(fireDate, opts.today) < 0) continue;
        out.push({
          id: `celebration:${person.id}:${ev.date}:${offset}`,
          personId: person.id,
          kind: 'celebration',
          fireDate,
          fireTime: time,
          title: opts.t('notifications.celebration.title', { name: firstName, when: relativeDays(offset, opts.t).toLowerCase() }),
          body: `${opts.formatDate(ev.date)}${c?.time ? ` · ${c.time}` : ''}${place}`,
          deepLink: link,
        });
      }
      if (c?.time) {
        const before = minusHours(c.time, 2);
        if (before) {
          out.push({
            id: `celebration:${person.id}:${ev.date}:2h`,
            personId: person.id,
            kind: 'celebration',
            fireDate: ev.date,
            fireTime: before,
            title: opts.t('notifications.celebrationSoon.title', { name: firstName }),
            body: `${c.time}${place}`,
            deepLink: link,
          });
        }
      }
    }
  }

  const limit = opts.limit ?? 60;
  return out
    .filter((n) => compareISODate(n.fireDate, opts.today) >= 0)
    .sort((a, b) => daysBetween(b.fireDate, a.fireDate) || a.fireTime.localeCompare(b.fireTime) || a.id.localeCompare(b.id))
    .slice(0, limit);
}

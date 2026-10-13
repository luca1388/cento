import { addDays, compareISODate, daysBetween, parseBirthDate, parseISODate } from './dates';
import { occurrenceInYear } from './events';
import type { Celebration, Feb29Policy, GiftRecord, ISODate, Occasion, Person } from './types';

/** "What did you give?" — asked the day after a birthday or celebration, until answered or skipped. */
export interface GiftPrompt {
  key: string; // `${personId}:${occasion}:${year}`
  personId: string;
  personName: string;
  occasion: Occasion;
  year: number;
  /** The event date that passed. */
  date: ISODate;
}

export interface PromptOptions {
  today: ISODate;
  feb29Policy?: Feb29Policy;
  /** How many days after the event the prompt stays visible (default 7). */
  windowDays?: number;
  dismissed?: readonly string[];
}

export function promptKey(personId: string, occasion: Occasion, year: number): string {
  return `${personId}:${occasion}:${year}`;
}

/**
 * Birthdays and celebrations that passed in the last `windowDays` days (starting the day after),
 * for which no gift record exists and the prompt was not dismissed.
 */
export function pendingGiftPrompts(
  people: Person[],
  celebrations: Celebration[],
  records: GiftRecord[],
  opts: PromptOptions,
): GiftPrompt[] {
  const window = opts.windowDays ?? 7;
  const dismissed = new Set(opts.dismissed ?? []);
  const answered = new Set(records.map((r) => promptKey(r.personId, r.occasion, r.year)));
  const out: GiftPrompt[] = [];
  const { year: thisYear } = parseISODate(opts.today);

  const consider = (person: Person, occasion: Occasion, date: ISODate) => {
    const gap = daysBetween(date, opts.today);
    if (gap < 1 || gap > window) return;
    const year = parseISODate(date).year;
    const key = promptKey(person.id, occasion, year);
    if (dismissed.has(key) || answered.has(key)) return;
    out.push({ key, personId: person.id, personName: person.name, occasion, year, date });
  };

  for (const person of people) {
    const b = parseBirthDate(person.birthDate);
    if (b) {
      for (const y of [thisYear - 1, thisYear]) {
        const date = occurrenceInYear({ month: b.month, day: b.day }, y, opts.feb29Policy ?? 'feb28');
        if (compareISODate(date, opts.today) < 0) consider(person, 'birthday', date);
      }
    }
  }
  const byId = new Map(people.map((p) => [p.id, p]));
  for (const c of celebrations) {
    const p = byId.get(c.personId);
    if (p && compareISODate(c.date, opts.today) < 0) consider(p, 'birthday', c.date);
  }
  // One prompt per person+year even when both the birthday and the party passed.
  const seen = new Set<string>();
  return out.filter((p) => (seen.has(p.key) ? false : (seen.add(p.key), true))).sort((a, b) => compareISODate(b.date, a.date));
}

/** The calendar date the prompt should be delivered as a notification: the day after the event. */
export function promptDeliveryDate(eventDate: ISODate): ISODate {
  return addDays(eventDate, 1);
}

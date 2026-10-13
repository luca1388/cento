import { addDays, compareISODate, daysBetween, isLeapYear, isoWeekday, parseBirthDate, parseISODate, toISODate } from './dates';
import type { Celebration, Feb29Policy, ISODate, MonthDay, Person, UpcomingEvent, UpcomingGroup } from './types';

export const MILESTONES = new Set([18, 30, 40, 50, 60, 70, 80, 90, 100]);

export function isMilestone(age: number | undefined): boolean {
  return age !== undefined && MILESTONES.has(age);
}

/**
 * The calendar date on which a month/day recurs in `year`, observing the Feb 29 policy.
 */
export function occurrenceInYear(md: MonthDay, year: number, policy: Feb29Policy = 'feb28'): ISODate {
  if (md.month === 2 && md.day === 29 && !isLeapYear(year)) {
    return policy === 'mar1' ? toISODate({ year, month: 3, day: 1 }) : toISODate({ year, month: 2, day: 28 });
  }
  return toISODate({ year, month: md.month, day: md.day });
}

/** Next occurrence of a month/day on or after `today`. */
export function nextOccurrence(md: MonthDay, today: ISODate, policy: Feb29Policy = 'feb28'): ISODate {
  const { year } = parseISODate(today);
  const thisYear = occurrenceInYear(md, year, policy);
  if (compareISODate(thisYear, today) >= 0) return thisYear;
  return occurrenceInYear(md, year + 1, policy);
}

/** Age the person turns on the birthday occurring in `occurrenceYear`; undefined when the birth year is unknown. */
export function ageOn(birthDate: string, occurrenceYear: number): number | undefined {
  const parsed = parseBirthDate(birthDate);
  if (!parsed || parsed.year === null) return undefined;
  const age = occurrenceYear - parsed.year;
  return age >= 0 ? age : undefined;
}

export interface BuildEventsOptions {
  today: ISODate;
  feb29Policy?: Feb29Policy;
  /** When false, name-day events are not produced (Settings → name days off). */
  includeNameDays?: boolean;
  celebrations?: Celebration[];
}

/**
 * Normalises people (and their celebrations) into the next occurrence of every event kind,
 * sorted by days until, then by name.
 */
export function buildUpcomingEvents(people: Person[], opts: BuildEventsOptions): UpcomingEvent[] {
  const policy = opts.feb29Policy ?? 'feb28';
  const includeNameDays = opts.includeNameDays ?? true;
  const celebrationsByPerson = new Map<string, Celebration[]>();
  for (const c of opts.celebrations ?? []) {
    const list = celebrationsByPerson.get(c.personId) ?? [];
    list.push(c);
    celebrationsByPerson.set(c.personId, list);
  }

  const events: UpcomingEvent[] = [];

  for (const person of people) {
    const birth = parseBirthDate(person.birthDate);
    if (birth) {
      const date = nextOccurrence({ month: birth.month, day: birth.day }, opts.today, policy);
      const year = parseISODate(date).year;
      const age = ageOn(person.birthDate, year);
      const celebration = (celebrationsByPerson.get(person.id) ?? []).find(
        (c) => c.year === year && compareISODate(c.date, opts.today) >= 0,
      );
      events.push({
        id: `birthday:${person.id}:${date}`,
        personId: person.id,
        personName: person.name,
        kind: 'birthday',
        date,
        daysUntil: daysBetween(opts.today, date),
        age,
        milestone: isMilestone(age),
        celebration: celebration
          ? { id: celebration.id, date: celebration.date, time: celebration.time, place: celebration.place }
          : undefined,
      });
    }

    if (includeNameDays && person.nameDay) {
      const date = nextOccurrence(person.nameDay, opts.today, policy);
      events.push({
        id: `nameday:${person.id}:${date}`,
        personId: person.id,
        personName: person.name,
        kind: 'nameday',
        date,
        daysUntil: daysBetween(opts.today, date),
        milestone: false,
      });
    }

    for (const c of celebrationsByPerson.get(person.id) ?? []) {
      if (compareISODate(c.date, opts.today) < 0) continue;
      events.push({
        id: `celebration:${person.id}:${c.date}`,
        personId: person.id,
        personName: person.name,
        kind: 'celebration',
        date: c.date,
        daysUntil: daysBetween(opts.today, c.date),
        milestone: false,
        celebration: { id: c.id, date: c.date, time: c.time, place: c.place },
      });
    }
  }

  return sortEvents(events);
}

const KIND_ORDER: Record<UpcomingEvent['kind'], number> = { birthday: 0, celebration: 1, nameday: 2 };

export function sortEvents(events: UpcomingEvent[]): UpcomingEvent[] {
  return [...events].sort(
    (a, b) => a.daysUntil - b.daysUntil || KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.personName.localeCompare(b.personName),
  );
}

/**
 * Groups an event into Today / This week / This month / Later.
 * "This week" ends on the coming Sunday; "this month" ends on the last day of the current month.
 */
export function groupOf(event: UpcomingEvent, today: ISODate): UpcomingGroup {
  if (event.daysUntil <= 0) return 'today';
  const daysToSunday = 7 - isoWeekday(today);
  if (event.daysUntil <= daysToSunday) return 'week';
  const t = parseISODate(today);
  const e = parseISODate(event.date);
  if (e.year === t.year && e.month === t.month) return 'month';
  return 'later';
}

export interface EventGroup {
  group: UpcomingGroup;
  events: UpcomingEvent[];
}

export function groupEvents(events: UpcomingEvent[], today: ISODate): EventGroup[] {
  const order: UpcomingGroup[] = ['today', 'week', 'month', 'later'];
  const buckets = new Map<UpcomingGroup, UpcomingEvent[]>();
  for (const ev of sortEvents(events)) {
    const g = groupOf(ev, today);
    const list = buckets.get(g) ?? [];
    list.push(ev);
    buckets.set(g, list);
  }
  return order.filter((g) => buckets.has(g)).map((g) => ({ group: g, events: buckets.get(g)! }));
}

/** The nearest Saturday on or after a date (default celebration date suggestion). */
export function nearestWeekendOnOrAfter(date: ISODate): ISODate {
  const wd = isoWeekday(date);
  if (wd === 6 || wd === 7) return date;
  return addDays(date, 6 - wd);
}

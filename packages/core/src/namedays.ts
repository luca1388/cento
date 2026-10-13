import type { MonthDay } from './types';
import itCalendar from './namedays/it.json';
import itPreferred from './namedays/it.preferred.json';

/** Calendar JSON shape: `{ "MM-DD": ["Giulia", "Giuliana", ...] }`. */
export type NameDayCalendar = Record<string, string[]>;
/** For names with several dates: the one to suggest first. */
export type NameDayPreferred = Record<string, string>;

export type NameDayCountry = 'it';

const CALENDARS: Record<NameDayCountry, { calendar: NameDayCalendar; preferred: NameDayPreferred }> = {
  it: { calendar: itCalendar as NameDayCalendar, preferred: itPreferred as NameDayPreferred },
};

export const NAMEDAY_COUNTRIES = Object.keys(CALENDARS) as NameDayCountry[];

/** Lower-cases and strips accents so "Nicolò" and "nicolo" match. */
export function foldName(name: string): string {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

export function parseMonthDayKey(key: string): MonthDay {
  const [m, d] = key.split('-');
  return { month: Number(m), day: Number(d) };
}

export function monthDayKey(md: MonthDay): string {
  const p = (n: number) => (n < 10 ? `0${n}` : String(n));
  return `${p(md.month)}-${p(md.day)}`;
}

export interface NameDayIndex {
  country: NameDayCountry;
  /** folded name → calendar keys, preferred date first, then calendar order. */
  byName: Map<string, string[]>;
  /** calendar key → names, as in the JSON. */
  byDate: NameDayCalendar;
}

const indexCache = new Map<NameDayCountry, NameDayIndex>();

/** Builds (and caches) the reverse index `name → [dates]` for a country calendar. */
export function getNameDayIndex(country: NameDayCountry = 'it'): NameDayIndex {
  const cached = indexCache.get(country);
  if (cached) return cached;
  const { calendar, preferred } = CALENDARS[country];
  const byName = new Map<string, string[]>();
  for (const key of Object.keys(calendar).sort()) {
    for (const name of calendar[key] ?? []) {
      const folded = foldName(name);
      const list = byName.get(folded) ?? [];
      if (!list.includes(key)) list.push(key);
      byName.set(folded, list);
    }
  }
  for (const [folded, key] of Object.entries(preferred)) {
    const list = byName.get(folded);
    if (!list) continue;
    const i = list.indexOf(key);
    if (i > 0) {
      list.splice(i, 1);
      list.unshift(key);
    }
  }
  const index: NameDayIndex = { country, byName, byDate: calendar };
  indexCache.set(country, index);
  return index;
}

export interface NameDaySuggestion {
  /** The date to pre-fill. */
  suggested: MonthDay;
  /** All candidate dates, suggested first. More than one means the user should see a "change date" link. */
  candidates: MonthDay[];
}

/**
 * Suggests a name day for a first name. Tries the full (folded) first name, then its first word
 * so "Anna Maria" still finds Anna. Returns null for unknown names.
 */
export function suggestNameDay(firstName: string, country: NameDayCountry = 'it'): NameDaySuggestion | null {
  const index = getNameDayIndex(country);
  const folded = foldName(firstName);
  if (!folded) return null;
  const attempts = [folded, folded.split(/\s+/)[0] ?? ''];
  for (const key of attempts) {
    const dates = index.byName.get(key);
    if (dates && dates.length > 0) {
      const candidates = dates.map(parseMonthDayKey);
      return { suggested: candidates[0]!, candidates };
    }
  }
  return null;
}

/** Names celebrated on a given day, for the "change date" picker. */
export function namesOn(md: MonthDay, country: NameDayCountry = 'it'): string[] {
  return getNameDayIndex(country).byDate[monthDayKey(md)] ?? [];
}

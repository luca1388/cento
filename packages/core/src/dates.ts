import type { ISODate, MonthDay } from './types';

const MS_PER_DAY = 86_400_000;

export interface CalendarDate {
  year: number;
  month: number; // 1..12
  day: number; // 1..31
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function toISODate(d: CalendarDate): ISODate {
  return `${d.year}-${pad2(d.month)}-${pad2(d.day)}`;
}

/**
 * Parses `YYYY-MM-DD` or `--MM-DD` (year unknown). Returns null when the string is not a valid date.
 */
export function parseBirthDate(value: string): { year: number | null; month: number; day: number } | null {
  const full = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (full) {
    const year = Number(full[1]);
    const month = Number(full[2]);
    const day = Number(full[3]);
    if (!isValidMonthDay(month, day, year)) return null;
    return { year, month, day };
  }
  const noYear = /^--(\d{2})-(\d{2})$/.exec(value);
  if (noYear) {
    const month = Number(noYear[1]);
    const day = Number(noYear[2]);
    // Feb 29 without a year is allowed: it is valid in leap years.
    if (!isValidMonthDay(month, day, 2000)) return null;
    return { year: null, month, day };
  }
  return null;
}

export function parseISODate(value: ISODate): CalendarDate {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) throw new Error(`Invalid ISO date: ${value}`);
  const d = { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  if (!isValidMonthDay(d.month, d.day, d.year)) throw new Error(`Invalid ISO date: ${value}`);
  return d;
}

export function isValidMonthDay(month: number, day: number, year: number): boolean {
  if (!Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= daysInMonth(year, month);
}

export function formatBirthDate(year: number | null, month: number, day: number): string {
  return year === null ? `--${pad2(month)}-${pad2(day)}` : toISODate({ year, month, day });
}

/** Days from `from` to `to` (positive when `to` is later). Uses UTC so DST never produces 23h days. */
export function daysBetween(from: ISODate, to: ISODate): number {
  const a = parseISODate(from);
  const b = parseISODate(to);
  const ua = Date.UTC(a.year, a.month - 1, a.day);
  const ub = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((ub - ua) / MS_PER_DAY);
}

export function addDays(date: ISODate, days: number): ISODate {
  const d = parseISODate(date);
  const t = new Date(Date.UTC(d.year, d.month - 1, d.day + days));
  return toISODate({ year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() });
}

/** Today's calendar date in the device's local time zone. */
export function todayISO(now: Date = new Date()): ISODate {
  return toISODate({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() });
}

/** ISO weekday: 1 = Monday … 7 = Sunday. */
export function isoWeekday(date: ISODate): number {
  const d = parseISODate(date);
  const w = new Date(Date.UTC(d.year, d.month - 1, d.day)).getUTCDay();
  return w === 0 ? 7 : w;
}

export function compareISODate(a: ISODate, b: ISODate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function monthDayOf(date: ISODate): MonthDay {
  const d = parseISODate(date);
  return { month: d.month, day: d.day };
}

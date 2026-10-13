import { addDays, daysBetween, isLeapYear, isoWeekday, parseBirthDate, formatBirthDate } from '../src';

describe('calendar dates', () => {
  it('parses full and year-less birth dates', () => {
    expect(parseBirthDate('1992-05-22')).toEqual({ year: 1992, month: 5, day: 22 });
    expect(parseBirthDate('--02-29')).toEqual({ year: null, month: 2, day: 29 });
    expect(parseBirthDate('2023-02-29')).toBeNull();
    expect(parseBirthDate('1992-13-01')).toBeNull();
    expect(parseBirthDate('nope')).toBeNull();
  });

  it('formats year-less dates back', () => {
    expect(formatBirthDate(null, 2, 9)).toBe('--02-09');
    expect(formatBirthDate(1990, 12, 25)).toBe('1990-12-25');
  });

  it('counts days without DST artefacts', () => {
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2); // DST change in Europe
    expect(daysBetween('2026-10-12', '2026-10-12')).toBe(0);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
  });

  it('adds days across month and year ends', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('knows leap years and weekdays', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2100)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isoWeekday('2026-10-12')).toBe(1); // Monday
    expect(isoWeekday('2026-10-18')).toBe(7); // Sunday
  });
});

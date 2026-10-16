import { buildBirthdayWidgetModel, type Person } from '../src';

const t = (key: string, options?: Record<string, unknown>) => {
  if (key === 'relative.today') return 'Oggi';
  if (key === 'relative.tomorrow') return 'Domani';
  if (key === 'relative.inDays') return `Tra ${options?.count} giorni`;
  if (key === 'event.turns') return `compie ${options?.count} anni`;
  return key;
};

function person(id: string, name: string, birthDate: string): Person {
  return {
    id,
    name,
    firstName: name.split(' ')[0]!,
    birthDate,
    nameDay: null,
    tags: [],
    reminderOffsets: [],
    createdAt: '',
    updatedAt: '',
  };
}

function model(people: Person[], today: string) {
  return buildBirthdayWidgetModel(people, {
    today,
    locale: 'it',
    t,
    formatDate: (date) => `date:${date}`,
    formatMonth: () => 'ottobre',
  });
}

describe('birthday widget model', () => {
  it('groups same-date birthdays alphabetically and tracks hidden people', () => {
    const result = model([
      person('a', 'Anna Riva', '1988-10-17'),
      person('l', 'Luigi Gandini', '1981-10-17'),
      person('m', 'Marta Neri', '1990-10-17'),
      person('s', 'Simone Baraldi', '1980-10-25'),
    ], '2026-10-16');

    expect(result.hero).toMatchObject({ daysLeft: 1, relativeLabel: 'Domani', totalCount: 3, hiddenCount: 1 });
    expect(result.hero?.people.map((person) => person.name)).toEqual(['Anna Riva', 'Luigi Gandini']);
    expect(result.upcoming).toHaveLength(1);
    expect(result.upcoming[0]?.person.name).toBe('Simone Baraldi');
    expect(result.monthRemainingCount).toBe(4);
    expect(result.monthLabel).toBe('Ottobre');
  });

  it('merges duplicate normalized names and birthdays', () => {
    const result = model([
      person('one', ' Anna Riva ', '--10-17'),
      person('two', 'anna riva', '1990-10-17'),
    ], '2026-10-16');
    expect(result.hero?.totalCount).toBe(1);
  });

  it('does not merge February 29 with February 28 when both are observed on February 28', () => {
    const result = model([
      person('leap', 'Alex Rossi', '--02-29'),
      person('feb', 'Alex Rossi', '--02-28'),
    ], '2027-02-27');
    expect(result.hero?.totalCount).toBe(2);
  });

  it('uses the February 28 recurrence and omits unknown ages', () => {
    const result = model([person('p', 'Luca Verdi', '--02-29')], '2027-02-27');
    expect(result.hero).toMatchObject({ daysLeft: 1, dateLabel: 'date:2027-02-28', relativeLabel: 'Domani' });
    expect(result.hero?.people[0]).not.toHaveProperty('turningAge');
  });

  it('includes the turning age when the birth year is known', () => {
    const result = model([person('p', 'Luca Verdi', '1981-10-17')], '2026-10-16');
    expect(result.hero?.people[0]).toMatchObject({ turningAge: 45, ageLabel: 'compie 45 anni' });
  });

  it('uses today/full-ring and zero progress beyond thirty days', () => {
    expect(model([person('today', 'Ada Neri', '2000-10-16')], '2026-10-16').hero?.ringProgress).toBe(1);
    const distant = model([person('later', 'Ada Neri', '2000-12-03')], '2026-10-16');
    expect(distant.hero).toMatchObject({ daysLeft: 48, relativeLabel: 'date:2026-12-03', ringProgress: 0 });
  });

  it('uses an empty ring at exactly thirty days', () => {
    const result = model([person('p', 'Ada Neri', '2000-11-15')], '2026-10-16');
    expect(result.hero).toMatchObject({ daysLeft: 30, ringProgress: 0 });
  });

  it('returns an empty model when there are no birthdays', () => {
    expect(model([], '2026-10-16')).toMatchObject({ state: 'empty', upcoming: [], monthRemainingCount: 0 });
  });
});
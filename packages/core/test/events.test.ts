import {
  ageOn,
  buildUpcomingEvents,
  groupEvents,
  groupOf,
  nearestWeekendOnOrAfter,
  nextOccurrence,
  type Celebration,
  type Person,
} from '../src';

const TODAY = '2026-10-12'; // Monday

function person(p: Partial<Person> & Pick<Person, 'id' | 'name' | 'birthDate'>): Person {
  return {
    firstName: p.name.split(' ')[0]!,
    nameDay: null,
    tags: [],
    reminderOffsets: [7, 1, 0],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...p,
  };
}

describe('nextOccurrence', () => {
  it('returns today when the date is today', () => {
    expect(nextOccurrence({ month: 10, day: 12 }, TODAY)).toBe('2026-10-12');
  });
  it('rolls to next year when the date has passed', () => {
    expect(nextOccurrence({ month: 10, day: 11 }, TODAY)).toBe('2027-10-11');
  });
  it('observes Feb 29 per policy on non-leap years', () => {
    expect(nextOccurrence({ month: 2, day: 29 }, TODAY, 'feb28')).toBe('2027-02-28');
    expect(nextOccurrence({ month: 2, day: 29 }, TODAY, 'mar1')).toBe('2027-03-01');
    expect(nextOccurrence({ month: 2, day: 29 }, '2028-01-01')).toBe('2028-02-29');
  });
});

describe('ageOn', () => {
  it('computes the age turned and hides it when the year is unknown', () => {
    expect(ageOn('1997-10-15', 2026)).toBe(29);
    expect(ageOn('--10-15', 2026)).toBeUndefined();
  });
});

describe('buildUpcomingEvents', () => {
  const people = [
    person({ id: 'p1', name: 'Marta Rossi', birthDate: '1992-10-12' }),
    person({ id: 'p2', name: 'Giulia Bianchi', birthDate: '1997-10-15', nameDay: { month: 5, day: 22 } }),
    person({ id: 'p3', name: 'Nonna Pina', birthDate: '--10-14' }),
    person({ id: 'p4', name: 'Luca Verdi', birthDate: '1976-10-20' }),
  ];
  const celebrations: Celebration[] = [
    {
      id: 'c1',
      personId: 'p2',
      year: 2026,
      date: '2026-10-17',
      time: '19:30',
      place: 'Da Mario',
      checklist: [],
      reminderOffsets: [3, 0],
    },
  ];

  it('sorts by days until and attaches ages, milestones and celebrations', () => {
    const events = buildUpcomingEvents(people, { today: TODAY, celebrations });
    expect(events.map((e) => `${e.kind}:${e.personId}:${e.daysUntil}`)).toEqual([
      'birthday:p1:0',
      'birthday:p3:2',
      'birthday:p2:3',
      'celebration:p2:5',
      'birthday:p4:8',
      'nameday:p2:222',
    ]);
    const marta = events[0]!;
    expect(marta.age).toBe(34);
    expect(marta.milestone).toBe(false);
    const pina = events[1]!;
    expect(pina.age).toBeUndefined();
    const giulia = events[2]!;
    expect(giulia.celebration?.date).toBe('2026-10-17');
    const luca = events[4]!;
    expect(luca.age).toBe(50);
    expect(luca.milestone).toBe(true);
  });

  it('can hide name days', () => {
    const events = buildUpcomingEvents(people, { today: TODAY, includeNameDays: false });
    expect(events.some((e) => e.kind === 'nameday')).toBe(false);
  });

  it('skips celebrations in the past', () => {
    const past: Celebration = { ...celebrations[0]!, id: 'c0', date: '2026-10-01' };
    const events = buildUpcomingEvents(people, { today: TODAY, celebrations: [past] });
    expect(events.some((e) => e.kind === 'celebration')).toBe(false);
    expect(events.find((e) => e.personId === 'p2' && e.kind === 'birthday')?.celebration).toBeUndefined();
  });
});

describe('grouping', () => {
  it('buckets by today / this week / this month / later', () => {
    const people = [
      person({ id: 'a', name: 'A', birthDate: '--10-12' }),
      person({ id: 'b', name: 'B', birthDate: '--10-18' }), // Sunday of this week
      person({ id: 'c', name: 'C', birthDate: '--10-19' }), // next Monday, still October
      person({ id: 'd', name: 'D', birthDate: '--11-01' }),
    ];
    const events = buildUpcomingEvents(people, { today: TODAY });
    expect(events.map((e) => groupOf(e, TODAY))).toEqual(['today', 'week', 'month', 'later']);
    const groups = groupEvents(events, TODAY);
    expect(groups.map((g) => g.group)).toEqual(['today', 'week', 'month', 'later']);
  });
});

describe('nearestWeekendOnOrAfter', () => {
  it('moves a weekday to the coming Saturday and keeps weekends', () => {
    expect(nearestWeekendOnOrAfter('2026-10-14')).toBe('2026-10-17');
    expect(nearestWeekendOnOrAfter('2026-10-17')).toBe('2026-10-17');
    expect(nearestWeekendOnOrAfter('2026-10-18')).toBe('2026-10-18');
  });
});

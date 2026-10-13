import { buildICS, parseBackup, serializeBackup, type Person } from '../src';

const person: Person = {
  id: 'p1',
  name: 'Giulia Bianchi',
  firstName: 'Giulia',
  birthDate: '1997-10-15',
  nameDay: { month: 5, day: 22 },
  tags: ['friend'],
  reminderOffsets: [7, 0],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('backup', () => {
  it('round-trips through JSON', () => {
    const text = serializeBackup({ people: [person], celebrations: [], giftIdeas: [], giftRecords: [] }, '2026-10-13T08:00:00Z');
    const parsed = parseBackup(text);
    expect(parsed.people).toEqual([person]);
    expect(JSON.parse(text).app).toBe('cento');
  });

  it('rejects foreign files and drops rows pointing at unknown people', () => {
    expect(() => parseBackup('{}')).toThrow('not-cento');
    expect(() => parseBackup('nope')).toThrow('not-json');
    const text = serializeBackup({
      people: [person],
      celebrations: [{ id: 'c1', personId: 'ghost', year: 2026, date: '2026-10-17', checklist: [], reminderOffsets: [] }],
      giftIdeas: [],
      giftRecords: [],
    });
    expect(parseBackup(text).celebrations).toEqual([]);
  });

  it('builds a yearly-recurring ICS', () => {
    const ics = buildICS(
      {
        people: [person],
        celebrations: [
          {
            id: 'c1',
            personId: 'p1',
            year: 2026,
            date: '2026-10-17',
            time: '19:30',
            place: 'Da Mario',
            checklist: [],
            reminderOffsets: [],
          },
        ],
      },
      { birthday: (n) => `Compleanno di ${n}`, nameday: (n) => `Onomastico di ${n}`, celebration: (n) => `Festa di ${n}` },
      '2026-10-13T08:00:00.000Z',
    );
    expect(ics).toContain('DTSTART;VALUE=DATE:19971015');
    expect(ics).toContain('RRULE:FREQ=YEARLY');
    expect(ics).toContain('DTSTART;VALUE=DATE:19000522');
    expect(ics).toContain('DTSTART:20261017T193000');
    expect(ics).toContain('LOCATION:Da Mario');
    expect(ics.split('BEGIN:VEVENT')).toHaveLength(4);
  });
});

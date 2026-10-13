import { buildWidgetSnapshot, relativeDays, type Person } from '../src';

const t = (key: string, o?: Record<string, unknown>) => {
  const n = o?.count as number | undefined;
  switch (key) {
    case 'relative.today':
      return 'Oggi';
    case 'relative.tomorrow':
      return 'Domani';
    case 'relative.inDays':
      return `Tra ${n} giorni`;
    case 'relative.daysShort':
      return n === 1 ? '1 giorno' : `${n} giorni`;
    case 'event.turns':
      return n === 1 ? 'compie 1 anno' : `compie ${n} anni`;
    case 'event.birthday':
      return 'compleanno';
    case 'event.nameday':
      return 'onomastico';
    case 'event.celebration':
      return 'festa';
    case 'widget.headlineNext':
      return 'Prossimo compleanno';
    case 'widget.headlineEmpty':
      return 'Nessuna data';
    default:
      return key;
  }
};

describe('relativeDays', () => {
  it('phrases today, tomorrow and n days', () => {
    expect(relativeDays(0, t)).toBe('Oggi');
    expect(relativeDays(1, t)).toBe('Domani');
    expect(relativeDays(3, t)).toBe('Tra 3 giorni');
  });
});

describe('widget snapshot', () => {
  const people: Person[] = [
    {
      id: 'p2',
      name: 'Giulia Bianchi',
      firstName: 'Giulia',
      birthDate: '1997-10-15',
      nameDay: null,
      tags: [],
      reminderOffsets: [],
      createdAt: '',
      updatedAt: '',
    },
  ];

  it('pre-renders one localized entry per day so countdowns tick without the app', () => {
    const snap = buildWidgetSnapshot(people, { t, formatDate: (d) => d, locale: 'it' }, { today: '2026-10-12', horizonDays: 4 });
    expect(snap.locale).toBe('it');
    expect(snap.days).toHaveLength(4);
    expect(snap.days[0]!.items[0]!.long).toBe('Tra 3 giorni · compie 29 anni');
    expect(snap.days[0]!.items[0]!.short).toBe('Giulia · 3 giorni');
    expect(snap.days[1]!.items[0]!.long).toBe('Tra 2 giorni · compie 29 anni');
    expect(snap.days[3]!.items[0]!.long).toBe('Oggi · compie 29 anni');
    expect(snap.days[3]!.items[0]!.deepLink).toBe('cento://person/p2');
    expect(snap.days[0]!.headline).toBe('Prossimo compleanno');
  });
});

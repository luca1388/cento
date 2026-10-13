import { planNotifications, type Person } from '../src';

const t = (key: string, o?: Record<string, unknown>) => `${key}${o ? ' ' + JSON.stringify(o) : ''}`;

const giulia: Person = {
  id: 'p2',
  name: 'Giulia Bianchi',
  firstName: 'Giulia',
  birthDate: '1997-10-15',
  nameDay: { month: 10, day: 20 },
  tags: [],
  reminderOffsets: [7, 1, 0],
  createdAt: '',
  updatedAt: '',
};

describe('notification plan', () => {
  it('schedules offsets that are still ahead, the name day, the party and the day-after prompt', () => {
    const plan = planNotifications([giulia], {
      today: '2026-10-13',
      notificationTime: '09:00',
      formatDate: (d) => d,
      t,
      celebrations: [{ id: 'c1', personId: 'p2', year: 2026, date: '2026-10-17', time: '19:30', checklist: [], reminderOffsets: [3, 0] }],
    });
    const ids = plan.map((n) => `${n.id}@${n.fireDate} ${n.fireTime}`);
    expect(ids).toEqual(
      [
        'birthday:p2:2026-10-15:1@2026-10-14 09:00',
        'birthday:p2:2026-10-15:0@2026-10-15 09:00',
        'celebration:p2:2026-10-17:3@2026-10-14 09:00',
        'prompt:p2:2026-10-15:birthday@2026-10-16 09:00',
        'celebration:p2:2026-10-17:0@2026-10-17 09:00',
        'celebration:p2:2026-10-17:2h@2026-10-17 17:30',
        'nameday:p2:2026-10-20:0@2026-10-20 09:00',
      ].sort((a, b) => a.split('@')[1]!.localeCompare(b.split('@')[1]!) || a.localeCompare(b)),
    );
    expect(plan.find((n) => n.kind === 'prompt')?.deepLink).toBe('cento://person/p2/record?occasion=birthday&year=2026');
  });

  it('respects the limit', () => {
    const many = Array.from({ length: 40 }, (_, i) => ({ ...giulia, id: `p${i}`, nameDay: null }));
    expect(planNotifications(many, { today: '2026-10-13', notificationTime: '09:00', formatDate: (d) => d, t, limit: 10 })).toHaveLength(
      10,
    );
  });
});

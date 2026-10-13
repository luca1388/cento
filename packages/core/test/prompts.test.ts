import { pendingGiftPrompts, type Person } from '../src';

const p = (id: string, birthDate: string): Person => ({
  id,
  name: id,
  firstName: id,
  birthDate,
  nameDay: null,
  tags: [],
  reminderOffsets: [],
  createdAt: '',
  updatedAt: '',
});

describe('gift prompts', () => {
  it('asks the day after a birthday until answered or dismissed', () => {
    const people = [p('a', '1990-10-12'), p('b', '1990-10-13'), p('c', '1990-10-01'), p('d', '1990-10-07')];
    const today = '2026-10-13';
    const prompts = pendingGiftPrompts(people, [], [], { today });
    expect(prompts.map((x) => x.personId)).toEqual(['a', 'd']); // b is today, c is older than 7 days
    expect(prompts[0]!.key).toBe('a:birthday:2026');

    const answered = pendingGiftPrompts(people, [], [{ id: 'r', personId: 'a', year: 2026, occasion: 'birthday', title: 'Libro' }], {
      today,
    });
    expect(answered.map((x) => x.personId)).toEqual(['d']);

    const dismissed = pendingGiftPrompts(people, [], [], { today, dismissed: ['d:birthday:2026'] });
    expect(dismissed.map((x) => x.personId)).toEqual(['a']);
  });

  it('counts a party as the same occasion as the birthday', () => {
    const people = [p('a', '1990-10-05')];
    const prompts = pendingGiftPrompts(
      people,
      [{ id: 'c', personId: 'a', year: 2026, date: '2026-10-10', checklist: [], reminderOffsets: [] }],
      [],
      { today: '2026-10-13' },
    );
    expect(prompts).toHaveLength(1);
    expect(prompts[0]!.date).toBe('2026-10-10');
  });
});

import { suggestNameDay, type Person } from '@cento/core';

/** A few people for trying the app. Dates are relative to today so the list always has something near.
 *  Ids are fixed so adding the sample twice replaces instead of duplicating. */
export function samplePeople(today: Date): Person[] {
  const now = new Date().toISOString();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  const offset = (days: number) => {
    const t = new Date(y, m - 1, d + days);
    return `${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
  };
  const make = (name: string, birth: string, tags: string[]): Person => {
    const firstName = name.split(' ')[0]!;
    return {
      id: `sample_${firstName.toLowerCase()}`,
      name,
      firstName,
      birthDate: birth,
      nameDay: suggestNameDay(firstName)?.suggested ?? null,
      tags,
      reminderOffsets: [7, 1, 0],
      createdAt: now,
      updatedAt: now,
    };
  };
  return [
    make('Marta Rossi', `${y - 34}-${offset(0)}`, ['friend']),
    make('Giulia Bianchi', `${y - 29}-${offset(3)}`, ['friend']),
    make('Nonna Pina', `--${offset(6)}`, ['family']),
    make('Luca Verdi', `${y - 50}-${offset(12)}`, ['work']),
    make('Antonio Esposito', `${y - 41}-${offset(40)}`, ['neighbour']),
    make('Sofia Romano', `${y - 8}-${offset(75)}`, ['family']),
  ];
}

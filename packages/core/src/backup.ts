import { parseBirthDate } from './dates';
import type { Celebration, GiftIdea, GiftRecord, Person } from './types';

/** The export file. Also the only way data moves between devices: no server, ever. */
export interface BackupFile {
  app: 'cento';
  version: 1;
  exportedAt: string;
  people: Person[];
  celebrations: Celebration[];
  giftIdeas: GiftIdea[];
  giftRecords: GiftRecord[];
}

export interface BackupData {
  people: Person[];
  celebrations: Celebration[];
  giftIdeas: GiftIdea[];
  giftRecords: GiftRecord[];
}

export function serializeBackup(data: BackupData, exportedAt: string = new Date().toISOString()): string {
  const file: BackupFile = { app: 'cento', version: 1, exportedAt, ...data };
  return JSON.stringify(file, null, 2);
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

/**
 * Parses and validates a backup. Throws with a short reason on malformed input; unknown fields are kept
 * so a newer export still round-trips through an older app.
 */
export function parseBackup(text: string): BackupData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('not-json');
  }
  if (!isRecord(raw) || raw.app !== 'cento') throw new Error('not-cento');
  if (raw.version !== 1) throw new Error('unsupported-version');
  const arr = (key: string): unknown[] => (Array.isArray(raw[key]) ? (raw[key] as unknown[]) : []);

  const people = arr('people')
    .filter((p): p is Person => {
      if (!isRecord(p)) return false;
      return (
        typeof p.id === 'string' && typeof p.name === 'string' && typeof p.birthDate === 'string' && parseBirthDate(p.birthDate) !== null
      );
    })
    .map((p) => ({
      ...p,
      firstName: typeof p.firstName === 'string' ? p.firstName : (p.name.split(/\s+/)[0] ?? p.name),
      nameDay: isRecord(p.nameDay) ? (p.nameDay as Person['nameDay']) : null,
      tags: Array.isArray(p.tags) ? p.tags.filter((t): t is string => typeof t === 'string') : [],
      reminderOffsets: Array.isArray(p.reminderOffsets) ? p.reminderOffsets.filter((n): n is number => typeof n === 'number') : [],
      createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date().toISOString(),
      updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : new Date().toISOString(),
    }));
  const ids = new Set(people.map((p) => p.id));

  const celebrations = arr('celebrations')
    .filter(
      (c): c is Celebration =>
        isRecord(c) &&
        typeof c.id === 'string' &&
        typeof c.personId === 'string' &&
        ids.has(c.personId) &&
        typeof c.date === 'string' &&
        typeof c.year === 'number',
    )
    .map((c) => ({
      ...c,
      checklist: Array.isArray(c.checklist) ? c.checklist : [],
      reminderOffsets: Array.isArray(c.reminderOffsets) ? c.reminderOffsets : [],
    }));

  const giftIdeas = arr('giftIdeas').filter(
    (g): g is GiftIdea =>
      isRecord(g) && typeof g.id === 'string' && typeof g.personId === 'string' && ids.has(g.personId) && typeof g.title === 'string',
  );
  const giftRecords = arr('giftRecords').filter(
    (r): r is GiftRecord =>
      isRecord(r) &&
      typeof r.id === 'string' &&
      typeof r.personId === 'string' &&
      ids.has(r.personId) &&
      typeof r.title === 'string' &&
      typeof r.year === 'number',
  );

  return { people, celebrations, giftIdeas, giftRecords };
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export interface IcsLabels {
  birthday: (name: string) => string;
  nameday: (name: string) => string;
  celebration: (name: string) => string;
}

/**
 * iCalendar export: one yearly-recurring all-day event per birthday and name day, plus each planned
 * celebration as a one-off. Importable into Apple Calendar, Google Calendar, Outlook.
 */
export function buildICS(
  data: Pick<BackupData, 'people' | 'celebrations'>,
  labels: IcsLabels,
  stamp: string = new Date().toISOString(),
): string {
  const dtstamp = stamp.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cento//Birthdays//IT', 'CALSCALE:GREGORIAN'];
  const push = (fields: string[]) => {
    lines.push('BEGIN:VEVENT', ...fields, `DTSTAMP:${dtstamp}`, 'END:VEVENT');
  };
  for (const p of data.people) {
    const b = parseBirthDate(p.birthDate);
    if (b) {
      const year = b.year ?? 1900;
      const date = `${year}${pad2(b.month)}${pad2(b.day)}`;
      push([
        `UID:birthday-${p.id}@cento`,
        `SUMMARY:${icsEscape(labels.birthday(p.name))}`,
        `DTSTART;VALUE=DATE:${date}`,
        'RRULE:FREQ=YEARLY',
        'TRANSP:TRANSPARENT',
      ]);
    }
    if (p.nameDay) {
      const date = `1900${pad2(p.nameDay.month)}${pad2(p.nameDay.day)}`;
      push([
        `UID:nameday-${p.id}@cento`,
        `SUMMARY:${icsEscape(labels.nameday(p.name))}`,
        `DTSTART;VALUE=DATE:${date}`,
        'RRULE:FREQ=YEARLY',
        'TRANSP:TRANSPARENT',
      ]);
    }
  }
  const byId = new Map(data.people.map((p) => [p.id, p]));
  for (const c of data.celebrations) {
    const p = byId.get(c.personId);
    if (!p) continue;
    const date = c.date.replace(/-/g, '');
    const fields = [`UID:celebration-${c.id}@cento`, `SUMMARY:${icsEscape(labels.celebration(p.name))}`];
    if (c.time) {
      const [h, m] = c.time.split(':');
      fields.push(`DTSTART:${date}T${h}${m}00`);
    } else {
      fields.push(`DTSTART;VALUE=DATE:${date}`);
    }
    if (c.place) fields.push(`LOCATION:${icsEscape(c.place)}`);
    push(fields);
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

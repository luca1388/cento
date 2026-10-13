import type { BackupData, Celebration, Feb29Policy, GiftIdea, GiftRecord, NameDayCountry, Person } from '@cento/core';
import type { LanguageSetting } from '@cento/i18n';

export interface Settings {
  language: LanguageSetting;
  showNameDays: boolean;
  nameDayCountry: NameDayCountry;
  feb29Policy: Feb29Policy;
  linkPreview: boolean;
  defaultBirthdayOffsets: number[];
  defaultCelebrationOffsets: number[];
  /** HH:MM local time at which reminders fire. */
  notificationTime: string;
  notificationsEnabled: boolean;
  /** "What did you give?" prompts the user skipped: `${personId}:${occasion}:${year}`. */
  dismissedPrompts: string[];
  /** When the widget snapshot was last written (ISO datetime), for the Settings screen. */
  widgetUpdatedAt?: string | null;
}

export const DEFAULT_SETTINGS: Settings = {
  language: 'system',
  showNameDays: true,
  nameDayCountry: 'it',
  feb29Policy: 'feb28',
  linkPreview: false,
  defaultBirthdayOffsets: [7, 1, 0],
  defaultCelebrationOffsets: [3, 0],
  notificationTime: '09:00',
  notificationsEnabled: true,
  dismissedPrompts: [],
  widgetUpdatedAt: null,
};

export type ImportMode = 'merge' | 'replace';

/**
 * Local-first storage behind one small interface: SQLite on mobile, IndexedDB on web.
 * There is no network implementation and there never will be.
 */
export interface Repository {
  init(): Promise<void>;

  listPeople(): Promise<Person[]>;
  getPerson(id: string): Promise<Person | null>;
  savePerson(person: Person): Promise<void>;
  deletePerson(id: string): Promise<void>;

  listCelebrations(): Promise<Celebration[]>;
  saveCelebration(c: Celebration): Promise<void>;
  deleteCelebration(id: string): Promise<void>;

  listGiftIdeas(personId?: string): Promise<GiftIdea[]>;
  saveGiftIdea(g: GiftIdea): Promise<void>;
  deleteGiftIdea(id: string): Promise<void>;

  listGiftRecords(personId?: string): Promise<GiftRecord[]>;
  saveGiftRecord(r: GiftRecord): Promise<void>;
  deleteGiftRecord(id: string): Promise<void>;

  /** Everything, for the backup file. */
  exportAll(): Promise<BackupData>;
  /** Writes a parsed backup: `merge` upserts by id, `replace` clears first. */
  importAll(data: BackupData, mode: ImportMode): Promise<void>;

  getSettings(): Promise<Settings>;
  saveSettings(s: Settings): Promise<void>;

  /** Removes every row. Used by Settings → Delete all data. */
  clearAll(): Promise<void>;
}

export function mergeSettings(raw: Partial<Settings> | null | undefined): Settings {
  return { ...DEFAULT_SETTINGS, ...(raw ?? {}) };
}

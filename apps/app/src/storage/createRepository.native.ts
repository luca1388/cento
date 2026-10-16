import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import type { BackupData, Celebration, GiftIdea, GiftRecord, Person } from '@cento/core';
import { DEFAULT_SETTINGS, mergeSettings, withoutGiftContributors, type ImportMode, type Repository, type Settings } from './repository';

/**
 * SQLite repository (iOS / Android). Rich objects are stored as JSON documents in one column per
 * table, with the few columns needed for lookups kept as real columns. This keeps the schema small
 * while the data model is still moving; all reads, writes and sorting happen on the device.
 */
class SqliteRepository implements Repository {
  private db: SQLiteDatabase | null = null;

  private async conn(): Promise<SQLiteDatabase> {
    if (!this.db) this.db = await openDatabaseAsync('cento.db');
    return this.db;
  }

  async init(): Promise<void> {
    const db = await this.conn();
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS people (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, json TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS celebrations (id TEXT PRIMARY KEY NOT NULL, person_id TEXT NOT NULL, year INTEGER NOT NULL, json TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS gift_ideas (id TEXT PRIMARY KEY NOT NULL, person_id TEXT NOT NULL, created_at TEXT NOT NULL, json TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS gift_records (id TEXT PRIMARY KEY NOT NULL, person_id TEXT NOT NULL, year INTEGER NOT NULL, json TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, json TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS idx_celebrations_person ON celebrations(person_id);
      CREATE INDEX IF NOT EXISTS idx_gift_ideas_person ON gift_ideas(person_id);
      CREATE INDEX IF NOT EXISTS idx_gift_records_person ON gift_records(person_id);
    `);
  }

  private async rows<T>(sql: string, params: (string | number)[] = []): Promise<T[]> {
    const db = await this.conn();
    const out = await db.getAllAsync<{ json: string }>(sql, params);
    return out.map((r) => JSON.parse(r.json) as T);
  }

  async listPeople(): Promise<Person[]> {
    return this.rows<Person>('SELECT json FROM people ORDER BY name COLLATE NOCASE');
  }

  async getPerson(id: string): Promise<Person | null> {
    const db = await this.conn();
    const row = await db.getFirstAsync<{ json: string }>('SELECT json FROM people WHERE id = ?', [id]);
    return row ? (JSON.parse(row.json) as Person) : null;
  }

  async savePerson(person: Person): Promise<void> {
    const db = await this.conn();
    await db.runAsync('INSERT OR REPLACE INTO people (id, name, json) VALUES (?, ?, ?)', [person.id, person.name, JSON.stringify(person)]);
  }

  async deletePerson(id: string): Promise<void> {
    const db = await this.conn();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM people WHERE id = ?', [id]);
      await db.runAsync('DELETE FROM celebrations WHERE person_id = ?', [id]);
      await db.runAsync('DELETE FROM gift_ideas WHERE person_id = ?', [id]);
      await db.runAsync('DELETE FROM gift_records WHERE person_id = ?', [id]);
    });
  }

  async listCelebrations(): Promise<Celebration[]> {
    return this.rows<Celebration>('SELECT json FROM celebrations ORDER BY year');
  }

  async saveCelebration(c: Celebration): Promise<void> {
    const db = await this.conn();
    await db.runAsync('INSERT OR REPLACE INTO celebrations (id, person_id, year, json) VALUES (?, ?, ?, ?)', [
      c.id,
      c.personId,
      c.year,
      JSON.stringify(c),
    ]);
  }

  async deleteCelebration(id: string): Promise<void> {
    const db = await this.conn();
    await db.runAsync('DELETE FROM celebrations WHERE id = ?', [id]);
  }

  async listGiftIdeas(personId?: string): Promise<GiftIdea[]> {
    const ideas = personId
      ? this.rows<GiftIdea>('SELECT json FROM gift_ideas WHERE person_id = ? ORDER BY created_at DESC', [personId])
      : this.rows<GiftIdea>('SELECT json FROM gift_ideas ORDER BY created_at DESC');
    return (await ideas).map(withoutGiftContributors);
  }

  async saveGiftIdea(g: GiftIdea): Promise<void> {
    const db = await this.conn();
    const idea = withoutGiftContributors(g);
    await db.runAsync('INSERT OR REPLACE INTO gift_ideas (id, person_id, created_at, json) VALUES (?, ?, ?, ?)', [
      idea.id,
      idea.personId,
      idea.createdAt,
      JSON.stringify(idea),
    ]);
  }

  async deleteGiftIdea(id: string): Promise<void> {
    const db = await this.conn();
    await db.runAsync('DELETE FROM gift_ideas WHERE id = ?', [id]);
  }

  async listGiftRecords(personId?: string): Promise<GiftRecord[]> {
    return personId
      ? this.rows<GiftRecord>('SELECT json FROM gift_records WHERE person_id = ? ORDER BY year DESC', [personId])
      : this.rows<GiftRecord>('SELECT json FROM gift_records ORDER BY year DESC');
  }

  async deleteGiftRecord(id: string): Promise<void> {
    const db = await this.conn();
    await db.runAsync('DELETE FROM gift_records WHERE id = ?', [id]);
  }

  async exportAll(): Promise<BackupData> {
    const [people, celebrations, giftIdeas, giftRecords] = await Promise.all([
      this.listPeople(),
      this.listCelebrations(),
      this.listGiftIdeas(),
      this.listGiftRecords(),
    ]);
    return { people, celebrations, giftIdeas, giftRecords };
  }

  async importAll(data: BackupData, mode: ImportMode): Promise<void> {
    const db = await this.conn();
    await db.withTransactionAsync(async () => {
      if (mode === 'replace') {
        await db.execAsync('DELETE FROM people; DELETE FROM celebrations; DELETE FROM gift_ideas; DELETE FROM gift_records;');
      }
      for (const p of data.people)
        await db.runAsync('INSERT OR REPLACE INTO people (id, name, json) VALUES (?, ?, ?)', [p.id, p.name, JSON.stringify(p)]);
      for (const c of data.celebrations) {
        await db.runAsync('INSERT OR REPLACE INTO celebrations (id, person_id, year, json) VALUES (?, ?, ?, ?)', [
          c.id,
          c.personId,
          c.year,
          JSON.stringify(c),
        ]);
      }
      for (const g of data.giftIdeas) {
        const idea = withoutGiftContributors(g);
        await db.runAsync('INSERT OR REPLACE INTO gift_ideas (id, person_id, created_at, json) VALUES (?, ?, ?, ?)', [
          idea.id,
          idea.personId,
          idea.createdAt,
          JSON.stringify(idea),
        ]);
      }
      for (const r of data.giftRecords) {
        await db.runAsync('INSERT OR REPLACE INTO gift_records (id, person_id, year, json) VALUES (?, ?, ?, ?)', [
          r.id,
          r.personId,
          r.year,
          JSON.stringify(r),
        ]);
      }
    });
  }

  async saveGiftRecord(r: GiftRecord): Promise<void> {
    const db = await this.conn();
    await db.runAsync('INSERT OR REPLACE INTO gift_records (id, person_id, year, json) VALUES (?, ?, ?, ?)', [
      r.id,
      r.personId,
      r.year,
      JSON.stringify(r),
    ]);
  }

  async getSettings(): Promise<Settings> {
    const db = await this.conn();
    const row = await db.getFirstAsync<{ json: string }>('SELECT json FROM settings WHERE key = ?', ['settings']);
    return row ? mergeSettings(JSON.parse(row.json) as Partial<Settings>) : { ...DEFAULT_SETTINGS };
  }

  async saveSettings(s: Settings): Promise<void> {
    const db = await this.conn();
    await db.runAsync('INSERT OR REPLACE INTO settings (key, json) VALUES (?, ?)', ['settings', JSON.stringify(s)]);
  }

  async clearAll(): Promise<void> {
    const db = await this.conn();
    await db.execAsync('DELETE FROM people; DELETE FROM celebrations; DELETE FROM gift_ideas; DELETE FROM gift_records;');
  }
}

export function createRepository(): Repository {
  return new SqliteRepository();
}

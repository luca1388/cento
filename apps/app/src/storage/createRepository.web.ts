import type { BackupData, Celebration, GiftIdea, GiftRecord, Person } from '@cento/core';
import { DEFAULT_SETTINGS, mergeSettings, type ImportMode, type Repository, type Settings } from './repository';

const DB_NAME = 'cento';
const DB_VERSION = 1;
const STORES = ['people', 'celebrations', 'gift_ideas', 'gift_records', 'settings'] as const;
type StoreName = (typeof STORES)[number];

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/**
 * IndexedDB repository for the web app. Same shape as the SQLite one; the browser holds its own
 * copy of the data (the design document's export/import file moves data between devices).
 */
class IndexedDbRepository implements Repository {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    const open = indexedDB.open(DB_NAME, DB_VERSION);
    open.onupgradeneeded = () => {
      const db = open.result;
      if (!db.objectStoreNames.contains('people')) db.createObjectStore('people', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('celebrations')) {
        db.createObjectStore('celebrations', { keyPath: 'id' }).createIndex('personId', 'personId');
      }
      if (!db.objectStoreNames.contains('gift_ideas')) {
        db.createObjectStore('gift_ideas', { keyPath: 'id' }).createIndex('personId', 'personId');
      }
      if (!db.objectStoreNames.contains('gift_records')) {
        db.createObjectStore('gift_records', { keyPath: 'id' }).createIndex('personId', 'personId');
      }
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
    };
    this.db = await req(open);
  }

  private store(name: StoreName, mode: IDBTransactionMode = 'readonly') {
    if (!this.db) throw new Error('Repository not initialised');
    const tx = this.db.transaction(name, mode);
    return { tx, store: tx.objectStore(name) };
  }

  private async all<T>(name: StoreName): Promise<T[]> {
    const { store } = this.store(name);
    return (await req(store.getAll())) as T[];
  }

  private async byPerson<T>(name: StoreName, personId: string): Promise<T[]> {
    const { store } = this.store(name);
    return (await req(store.index('personId').getAll(personId))) as T[];
  }

  private async put(name: StoreName, value: unknown): Promise<void> {
    const { tx, store } = this.store(name, 'readwrite');
    store.put(value);
    await done(tx);
  }

  private async remove(name: StoreName, id: string): Promise<void> {
    const { tx, store } = this.store(name, 'readwrite');
    store.delete(id);
    await done(tx);
  }

  async listPeople(): Promise<Person[]> {
    const people = await this.all<Person>('people');
    return people.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getPerson(id: string): Promise<Person | null> {
    const { store } = this.store('people');
    return ((await req(store.get(id))) as Person | undefined) ?? null;
  }

  savePerson(person: Person): Promise<void> {
    return this.put('people', person);
  }

  async deletePerson(id: string): Promise<void> {
    if (!this.db) throw new Error('Repository not initialised');
    const tx = this.db.transaction(['people', 'celebrations', 'gift_ideas', 'gift_records'], 'readwrite');
    tx.objectStore('people').delete(id);
    for (const name of ['celebrations', 'gift_ideas', 'gift_records'] as const) {
      const idx = tx.objectStore(name).index('personId');
      const keys = await req(idx.getAllKeys(id));
      for (const k of keys) tx.objectStore(name).delete(k);
    }
    await done(tx);
  }

  async listCelebrations(): Promise<Celebration[]> {
    const list = await this.all<Celebration>('celebrations');
    return list.sort((a, b) => a.year - b.year);
  }

  saveCelebration(c: Celebration): Promise<void> {
    return this.put('celebrations', c);
  }

  deleteCelebration(id: string): Promise<void> {
    return this.remove('celebrations', id);
  }

  async listGiftIdeas(personId?: string): Promise<GiftIdea[]> {
    const list = personId ? await this.byPerson<GiftIdea>('gift_ideas', personId) : await this.all<GiftIdea>('gift_ideas');
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  saveGiftIdea(g: GiftIdea): Promise<void> {
    return this.put('gift_ideas', g);
  }

  deleteGiftIdea(id: string): Promise<void> {
    return this.remove('gift_ideas', id);
  }

  async listGiftRecords(personId?: string): Promise<GiftRecord[]> {
    const list = personId ? await this.byPerson<GiftRecord>('gift_records', personId) : await this.all<GiftRecord>('gift_records');
    return list.sort((a, b) => b.year - a.year);
  }

  deleteGiftRecord(id: string): Promise<void> {
    return this.remove('gift_records', id);
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
    if (!this.db) throw new Error('Repository not initialised');
    const names = ['people', 'celebrations', 'gift_ideas', 'gift_records'] as const;
    const tx = this.db.transaction(names, 'readwrite');
    if (mode === 'replace') for (const n of names) tx.objectStore(n).clear();
    for (const p of data.people) tx.objectStore('people').put(p);
    for (const c of data.celebrations) tx.objectStore('celebrations').put(c);
    for (const g of data.giftIdeas) tx.objectStore('gift_ideas').put(g);
    for (const r of data.giftRecords) tx.objectStore('gift_records').put(r);
    await done(tx);
  }

  saveGiftRecord(r: GiftRecord): Promise<void> {
    return this.put('gift_records', r);
  }

  async getSettings(): Promise<Settings> {
    const { store } = this.store('settings');
    const row = (await req(store.get('settings'))) as { key: string; value: Partial<Settings> } | undefined;
    return row ? mergeSettings(row.value) : { ...DEFAULT_SETTINGS };
  }

  saveSettings(s: Settings): Promise<void> {
    return this.put('settings', { key: 'settings', value: s });
  }

  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Repository not initialised');
    const tx = this.db.transaction(['people', 'celebrations', 'gift_ideas', 'gift_records'], 'readwrite');
    for (const name of ['people', 'celebrations', 'gift_ideas', 'gift_records'] as const) tx.objectStore(name).clear();
    await done(tx);
  }
}

export function createRepository(): Repository {
  return new IndexedDbRepository();
}

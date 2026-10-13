import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { BackupData, Celebration, GiftIdea, GiftRecord, Person } from '@cento/core';
import { createRepository } from './createRepository';
import { DEFAULT_SETTINGS, type ImportMode, type Repository, type Settings } from './repository';

interface DataContextValue {
  ready: boolean;
  people: Person[];
  celebrations: Celebration[];
  giftIdeas: GiftIdea[];
  giftRecords: GiftRecord[];
  settings: Settings;
  repository: Repository;
  savePerson: (p: Person) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  saveCelebration: (c: Celebration) => Promise<void>;
  deleteCelebration: (id: string) => Promise<void>;
  saveGiftIdea: (g: GiftIdea) => Promise<void>;
  deleteGiftIdea: (id: string) => Promise<void>;
  saveGiftRecord: (r: GiftRecord) => Promise<void>;
  deleteGiftRecord: (id: string) => Promise<void>;
  importBackup: (data: BackupData, mode: ImportMode) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const repoRef = useRef<Repository | null>(null);
  if (!repoRef.current) repoRef.current = createRepository();
  const repository = repoRef.current;

  const [ready, setReady] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([]);
  const [giftRecords, setGiftRecords] = useState<GiftRecord[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const refresh = useCallback(async () => {
    const [p, c, g, r] = await Promise.all([
      repository.listPeople(),
      repository.listCelebrations(),
      repository.listGiftIdeas(),
      repository.listGiftRecords(),
    ]);
    setPeople(p);
    setCelebrations(c);
    setGiftIdeas(g);
    setGiftRecords(r);
  }, [repository]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await repository.init();
      const s = await repository.getSettings();
      if (cancelled) return;
      setSettings(s);
      await refresh();
      if (!cancelled) setReady(true);
    })().catch((err) => console.error('Storage init failed', err));
    return () => {
      cancelled = true;
    };
  }, [repository, refresh]);

  const wrap = useCallback(
    <A extends unknown[]>(fn: (...args: A) => Promise<void>) =>
      async (...args: A) => {
        await fn(...args);
        await refresh();
      },
    [refresh],
  );

  const savePerson = useMemo(() => wrap((p: Person) => repository.savePerson(p)), [wrap, repository]);
  const deletePerson = useMemo(() => wrap((id: string) => repository.deletePerson(id)), [wrap, repository]);
  const saveCelebration = useMemo(() => wrap((c: Celebration) => repository.saveCelebration(c)), [wrap, repository]);
  const deleteCelebration = useMemo(() => wrap((id: string) => repository.deleteCelebration(id)), [wrap, repository]);
  const saveGiftIdea = useMemo(() => wrap((g: GiftIdea) => repository.saveGiftIdea(g)), [wrap, repository]);
  const deleteGiftIdea = useMemo(() => wrap((id: string) => repository.deleteGiftIdea(id)), [wrap, repository]);
  const saveGiftRecord = useMemo(() => wrap((r: GiftRecord) => repository.saveGiftRecord(r)), [wrap, repository]);
  const deleteGiftRecord = useMemo(() => wrap((id: string) => repository.deleteGiftRecord(id)), [wrap, repository]);
  const importBackup = useMemo(() => wrap((d: BackupData, m: ImportMode) => repository.importAll(d, m)), [wrap, repository]);
  const clearAll = useMemo(() => wrap(() => repository.clearAll()), [wrap, repository]);

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const next = { ...settingsRef.current, ...patch };
      settingsRef.current = next;
      setSettings(next);
      await repository.saveSettings(next);
    },
    [repository],
  );

  const value = useMemo<DataContextValue>(
    () => ({
      ready,
      people,
      celebrations,
      giftIdeas,
      giftRecords,
      settings,
      repository,
      savePerson,
      deletePerson,
      saveCelebration,
      deleteCelebration,
      saveGiftIdea,
      deleteGiftIdea,
      saveGiftRecord,
      deleteGiftRecord,
      importBackup,
      updateSettings,
      clearAll,
      refresh,
    }),
    [
      ready,
      people,
      celebrations,
      giftIdeas,
      giftRecords,
      settings,
      repository,
      savePerson,
      deletePerson,
      saveCelebration,
      deleteCelebration,
      saveGiftIdea,
      deleteGiftIdea,
      saveGiftRecord,
      deleteGiftRecord,
      importBackup,
      updateSettings,
      clearAll,
      refresh,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}

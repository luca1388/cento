import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { goBack } from '@/utils/nav';
import { suggestNameDay, type Person } from '@cento/core';
import { Avatar, Body, Button, Screen } from '@/components/ui';
import { useData } from '@/storage/DataProvider';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { radius, space, useTheme } from '@/theme';
import { contactsSupported, loadContactsWithBirthday, type ContactCandidate } from '@/contacts/importContacts';
import { formatDayMonth } from '@/utils/format';

function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .sort()
    .join(' ');
}

function namesAreSimilar(first: string, second: string): boolean {
  if (first === second) return true;
  const shorter = first.length <= second.length ? first : second;
  const longer = first.length <= second.length ? second : first;
  if (shorter.length < 5 || longer.length - shorter.length > 2) return false;

  let previous = Array.from({ length: shorter.length + 1 }, (_, index) => index);
  for (let row = 1; row <= longer.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= shorter.length; column += 1) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (longer[row - 1] === shorter[column - 1] ? 0 : 1)
      );
    }
    previous = current;
  }
  return previous[shorter.length] <= Math.min(2, Math.floor(shorter.length * 0.15));
}

function birthdaysCouldMatch(first: string, second: string): boolean {
  if (first.slice(-5) !== second.slice(-5)) return false;
  return first.startsWith('--') || second.startsWith('--') || first === second;
}

export default function ImportContactsScreen() {
  const theme = useTheme();
  const t = useT();
  const { dateFnsLocale } = useLocale();
  const { people, settings, repository, refresh } = useData();
  const [state, setState] = useState<'loading' | 'denied' | 'ready' | 'error'>(
    contactsSupported ? 'loading' : 'ready'
  );
  const [contacts, setContacts] = useState<ContactCandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const existingIds = useMemo(() => new Set(people.map((p) => p.id)), [people]);
  const possibleDuplicates = useMemo(() => {
    const suggestions = new Map<string, string>();
    for (const contact of contacts) {
      const candidateName = normalizeName(contact.name);
      const birthdayMatches = people.filter(
        (person) =>
          person.id !== `contact_${contact.id}` &&
          birthdaysCouldMatch(contact.birthDate, person.birthDate)
      );
      const match =
        birthdayMatches.find((person) => candidateName === normalizeName(person.name)) ??
        birthdayMatches.find((person) => namesAreSimilar(candidateName, normalizeName(person.name)));
      if (match) suggestions.set(contact.id, match.name);
    }
    return suggestions;
  }, [contacts, people]);

  useEffect(() => {
    if (!contactsSupported) return;
    void loadContactsWithBirthday()
      .then(({ granted, contacts: list }) => {
        setContacts(list);
        setSelected(new Set(list.filter((c) => !existingIds.has(`contact_${c.id}`)).map((c) => c.id)));
        setState(granted ? 'ready' : 'denied');
      })
      .catch(() => setState('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function importSelected() {
    setBusy(true);
    const now = new Date().toISOString();
    for (const c of contacts) {
      if (!selected.has(c.id)) continue;
      const person: Person = {
        id: `contact_${c.id}`,
        name: c.name,
        firstName: c.firstName,
        birthDate: c.birthDate,
        nameDay: suggestNameDay(c.firstName, settings.nameDayCountry)?.suggested ?? null,
        tags: [],
        reminderOffsets: settings.defaultBirthdayOffsets,
        createdAt: now,
        updatedAt: now,
      };
      await repository.savePerson(person);
    }
    await refresh();
    setBusy(false);
    goBack();
  }

  const toggle = (id: string) =>
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 48 }}>
        <Body muted>{t('contacts.hint')}</Body>
        {!contactsSupported ? <Body>{t('contacts.unavailable')}</Body> : null}
        {state === 'loading' ? <ActivityIndicator color={theme.accent} /> : null}
        {state === 'denied' ? <Body>{t('contacts.permissionDenied')}</Body> : null}
        {state === 'error' ? <Body>{t('contacts.loadError')}</Body> : null}
        {state === 'ready' && contactsSupported && contacts.length === 0 ? <Body>{t('contacts.none')}</Body> : null}
        {contacts.length ? (
          <Pressable onPress={() => setSelected(new Set(contacts.map((c) => c.id)))}>
            <Text style={{ color: theme.accent, fontWeight: '700' }}>{t('contacts.selectAll')}</Text>
          </Pressable>
        ) : null}
        {contacts.map((c) => {
          const already = existingIds.has(`contact_${c.id}`);
          const possibleDuplicate = possibleDuplicates.get(c.id);
          const on = selected.has(c.id);
          const md = { month: Number(c.birthDate.slice(-5, -3)), day: Number(c.birthDate.slice(-2)) };
          return (
            <Pressable
              key={c.id}
              onPress={() => toggle(c.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                padding: space.md,
                borderRadius: radius.md,
                backgroundColor: on ? theme.accentSoft : theme.card,
                borderWidth: 1,
                borderColor: on ? theme.accent : theme.line,
              }}
            >
              <Avatar name={c.name} size={32} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>{c.name}</Text>
                <Text style={{ fontSize: 12, color: theme.muted }}>
                  🎂 {formatDayMonth(md, dateFnsLocale)}
                  {c.birthDate.startsWith('--') ? '' : ` ${c.birthDate.slice(0, 4)}`}
                  {already ? ` · ${t('contacts.alreadyImported')}` : ''}
                  {!already && possibleDuplicate ? ` · ${t('contacts.possibleDuplicate', { name: possibleDuplicate })}` : ''}
                </Text>
              </View>
              <Text style={{ fontSize: 18, color: on ? theme.accent : theme.line }}>{on ? '✓' : '○'}</Text>
            </Pressable>
          );
        })}
        {contacts.length ? (
          <Button
            label={t('contacts.import', { count: selected.size })}
            onPress={() => void importSelected()}
            disabled={busy || selected.size === 0}
            style={{ opacity: busy || selected.size === 0 ? 0.5 : 1, marginTop: space.md }}
          />
        ) : null}
        <Button label={t('common.back')} variant="ghost" onPress={() => goBack()} />
      </ScrollView>
    </Screen>
  );
}

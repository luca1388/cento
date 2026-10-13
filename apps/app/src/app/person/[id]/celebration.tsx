import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { goBack } from '@/utils/nav';
import {
  buildUpcomingEvents,
  isValidMonthDay,
  nearestWeekendOnOrAfter,
  newId,
  parseISODate,
  todayISO,
  toISODate,
  type Celebration,
  type ChecklistItem,
} from '@cento/core';
import { Body, Button, Chip, Field, Row, Screen, SectionLabel } from '@/components/ui';
import { ChecklistEditor } from '@/components/ChecklistEditor';
import { useData } from '@/storage/DataProvider';
import { useT } from '@/i18n/useT';
import { space, useTheme } from '@/theme';

const OFFSETS = [
  { offset: 3, key: 'celebration.reminder.threeDays' },
  { offset: 1, key: 'celebration.reminder.dayBefore' },
  { offset: 0, key: 'celebration.reminder.sameDay' },
] as const;

export default function CelebrationEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const t = useT();
  const { people, celebrations, settings, saveCelebration, deleteCelebration } = useData();
  const person = people.find((p) => p.id === id);
  const today = todayISO();

  const nextBirthday = useMemo(
    () =>
      person
        ? buildUpcomingEvents([person], { today, feb29Policy: settings.feb29Policy, includeNameDays: false }).find(
            (e) => e.kind === 'birthday',
          )
        : undefined,
    [person, today, settings.feb29Policy],
  );
  const year = nextBirthday ? parseISODate(nextBirthday.date).year : parseISODate(today).year;
  const existing = celebrations.find((c) => c.personId === id && c.year === year);
  const lastYear = celebrations.find((c) => c.personId === id && c.year === year - 1);

  const initialDate = existing?.date ?? (nextBirthday ? nearestWeekendOnOrAfter(nextBirthday.date) : today);
  const parsed = parseISODate(initialDate);
  const [day, setDay] = useState(String(parsed.day));
  const [month, setMonth] = useState(String(parsed.month));
  const [yearText, setYearText] = useState(String(parsed.year));
  const [time, setTime] = useState(existing?.time ?? '');
  const [place, setPlace] = useState(existing?.place ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(existing?.checklist ?? []);
  const [offsets, setOffsets] = useState<number[]>(existing?.reminderOffsets ?? settings.defaultCelebrationOffsets);
  const [submitted, setSubmitted] = useState(false);

  if (!person) {
    return (
      <Screen style={{ padding: space.xl }}>
        <Body muted>{t('person.notFound')}</Body>
      </Screen>
    );
  }

  const d = Number(day);
  const m = Number(month);
  const y = Number(yearText);
  const dateValid = Number.isInteger(y) && y >= 2000 && y <= 2100 && isValidMonthDay(m, d, y);
  const timeValid = !time.trim() || /^([01]\d|2[0-3]):[0-5]\d$/.test(time.trim());

  async function submit() {
    setSubmitted(true);
    if (!dateValid || !timeValid) return;
    const c: Celebration = {
      id: existing?.id ?? newId('c'),
      personId: person!.id,
      year: y,
      date: toISODate({ year: y, month: m, day: d }),
      time: time.trim() || null,
      place: place.trim() || null,
      notes: notes.trim() || undefined,
      checklist,
      reminderOffsets: [...offsets].sort((a, b) => b - a),
    };
    await saveCelebration(c);
    goBack();
  }

  function confirmDelete() {
    if (!existing) return;
    const run = () => void deleteCelebration(existing.id).then(() => goBack());
    if (Platform.OS === 'web') {
      if (window.confirm(t('celebration.deleteConfirm'))) run();
      return;
    }
    Alert.alert(t('celebration.delete'), t('celebration.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: run },
    ]);
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.xl, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text }}>{t('celebration.for', { name: person.firstName })}</Text>

          <View style={{ gap: space.sm }}>
            <SectionLabel>{t('celebration.date')}</SectionLabel>
            <Row style={{ alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Field label={t('form.day')} keyboardType="number-pad" value={day} onChangeText={setDay} maxLength={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Field label={t('form.month')} keyboardType="number-pad" value={month} onChangeText={setMonth} maxLength={2} />
              </View>
              <View style={{ flex: 1.4 }}>
                <Field label={t('form.year')} keyboardType="number-pad" value={yearText} onChangeText={setYearText} maxLength={4} />
              </View>
            </Row>
            <Text style={{ fontSize: 12, color: submitted && !dateValid ? theme.danger : theme.muted }}>
              {submitted && !dateValid ? t('celebration.error.date') : t('celebration.dateHint')}
            </Text>
          </View>

          <Row style={{ alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Field
                label={t('celebration.time')}
                placeholder="19:30"
                value={time}
                onChangeText={setTime}
                maxLength={5}
                error={submitted && !timeValid ? t('celebration.error.date') : undefined}
              />
            </View>
            <View style={{ flex: 2 }}>
              <Field label={t('celebration.place')} placeholder={t('celebration.placePlaceholder')} value={place} onChangeText={setPlace} />
            </View>
          </Row>

          <View style={{ gap: space.sm }}>
            <SectionLabel>{t('celebration.checklist')}</SectionLabel>
            <ChecklistEditor items={checklist} onChange={setChecklist} />
            {lastYear && lastYear.checklist.length > 0 ? (
              <Button
                label={t('celebration.copyLastYear')}
                variant="secondary"
                onPress={() => setChecklist(lastYear.checklist.map((i) => ({ text: i.text, done: false })))}
              />
            ) : null}
          </View>

          <View style={{ gap: space.sm }}>
            <SectionLabel>{t('celebration.reminders')}</SectionLabel>
            <Row style={{ flexWrap: 'wrap' }}>
              {OFFSETS.map((o) => (
                <Chip
                  key={o.offset}
                  label={t(o.key)}
                  selected={offsets.includes(o.offset)}
                  onPress={() => setOffsets((cur) => (cur.includes(o.offset) ? cur.filter((x) => x !== o.offset) : [...cur, o.offset]))}
                />
              ))}
            </Row>
            <Text style={{ fontSize: 12, color: theme.muted }}>{t('celebration.remindersHint')}</Text>
          </View>

          <Field
            label={t('form.notes')}
            value={notes}
            onChangeText={setNotes}
            multiline
            style={{ minHeight: 60, textAlignVertical: 'top' }}
          />

          <View style={{ gap: space.sm }}>
            <Button label={t('form.save')} onPress={() => void submit()} />
            <Button label={t('form.cancel')} variant="ghost" onPress={() => goBack()} />
            {existing ? <Button label={t('celebration.delete')} variant="ghost" onPress={confirmDelete} /> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

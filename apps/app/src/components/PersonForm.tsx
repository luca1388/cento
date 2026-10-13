import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { formatBirthDate, isValidMonthDay, newId, parseBirthDate, suggestNameDay, type MonthDay, type Person } from '@cento/core';
import { Button, Chip, Field, Row, SectionLabel } from './ui';
import { NameDayPicker } from './NameDayPicker';
import { space, useTheme } from '@/theme';
import { useT } from '@/i18n/useT';
import { useData } from '@/storage/DataProvider';

const BUILT_IN_TAGS = ['family', 'friend', 'work', 'neighbour'] as const;
const REMINDERS = [
  { offset: 0, key: 'form.reminder.sameDay' },
  { offset: 1, key: 'form.reminder.dayBefore' },
  { offset: 7, key: 'form.reminder.weekBefore' },
] as const;

interface Props {
  initial?: Person;
  onSaved: (p: Person) => void;
  onCancel: () => void;
}

export function PersonForm({ initial, onSaved, onCancel }: Props) {
  const theme = useTheme();
  const t = useT();
  const { savePerson, settings } = useData();

  const parsed = initial ? parseBirthDate(initial.birthDate) : null;
  const [name, setName] = useState(initial?.name ?? '');
  const [day, setDay] = useState(parsed ? String(parsed.day) : '');
  const [month, setMonth] = useState(parsed ? String(parsed.month) : '');
  const [year, setYear] = useState(parsed?.year ? String(parsed.year) : '');
  const [nameDay, setNameDay] = useState<MonthDay | null>(initial?.nameDay ?? null);
  const [nameDayTouched, setNameDayTouched] = useState(!!initial);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [offsets, setOffsets] = useState<number[]>(initial?.reminderOffsets ?? settings.defaultBirthdayOffsets);
  const [submitted, setSubmitted] = useState(false);

  const firstName = useMemo(() => name.trim().split(/\s+/)[0] ?? '', [name]);

  // Pre-fill the name day from the first name until the user touches the field.
  useEffect(() => {
    if (nameDayTouched) return;
    setNameDay(suggestNameDay(firstName)?.suggested ?? null);
  }, [firstName, nameDayTouched]);

  const dateError = useMemo(() => {
    const d = Number(day);
    const m = Number(month);
    const y = year.trim() ? Number(year) : null;
    if (!day || !month) return t('form.error.date');
    if (y !== null && (!Number.isInteger(y) || y < 1900 || y > new Date().getFullYear())) return t('form.error.date');
    if (!isValidMonthDay(m, d, y ?? 2000)) return t('form.error.date');
    return null;
  }, [day, month, year, t]);
  const nameError = name.trim() ? null : t('form.error.name');

  async function submit() {
    setSubmitted(true);
    if (nameError || dateError) return;
    const now = new Date().toISOString();
    const person: Person = {
      id: initial?.id ?? newId('p'),
      name: name.trim(),
      firstName,
      birthDate: formatBirthDate(year.trim() ? Number(year) : null, Number(month), Number(day)),
      nameDay,
      photoUri: initial?.photoUri ?? null,
      tags,
      notes: notes.trim() || undefined,
      reminderOffsets: [...offsets].sort((a, b) => b - a),
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };
    await savePerson(person);
    onSaved(person);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.xl, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <Field
          label={t('form.name')}
          placeholder={t('form.namePlaceholder')}
          value={name}
          onChangeText={setName}
          autoFocus={!initial}
          autoCapitalize="words"
          error={submitted ? (nameError ?? undefined) : undefined}
        />

        <View style={{ gap: space.sm }}>
          <SectionLabel>{t('form.birthDate')}</SectionLabel>
          <Row style={{ alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Field label={t('form.day')} keyboardType="number-pad" value={day} onChangeText={setDay} maxLength={2} placeholder="15" />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label={t('form.month')}
                keyboardType="number-pad"
                value={month}
                onChangeText={setMonth}
                maxLength={2}
                placeholder="10"
              />
            </View>
            <View style={{ flex: 1.4 }}>
              <Field
                label={t('form.yearOptional')}
                keyboardType="number-pad"
                value={year}
                onChangeText={setYear}
                maxLength={4}
                placeholder="1997"
              />
            </View>
          </Row>
          <Text style={{ fontSize: 12, color: submitted && dateError ? theme.danger : theme.muted }}>
            {(submitted && dateError) || t('form.yearHint')}
          </Text>
        </View>

        <NameDayPicker
          firstName={firstName}
          value={nameDay}
          onChange={(md) => {
            setNameDayTouched(true);
            setNameDay(md);
          }}
        />

        <View style={{ gap: space.sm }}>
          <SectionLabel>{t('form.tags')}</SectionLabel>
          <Row style={{ flexWrap: 'wrap' }}>
            {BUILT_IN_TAGS.map((tag) => (
              <Chip
                key={tag}
                label={t(`tag.${tag}`)}
                selected={tags.includes(tag)}
                onPress={() => setTags((cur) => (cur.includes(tag) ? cur.filter((x) => x !== tag) : [...cur, tag]))}
              />
            ))}
          </Row>
        </View>

        <View style={{ gap: space.sm }}>
          <SectionLabel>{t('form.reminders')}</SectionLabel>
          <Row style={{ flexWrap: 'wrap' }}>
            {REMINDERS.map((r) => (
              <Chip
                key={r.offset}
                label={t(r.key)}
                selected={offsets.includes(r.offset)}
                onPress={() => setOffsets((cur) => (cur.includes(r.offset) ? cur.filter((x) => x !== r.offset) : [...cur, r.offset]))}
              />
            ))}
          </Row>
        </View>

        <Field
          label={t('form.notes')}
          placeholder={t('form.notesPlaceholder')}
          value={notes}
          onChangeText={setNotes}
          multiline
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        <View style={{ gap: space.sm }}>
          <Button label={t('form.save')} onPress={() => void submit()} />
          <Button label={t('form.cancel')} variant="ghost" onPress={onCancel} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

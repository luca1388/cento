import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { goBack } from '@/utils/nav';
import { newId, promptKey, todayISO, type GiftRecord, type Occasion } from '@cento/core';
import { Body, Button, Chip, Field, Row, Screen, SectionLabel } from '@/components/ui';
import { useData } from '@/storage/DataProvider';
import { useT } from '@/i18n/useT';
import { space, useTheme } from '@/theme';

const OCCASIONS: Occasion[] = ['birthday', 'nameday', 'other'];

/**
 * "What did you give?" — creates the history record. Reached from the prompt card, from a notification,
 * from an idea marked as given, or by hand from the person detail.
 */
export default function GiftRecordForm() {
  const params = useLocalSearchParams<{ id: string; ideaId?: string; occasion?: string; year?: string; recordId?: string }>();
  const theme = useTheme();
  const t = useT();
  const { people, giftIdeas, giftRecords, settings, saveGiftRecord, saveGiftIdea, deleteGiftRecord, updateSettings } = useData();
  const person = people.find((p) => p.id === params.id);
  const existing = params.recordId ? giftRecords.find((r) => r.id === params.recordId) : undefined;
  const openIdeas = giftIdeas.filter((g) => g.personId === params.id && g.status !== 'given');

  const [ideaId, setIdeaId] = useState<string | null>(params.ideaId ?? existing?.giftIdeaId ?? null);
  const initialIdea = ideaId ? giftIdeas.find((g) => g.id === ideaId) : undefined;
  const [title, setTitle] = useState(existing?.title ?? initialIdea?.title ?? '');
  const [amount, setAmount] = useState(existing?.amount != null ? String(existing.amount) : '');
  const [occasion, setOccasion] = useState<Occasion>(
    existing?.occasion ?? (OCCASIONS.includes(params.occasion as Occasion) ? (params.occasion as Occasion) : 'birthday'),
  );
  const [year, setYear] = useState(existing ? String(existing.year) : (params.year ?? todayISO().slice(0, 4)));
  const [note, setNote] = useState(existing?.note ?? '');
  const [submitted, setSubmitted] = useState(false);

  if (!person) {
    return (
      <Screen style={{ padding: space.xl }}>
        <Body muted>{t('person.notFound')}</Body>
      </Screen>
    );
  }

  const y = Number(year);
  const yearOk = Number.isInteger(y) && y >= 1900 && y <= 2100;
  const amountNum = amount.trim() ? Number(amount.replace(',', '.')) : null;
  const amountOk = amountNum === null || (!Number.isNaN(amountNum) && amountNum >= 0);

  async function submit() {
    setSubmitted(true);
    if (!title.trim() || !yearOk || !amountOk) return;
    const record: GiftRecord = {
      id: existing?.id ?? newId('r'),
      personId: person!.id,
      year: y,
      occasion,
      title: title.trim(),
      amount: amountNum,
      currency: amountNum === null ? null : 'EUR',
      note: note.trim() || undefined,
      giftIdeaId: ideaId,
    };
    await saveGiftRecord(record);
    const idea = ideaId ? giftIdeas.find((g) => g.id === ideaId) : undefined;
    if (idea && idea.status !== 'given') await saveGiftIdea({ ...idea, status: 'given' });
    goBack();
  }

  async function skip() {
    const key = promptKey(person!.id, occasion, y);
    if (!settings.dismissedPrompts.includes(key)) await updateSettings({ dismissedPrompts: [...settings.dismissedPrompts, key] });
    goBack();
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.xl, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text }}>{t('prompt.title', { name: person.firstName })}</Text>

          {openIdeas.length > 0 && !existing ? (
            <View style={{ gap: space.sm }}>
              <SectionLabel>{t('record.fromIdea')}</SectionLabel>
              <Row style={{ flexWrap: 'wrap' }}>
                {openIdeas.map((g) => (
                  <Chip
                    key={g.id}
                    label={g.title}
                    selected={ideaId === g.id}
                    onPress={() => {
                      const next = ideaId === g.id ? null : g.id;
                      setIdeaId(next);
                      if (next) setTitle(g.title);
                    }}
                  />
                ))}
              </Row>
            </View>
          ) : null}

          <Field
            label={t('record.what')}
            placeholder={t('record.whatPlaceholder')}
            value={title}
            onChangeText={setTitle}
            error={submitted && !title.trim() ? t('record.error.title') : undefined}
          />
          <Row style={{ alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Field
                label={t('record.amount')}
                placeholder="25"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                error={submitted && !amountOk ? t('form.error.date') : undefined}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label={t('record.year')}
                keyboardType="number-pad"
                value={year}
                onChangeText={setYear}
                maxLength={4}
                error={submitted && !yearOk ? t('form.error.date') : undefined}
              />
            </View>
          </Row>
          <View style={{ gap: space.sm }}>
            <SectionLabel>{t('record.occasion')}</SectionLabel>
            <Row style={{ flexWrap: 'wrap' }}>
              {OCCASIONS.map((o) => (
                <Chip key={o} label={t(`record.occasion.${o}`)} selected={occasion === o} onPress={() => setOccasion(o)} />
              ))}
            </Row>
          </View>
          <Field
            label={t('form.notes')}
            value={note}
            onChangeText={setNote}
            multiline
            style={{ minHeight: 60, textAlignVertical: 'top' }}
          />

          <View style={{ gap: space.sm }}>
            <Button label={t('form.save')} onPress={() => void submit()} />
            {!existing ? <Button label={t('record.nothing')} variant="secondary" onPress={() => void skip()} /> : null}
            <Button label={t('form.cancel')} variant="ghost" onPress={() => goBack()} />
            {existing ? (
              <Button label={t('record.delete')} variant="ghost" onPress={() => void deleteGiftRecord(existing.id).then(() => goBack())} />
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { goBack } from '@/utils/nav';
import { newId, type GiftIdea } from '@cento/core';
import { Body, Button, Field, Screen } from '@/components/ui';
import { useData } from '@/storage/DataProvider';
import { useT } from '@/i18n/useT';
import { space, useTheme } from '@/theme';
import { fetchLinkPreview, hostOf } from '@/network/linkPreview';

/** Add or edit a gift idea by hand (the share sheet uses /share instead). */
export default function GiftIdeaForm() {
  const { id, ideaId } = useLocalSearchParams<{ id: string; ideaId?: string }>();
  const theme = useTheme();
  const t = useT();
  const { people, giftIdeas, settings, saveGiftIdea } = useData();
  const person = people.find((p) => p.id === id);
  const existing = ideaId ? giftIdeas.find((g) => g.id === ideaId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [url, setUrl] = useState(existing?.url ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!person) {
    return (
      <Screen style={{ padding: space.xl }}>
        <Body muted>{t('person.notFound')}</Body>
      </Screen>
    );
  }

  const cleanUrl = url.trim();
  const titleOk = title.trim() || cleanUrl;

  async function submit() {
    setSubmitted(true);
    if (!titleOk) return;
    setBusy(true);
    let finalTitle = title.trim();
    let imageUri = existing?.imageUri ?? null;
    if (cleanUrl && settings.linkPreview && (!finalTitle || !imageUri)) {
      const preview = await fetchLinkPreview(cleanUrl);
      if (preview?.title && !finalTitle) finalTitle = preview.title;
      if (preview?.imageUrl && !imageUri) imageUri = preview.imageUrl;
    }
    if (!finalTitle) finalTitle = hostOf(cleanUrl);
    const idea: GiftIdea = {
      id: existing?.id ?? newId('g'),
      personId: person!.id,
      title: finalTitle,
      note: note.trim() || undefined,
      url: cleanUrl || null,
      imageUri,
      source: existing?.source ?? 'manual',
      status: existing?.status ?? 'idea',
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    await saveGiftIdea(idea);
    setBusy(false);
    goBack();
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.xl, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text }}>{person.name}</Text>
          <Field
            label={t('gift.name')}
            placeholder={t('gift.namePlaceholder')}
            value={title}
            onChangeText={setTitle}
            autoFocus={!existing}
            error={submitted && !titleOk ? t('gift.error.title') : undefined}
          />
          <Field
            label={t('gift.url')}
            placeholder={t('gift.urlPlaceholder')}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            keyboardType="url"
            hint={cleanUrl ? (settings.linkPreview ? (busy ? t('gift.preview.fetching') : undefined) : t('gift.preview.off')) : undefined}
          />
          <Field label={t('gift.note')} value={note} onChangeText={setNote} multiline style={{ minHeight: 60, textAlignVertical: 'top' }} />
          <View style={{ gap: space.sm }}>
            <Button label={t('form.save')} onPress={() => void submit()} disabled={busy} style={{ opacity: busy ? 0.6 : 1 }} />
            <Button label={t('form.cancel')} variant="ghost" onPress={() => goBack()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { goBack } from '@/utils/nav';
import { newId, type GiftIdea } from '@cento/core';
import { Body, Button, Chip, Field, Row, Screen, SectionLabel } from '@/components/ui';
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
  const [participantIds, setParticipantIds] = useState<string[]>(existing?.participantIds ?? []);
  const [paidParticipantIds, setPaidParticipantIds] = useState<string[]>(existing?.paidParticipantIds ?? []);
  const [externalContributors, setExternalContributors] = useState(existing?.externalContributors ?? []);
  const [externalName, setExternalName] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const contributors = people.filter((p) => p.id !== person?.id);

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
      participantIds,
      paidParticipantIds: paidParticipantIds.filter((participantId) => participantIds.includes(participantId)),
      externalContributors,
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
      >
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
          <View style={{ gap: space.sm }}>
            {contributors.length > 0 ? (
              <>
                <SectionLabel>{t('gift.participants')}</SectionLabel>
              <Row style={{ flexWrap: 'wrap' }}>
                {contributors.map((contributor) => {
                  const selected = participantIds.includes(contributor.id);
                  return (
                    <Chip
                      key={contributor.id}
                      label={contributor.name}
                      selected={selected}
                      onPress={() => {
                        setParticipantIds((current) =>
                          selected ? current.filter((id) => id !== contributor.id) : [...current, contributor.id],
                        );
                        if (selected) setPaidParticipantIds((current) => current.filter((id) => id !== contributor.id));
                      }}
                    />
                  );
                })}
              </Row>
              {participantIds.length > 0 ? (
                <View style={{ gap: space.sm }}>
                  <SectionLabel>{t('gift.paid')}</SectionLabel>
                  <Row style={{ flexWrap: 'wrap' }}>
                    {contributors
                      .filter((contributor) => participantIds.includes(contributor.id))
                      .map((contributor) => (
                        <Chip
                          key={contributor.id}
                          label={contributor.name}
                          selected={paidParticipantIds.includes(contributor.id)}
                          onPress={() =>
                            setPaidParticipantIds((current) =>
                              current.includes(contributor.id)
                                ? current.filter((id) => id !== contributor.id)
                                : [...current, contributor.id],
                            )
                          }
                        />
                      ))}
                  </Row>
                </View>
              ) : null}
              </>
            ) : null}
            <View style={{ gap: space.sm }}>
              <SectionLabel>{t(participantIds.length ? 'gift.externalParticipants' : 'gift.participants')}</SectionLabel>
                <Row>
                  <View style={{ flex: 1 }}>
                    <Field
                      label={t('gift.externalName')}
                      placeholder={t('gift.externalNamePlaceholder')}
                      value={externalName}
                      onChangeText={setExternalName}
                      onSubmitEditing={() => {
                        const name = externalName.trim();
                        if (!name) return;
                        setExternalContributors((current) => [...current, { id: newId('c'), name, paid: false }]);
                        setExternalName('');
                      }}
                      returnKeyType="done"
                    />
                  </View>
                  <Button
                    label={t('gift.addParticipant')}
                    variant="secondary"
                    onPress={() => {
                      const name = externalName.trim();
                      if (!name) return;
                      setExternalContributors((current) => [...current, { id: newId('c'), name, paid: false }]);
                      setExternalName('');
                    }}
                    disabled={!externalName.trim()}
                  />
                </Row>
                {externalContributors.map((contributor) => (
                  <Row key={contributor.id} style={{ justifyContent: 'space-between' }}>
                    <Body>{contributor.name}</Body>
                    <Row>
                      <Chip
                        label={contributor.paid ? t('gift.paidStatus') : t('gift.markPaid')}
                        selected={contributor.paid}
                        onPress={() =>
                          setExternalContributors((current) =>
                            current.map((entry) => (entry.id === contributor.id ? { ...entry, paid: !entry.paid } : entry)),
                          )
                        }
                      />
                      <Chip
                        label={t('common.delete')}
                        onPress={() => setExternalContributors((current) => current.filter((entry) => entry.id !== contributor.id))}
                      />
                    </Row>
                  </Row>
                ))}
              </View>
          </View>
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

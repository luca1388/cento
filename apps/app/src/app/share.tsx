import React, { useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { goBack } from '@/utils/nav';
import { useShareIntentContext } from 'expo-share-intent';
import { newId, type GiftIdea, type Person } from '@cento/core';
import { Avatar, Body, Button, Card, Field, Row, Screen, SectionLabel } from '@/components/ui';
import { useData } from '@/storage/DataProvider';
import { useT } from '@/i18n/useT';
import { radius, space, useTheme } from '@/theme';
import { extractUrl, fetchLinkPreview, hostOf } from '@/network/linkPreview';
import { keepImage } from '@/backup/files';

/**
 * "Save gift idea": opened when something is shared into Cento from another app (link, text or photo),
 * or from the paste-a-link entry on web and in Expo Go. Two taps: pick the person, Save.
 */
export default function ShareScreen() {
  const theme = useTheme();
  const t = useT();
  const { people, giftIdeas, settings, saveGiftIdea } = useData();
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();

  const [pasted, setPasted] = useState('');
  const [query, setQuery] = useState('');
  const [note, setNote] = useState('');
  const [personId, setPersonId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fromIntent = hasShareIntent ? shareIntent : null;
  const image = fromIntent?.files?.find((f) => f.mimeType.startsWith('image/')) ?? null;
  const text = fromIntent ? (fromIntent.text ?? null) : pasted.trim() || null;
  const url = fromIntent?.webUrl ?? extractUrl(text);
  const metaTitle = fromIntent?.meta?.title ?? null;
  const hasPayload = !!(url || text || image);

  const recentIds = useMemo(() => {
    const byRecent = [...giftIdeas].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((g) => g.personId);
    return Array.from(new Set(byRecent)).slice(0, 3);
  }, [giftIdeas]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? people.filter((p) => p.name.toLowerCase().includes(q)) : people;
    return list;
  }, [people, query]);
  const recent = filtered.filter((p) => recentIds.includes(p.id));
  const others = filtered.filter((p) => !recentIds.includes(p.id));

  async function save() {
    const person = people.find((p) => p.id === personId);
    if (!person || !hasPayload) return;
    setBusy(true);
    let title = metaTitle?.trim() || '';
    let imageUri: string | null = null;
    if (image) {
      try {
        imageUri = await keepImage(image.path, `${newId('img')}.${image.fileName.split('.').pop() ?? 'jpg'}`);
      } catch {
        imageUri = image.path;
      }
    }
    if (url && settings.linkPreview && (!title || !imageUri)) {
      const preview = await fetchLinkPreview(url);
      if (!title && preview?.title) title = preview.title;
      if (!imageUri && preview?.imageUrl) imageUri = preview.imageUrl;
    }
    if (!title) title = url ? hostOf(url) : text ? text.slice(0, 60) : (image?.fileName ?? t('gift.title'));
    const idea: GiftIdea = {
      id: newId('g'),
      personId: person.id,
      title,
      note: [note.trim(), text && text !== url ? text : ''].filter(Boolean).join('\n') || undefined,
      url: url ?? null,
      imageUri,
      source: fromIntent ? 'share' : 'manual',
      status: 'idea',
      createdAt: new Date().toISOString(),
    };
    await saveGiftIdea(idea);
    if (fromIntent) resetShareIntent();
    setBusy(false);
    router.replace({ pathname: '/person/[id]', params: { id: person.id } });
  }

  const PersonRow = ({ p }: { p: Person }) => (
    <Pressable
      onPress={() => setPersonId(p.id)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        padding: space.md,
        borderRadius: radius.md,
        backgroundColor: personId === p.id ? theme.accentSoft : theme.card,
        borderWidth: 1,
        borderColor: personId === p.id ? theme.accent : theme.line,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Avatar name={p.name} size={32} />
      <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: theme.text }}>{p.name}</Text>
    </Pressable>
  );

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
          <View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text }}>{t('share.title')}</Text>
            <Body muted>{t('share.subtitle')}</Body>
          </View>

          {fromIntent ? (
            <Card style={{ gap: 6 }}>
              <SectionLabel>{image ? t('share.payload.image') : url ? t('share.payload.link') : t('share.payload.text')}</SectionLabel>
              {image ? (
                <Image source={{ uri: image.path }} style={{ width: '100%', height: 160, borderRadius: radius.sm }} resizeMode="cover" />
              ) : null}
              {metaTitle ? <Body>{metaTitle}</Body> : null}
              {url ? <Body muted>{url}</Body> : text ? <Body>{text}</Body> : null}
            </Card>
          ) : (
            <Field
              label={t('share.paste')}
              placeholder={t('gift.urlPlaceholder')}
              hint={t('share.pasteHint')}
              value={pasted}
              onChangeText={setPasted}
              autoCapitalize="none"
              keyboardType="url"
              autoFocus
            />
          )}

          {people.length === 0 ? (
            <Body muted>{t('share.noPeople')}</Body>
          ) : (
            <>
              <Field label={t('share.search')} value={query} onChangeText={setQuery} />
              {recent.length ? (
                <View style={{ gap: space.sm }}>
                  <SectionLabel>{t('share.recent')}</SectionLabel>
                  {recent.map((p) => (
                    <PersonRow key={p.id} p={p} />
                  ))}
                </View>
              ) : null}
              <View style={{ gap: space.sm }}>
                {recent.length ? <SectionLabel>{t('share.everyone')}</SectionLabel> : null}
                {others.map((p) => (
                  <PersonRow key={p.id} p={p} />
                ))}
              </View>
            </>
          )}

          <Field label={t('share.note')} value={note} onChangeText={setNote} />

          <Row>
            <Button
              label={t('common.cancel')}
              variant="ghost"
              onPress={() => {
                if (fromIntent) resetShareIntent();
                goBack();
              }}
              style={{ flex: 1 }}
            />
            <Button
              label={t('share.save')}
              onPress={() => void save()}
              disabled={!personId || !hasPayload || busy}
              style={{ flex: 2, opacity: !personId || !hasPayload || busy ? 0.5 : 1 }}
            />
          </Row>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

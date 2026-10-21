import React, { useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ageOn, buildUpcomingEvents, fitGreeting, greetingTemplates, parseISODate, prepareGreetingForCard, renderGreeting, todayISO, type GreetingTone } from '@cento/core';
import type { View as NativeView } from 'react-native';
import { Body, Button, Chip, Screen, SectionLabel } from '@/components/ui';
import { useData } from '@/storage/DataProvider';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { space, useTheme } from '@/theme';
import { CARD_DESIGNS, designsForTone } from '@/cards/registry';
import { shareCardImage } from '@/cards/exportCard';
import { useCardFonts } from '@/cards/fonts';
import type { CardFormat } from '@/cards/types';

const TONES: GreetingTone[] = ['warm', 'funny', 'formal', 'short'];

export default function GreetingCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const t = useT();
  const { locale } = useLocale();
  const { people, settings } = useData();
  const person = people.find((item) => item.id === id);
  const { ready: fontsReady } = useCardFonts();
  const captureTarget = useRef<NativeView>(null);
  const [tone, setTone] = useState<GreetingTone>('warm');
  const [message, setMessage] = useState('');
  const format: CardFormat = 'square';
  const [designId, setDesignId] = useState('coriandoli');
  const [step, setStep] = useState<'messages' | 'edit' | 'card'>('messages');
  const [busy, setBusy] = useState(false);
  const today = todayISO();

  const birthday = useMemo(
    () => person && buildUpcomingEvents([person], { today, feb29Policy: settings.feb29Policy, includeNameDays: false }).find((event) => event.kind === 'birthday'),
    [person, settings.feb29Policy, today],
  );
  const age = person && birthday ? ageOn(person.birthDate, parseISODate(birthday.date).year) : undefined;
  const relationship = person?.tags.includes('family') ? 'famiglia' : person?.tags.includes('friend') ? 'amico' : person?.tags.includes('work') ? 'collega' : 'any';
  const templates = person ? greetingTemplates(locale, relationship, tone, age) : [];
  const designs = designsForTone(tone, age);
  const selectedDesign = designs.find((design) => design.id === designId) ?? designs[0] ?? CARD_DESIGNS[0]!;
  const fit = fitGreeting(message, selectedDesign.messageBox[format]);
  const Card = selectedDesign.Component;

  if (!person) {
    return <Screen style={{ padding: space.xl }}><Body muted>{t('person.notFound')}</Body></Screen>;
  }

  function onShare() {
    setBusy(true);
    void shareCardImage(captureTarget, format)
      .catch(() => {
        const messageText = t('card.shareError');
        if (Platform.OS === 'web') window.alert(messageText);
        else Alert.alert(t('card.title'), messageText);
      })
      .finally(() => setBusy(false));
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: t('card.title') }} />
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, alignItems: 'stretch', paddingBottom: 40 }}>
        {step === 'messages' ? (
          <>
            <SectionLabel>{t('card.pickMessage')}</SectionLabel>
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.muted }}>{t('card.tone')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {TONES.map((item) => <Chip key={item} label={t(`card.tone.${item}`)} selected={tone === item} onPress={() => setTone(item)} />)}
            </View>
            <View style={{ gap: space.sm }}>
              {templates.map((template) => {
                const text = prepareGreetingForCard(renderGreeting(template, person.firstName, age), person.firstName, locale);
                return (
                  <Pressable key={template.id} onPress={() => { setMessage(text); setStep('edit'); }} style={({ pressed }) => ({ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.line, borderRadius: 8, padding: space.md, opacity: pressed ? 0.75 : 1 })}>
                    <Text style={{ color: theme.text, fontSize: 14, lineHeight: 20 }}>{text}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : step === 'edit' ? (
          <>
            <SectionLabel>{t('card.editMessage')}</SectionLabel>
            <TextInput value={message} onChangeText={setMessage} multiline textAlignVertical="top" style={{ minHeight: 130, borderWidth: 1, borderColor: theme.line, borderRadius: 8, padding: space.md, color: theme.text, backgroundColor: theme.card, fontSize: 16, lineHeight: 23 }} />
            <Button label={t('card.title')} onPress={() => { setDesignId(designsForTone(tone, age)[0]?.id ?? 'coriandoli'); setStep('card'); }} disabled={!message.trim()} />
            <Button label={t('common.back')} variant="ghost" onPress={() => setStep('messages')} />
          </>
        ) : (
          <>
            <SectionLabel>{t('card.chooseStyle')}</SectionLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
              {designs.map((design) => (
                <Pressable key={design.id} accessibilityRole="button" accessibilityState={{ selected: design.id === selectedDesign.id }} onPress={() => setDesignId(design.id)} style={{ alignItems: 'center', gap: 6, padding: 6, borderWidth: 1, borderColor: design.id === selectedDesign.id ? theme.accent : 'transparent', borderRadius: 6 }}>
                  <View style={{ width: 38, height: 38, backgroundColor: design.swatch, borderWidth: 1, borderColor: theme.line, borderRadius: 4, overflow: 'hidden' }}>
                    {design.id === 'carta-inchiostro' ? (
                      <>
                        <View style={{ position: 'absolute', top: 4, right: 4, bottom: 4, left: 4, borderWidth: 1, borderColor: '#1A1A1A' }} />
                      </>
                    ) : null}
                  </View>
                  <Text style={{ color: theme.text, fontSize: 10 }} numberOfLines={1}>{design.title}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {!fit.fits ? <Text style={{ color: theme.danger, fontSize: 13 }}>{t('card.fitWarning')}</Text> : null}
            {!fontsReady ? <Text style={{ color: theme.muted, fontSize: 12 }}>{t('card.loadingFonts')}</Text> : null}
            <View style={{ alignItems: 'center', paddingVertical: space.sm }}>
              <View ref={captureTarget} collapsable={false} style={{ width: format === 'square' ? 340 : 270, height: format === 'square' ? 340 : 480 }}>
                <Card name={person.firstName} message={message} format={format} locale={locale} age={age} />
              </View>
            </View>
            <Button label={Platform.OS === 'web' ? t('card.download') : t('card.share')} onPress={onShare} disabled={busy || !fontsReady} />
            <Button label={t('common.back')} variant="ghost" onPress={() => setStep('edit')} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
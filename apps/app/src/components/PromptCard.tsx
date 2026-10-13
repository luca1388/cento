import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { promptKey, type GiftPrompt } from '@cento/core';
import { Button, Row } from './ui';
import { useData } from '@/storage/DataProvider';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { formatShortDate } from '@/utils/format';
import { radius, space, useTheme } from '@/theme';

/** "What did you give?" — shown at the top of the upcoming list the day after a birthday or party. */
export function PromptCard({ prompt }: { prompt: GiftPrompt }) {
  const theme = useTheme();
  const t = useT();
  const { dateFnsLocale } = useLocale();
  const { settings, updateSettings } = useData();
  const firstName = prompt.personName.split(/\s+/)[0] ?? prompt.personName;

  return (
    <View style={{ backgroundColor: theme.accentSoft, borderRadius: radius.md, padding: space.lg, gap: space.sm, marginBottom: space.md }}>
      <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>🎁 {t('prompt.title', { name: firstName })}</Text>
      <Text style={{ fontSize: 13, color: theme.muted }}>
        {t('prompt.body', { occasion: t(`record.occasion.${prompt.occasion}`), date: formatShortDate(prompt.date, dateFnsLocale) })}
      </Text>
      <Row>
        <Button
          label={t('prompt.answer')}
          onPress={() =>
            router.push({
              pathname: '/person/[id]/record',
              params: { id: prompt.personId, occasion: prompt.occasion, year: String(prompt.year) },
            })
          }
          style={{ flex: 1 }}
        />
        <Button
          label={t('prompt.skip')}
          variant="ghost"
          onPress={() =>
            void updateSettings({
              dismissedPrompts: [...settings.dismissedPrompts, promptKey(prompt.personId, prompt.occasion, prompt.year)],
            })
          }
        />
      </Row>
    </View>
  );
}

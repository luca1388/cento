import React from 'react';
import { ScrollView } from 'react-native';
import { Body, Card, Screen } from '@/components/ui';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { formatLongDate } from '@/utils/format';
import { space } from '@/theme';

const UPDATED = '2026-10-13';

/** The whole privacy policy, bundled with the app, readable offline. */
export default function PrivacyScreen() {
  const t = useT();
  const { dateFnsLocale } = useLocale();
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 48 }}>
        <Card style={{ gap: space.md }}>
          <Body>{t('privacy.p1')}</Body>
          <Body>{t('privacy.p2')}</Body>
          <Body>{t('privacy.p3')}</Body>
          <Body>{t('privacy.p4')}</Body>
          <Body>{t('privacy.p5')}</Body>
          <Body muted>{t('privacy.updated', { date: formatLongDate(UPDATED, dateFnsLocale) })}</Body>
        </Card>
      </ScrollView>
    </Screen>
  );
}

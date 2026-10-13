import React, { useMemo, useState } from 'react';
import { Pressable, SectionList, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buildUpcomingEvents, groupEvents, pendingGiftPrompts, todayISO, type UpcomingGroup } from '@cento/core';
import { EventRow } from '@/components/EventRow';
import { PromptCard } from '@/components/PromptCard';
import { Body, Button, Chip, Row, SectionLabel, Screen, Subtitle, Title } from '@/components/ui';
import { useData } from '@/storage/DataProvider';
import { useT } from '@/i18n/useT';
import { radius, space, useTheme } from '@/theme';

const GROUP_KEY: Record<UpcomingGroup, 'upcoming.group.today' | 'upcoming.group.week' | 'upcoming.group.month' | 'upcoming.group.later'> = {
  today: 'upcoming.group.today',
  week: 'upcoming.group.week',
  month: 'upcoming.group.month',
  later: 'upcoming.group.later',
};

export default function UpcomingScreen() {
  const theme = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { people, celebrations, giftRecords, settings } = useData();
  const [birthdaysOnly, setBirthdaysOnly] = useState(true);
  const today = todayISO();

  const sections = useMemo(() => {
    const events = buildUpcomingEvents(people, {
      today,
      feb29Policy: settings.feb29Policy,
      includeNameDays: settings.showNameDays && !birthdaysOnly,
    }).filter((e) => !birthdaysOnly || e.kind === 'birthday');
    return groupEvents(events, today).map((g) => ({
      title: t(GROUP_KEY[g.group]),
      data: g.events,
    }));
  }, [people, settings, birthdaysOnly, today, t]);

  const total = sections.reduce((n, s) => n + s.data.length, 0);
  const prompts = useMemo(
    () =>
      pendingGiftPrompts(people, celebrations, giftRecords, {
        today,
        feb29Policy: settings.feb29Policy,
        dismissed: settings.dismissedPrompts,
      }),
    [people, celebrations, giftRecords, today, settings.feb29Policy, settings.dismissedPrompts],
  );

  return (
    <Screen>
      <SectionList
        sections={sections}
        keyExtractor={(e) => e.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{
          paddingTop: insets.top + space.lg,
          paddingHorizontal: space.lg,
          paddingBottom: 120,
          gap: space.sm,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: space.md, gap: space.md }}>
            <Row
              style={{
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <View>
                <Title>{t('upcoming.title')}</Title>
                <Subtitle>{t('upcoming.subtitle', { count: total })}</Subtitle>
              </View>
              <Row>
                <Link href="/share" asChild>
                  <Pressable hitSlop={12} accessibilityLabel={t('share.title')} style={{ padding: 6 }}>
                    <Text style={{ fontSize: 22 }}>🎁</Text>
                  </Pressable>
                </Link>
                <Link href="/settings" asChild>
                  <Pressable hitSlop={12} accessibilityLabel={t('settings.title')} style={{ padding: 6 }}>
                    <Text style={{ fontSize: 22 }}>⚙️</Text>
                  </Pressable>
                </Link>
              </Row>
            </Row>
            {prompts.slice(0, 2).map((p) => (
              <PromptCard key={p.key} prompt={p} />
            ))}
            {settings.showNameDays ? (
              <Row>
                <Chip label={t('upcoming.filter.birthdays')} selected={birthdaysOnly} onPress={() => setBirthdaysOnly(true)} />
                <Chip label={t('upcoming.filter.all')} selected={!birthdaysOnly} onPress={() => setBirthdaysOnly(false)} />
              </Row>
            ) : null}
          </View>
        }
        renderSectionHeader={({ section }) => <SectionLabel style={{ marginTop: space.md }}>{section.title}</SectionLabel>}
        renderItem={({ item }) => <EventRow event={item} />}
        ItemSeparatorComponent={() => <View style={{ height: space.sm }} />}
        ListEmptyComponent={
          <View
            style={{
              alignItems: 'center',
              gap: space.md,
              paddingVertical: 48,
              paddingHorizontal: space.xl,
            }}
          >
            <Text style={{ fontSize: 44 }}>🎂</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>{t('upcoming.empty.title')}</Text>
            <Body muted style={{ textAlign: 'center' }}>
              {t('upcoming.empty.body')}
            </Body>
            <Link href="/person/new" asChild>
              <Button label={t('upcoming.add')} />
            </Link>
          </View>
        }
      />
      <Pressable
        accessibilityLabel={t('upcoming.add')}
        accessibilityRole="button"
        onPress={() => router.push('/person/new')}
        style={({ pressed }) => ({
          position: 'absolute',
          right: space.xl,
          bottom: insets.bottom + space.xl,
          width: 56,
          height: 56,
          borderRadius: radius.lg,
          backgroundColor: theme.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.8 : 1,
          shadowColor: theme.primary,
          shadowOpacity: 0.35,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        })}
      >
        <Text
          style={{
            color: theme.onPrimary,
            fontSize: 30,
            lineHeight: 34,
            fontWeight: '300',
          }}
        >
          +
        </Text>
      </Pressable>
    </Screen>
  );
}

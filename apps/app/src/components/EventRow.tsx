import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { relativeDays, type UpcomingEvent } from '@cento/core';
import { Avatar, Glyph } from './ui';
import { radius, space, useTheme } from '@/theme';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { formatShortDate } from '@/utils/format';

export function EventRow({ event }: { event: UpcomingEvent }) {
  const theme = useTheme();
  const t = useT();
  const { dateFnsLocale } = useLocale();
  const isToday = event.daysUntil <= 0;

  let detail: string;
  if (event.kind === 'birthday') {
    detail = event.age !== undefined ? t('event.turns', { count: event.age }) : t('event.birthday');
  } else if (event.kind === 'nameday') {
    detail = t('event.nameday');
  } else {
    detail = t('event.party', { name: event.personName.split(/\s+/)[0] });
  }
  const subline =
    event.kind === 'birthday' && event.celebration
      ? t('event.partySubline', {
          date: formatShortDate(event.celebration.date, dateFnsLocale),
        })
      : null;

  return (
    <Pressable
      accessibilityRole="link"
      onPress={() =>
        router.push({
          pathname: '/person/[id]',
          params: { id: event.personId },
        })
      }
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        backgroundColor: isToday ? theme.todaySoft : theme.card,
        borderColor: isToday ? theme.today : theme.line,
        borderWidth: 1,
        borderRadius: radius.md,
        paddingVertical: 10,
        paddingHorizontal: space.md,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Avatar name={event.personName} />
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.sm }}>
          <Text style={{ flex: 1, flexShrink: 1, fontSize: 15, fontWeight: '700', color: theme.text }}>
            {event.personName}
          </Text>
          <Text
            style={{
              flexShrink: 0,
              fontSize: 15,
              fontWeight: '800',
              color: isToday ? theme.today : theme.text,
              fontVariant: ['tabular-nums'],
              textAlign: 'right',
            }}
          >
            {relativeDays(event.daysUntil, t as (k: string, o?: Record<string, unknown>) => string)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
          <Glyph kind={event.kind} />
          <Text style={{ flex: 1, flexShrink: 1, fontSize: 12, color: theme.muted }}>
            {formatShortDate(event.date, dateFnsLocale)} · {detail}
            {event.milestone ? ` · ${t('event.milestone')}` : ''}
          </Text>
        </View>
        {subline ? <Text style={{ fontSize: 12, color: theme.flame, fontWeight: '600' }}>🎉 {subline}</Text> : null}
      </View>
    </Pressable>
  );
}

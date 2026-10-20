import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CakeSlice, CreditCard } from 'lucide-react-native';
import { relativeDays, type UpcomingEvent } from '@cento/core';
import { Avatar } from './ui';
import { radius, space, useTheme } from '@/theme';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { formatShortDate } from '@/utils/format';

export function EventRow({ event }: { event: UpcomingEvent }) {
  const theme = useTheme();
  const t = useT();
  const { dateFnsLocale } = useLocale();
  const isToday = event.daysUntil <= 0;
  const canCreateCard = event.kind === 'birthday' && event.daysUntil === 0;

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
    <View
      style={{
        flexDirection: canCreateCard ? 'column' : 'row',
        alignItems: canCreateCard ? 'stretch' : 'center',
        gap: space.md,
        backgroundColor: isToday ? theme.todaySoft : theme.card,
        borderColor: isToday ? theme.today : theme.line,
        borderWidth: 1,
        borderRadius: radius.md,
        paddingVertical: 10,
        paddingHorizontal: space.md,
      }}
    >
      <Pressable
        accessibilityRole="link"
        onPress={() =>
          router.push({
            pathname: '/person/[id]',
            params: { id: event.personId },
          })
        }
        style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md, opacity: pressed ? 0.75 : 1 })}
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
            {event.kind === 'birthday' ? <CakeSlice size={16} color={theme.flame} /> : null}
            <Text style={{ flex: 1, flexShrink: 1, fontSize: 12, color: theme.muted }}>
              {formatShortDate(event.date, dateFnsLocale)} · {detail}
              {event.milestone ? ` · ${t('event.milestone')}` : ''}
            </Text>
          </View>
          {subline ? <Text style={{ fontSize: 12, color: theme.flame, fontWeight: '600' }}>{subline}</Text> : null}
        </View>
      </Pressable>
      {canCreateCard ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('card.writeWishes')}
          accessibilityHint={t('card.title')}
          onPress={() => router.push({ pathname: '/person/[id]/card', params: { id: event.personId } })}
          style={({ pressed }) => ({
            minHeight: 48,
            marginLeft: 56,
            marginTop: space.sm,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: space.sm,
            paddingHorizontal: space.md,
            backgroundColor: theme.primary,
            borderRadius: radius.sm,
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <CreditCard size={18} color={theme.onPrimary} strokeWidth={1.8} />
          <Text style={{ color: theme.onPrimary, fontSize: 14, fontWeight: '700' }}>{t('card.writeWishes')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

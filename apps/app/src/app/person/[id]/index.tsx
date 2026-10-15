import React, { useMemo } from 'react';
import { Alert, Image, Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ageOn, buildUpcomingEvents, parseBirthDate, parseISODate, todayISO } from '@cento/core';
import { Avatar, Body, Button, Card, Chip, Row, SectionLabel, Screen } from '@/components/ui';
import { useData } from '@/storage/DataProvider';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { formatDayMonth, formatLongDate, formatShortDate } from '@/utils/format';
import { radius, space, useTheme } from '@/theme';

export default function PersonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const t = useT();
  const { locale, dateFnsLocale } = useLocale();
  const { people, celebrations, giftIdeas, giftRecords, settings, deletePerson, deleteGiftIdea } = useData();
  const person = people.find((p) => p.id === id);
  const today = todayISO();

  const events = useMemo(
    () =>
      person
        ? buildUpcomingEvents([person], { today, celebrations, feb29Policy: settings.feb29Policy, includeNameDays: settings.showNameDays })
        : [],
    [person, celebrations, settings, today],
  );
  const ideas = useMemo(() => giftIdeas.filter((g) => g.personId === id && g.status !== 'given'), [giftIdeas, id]);
  const history = useMemo(() => giftRecords.filter((r) => r.personId === id).sort((a, b) => b.year - a.year), [giftRecords, id]);

  if (!person) {
    return (
      <Screen style={{ padding: space.xl }}>
        <Body muted>{t('person.notFound')}</Body>
      </Screen>
    );
  }

  const birthday = events.find((e) => e.kind === 'birthday');
  const nameday = events.find((e) => e.kind === 'nameday');
  const celebration = celebrations.find((c) => c.personId === id && birthday && c.year === parseISODate(birthday.date).year);
  const birth = parseBirthDate(person.birthDate);
  const nextYear = birthday ? parseISODate(birthday.date).year : undefined;
  const age = nextYear !== undefined ? ageOn(person.birthDate, nextYear) : undefined;
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

  function confirm(title: string, message: string, run: () => void) {
    if (Platform.OS === 'web') {
      if (window.confirm(message)) run();
      return;
    }
    Alert.alert(title, message, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: run },
    ]);
  }

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <Button
              label={t('person.edit')}
              variant="ghost"
              onPress={() => router.push({ pathname: '/person/[id]/edit', params: { id: person.id } })}
            />
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: 48 }}>
        <View style={{ alignItems: 'center', gap: space.sm }}>
          <Avatar name={person.name} size={72} />
          <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text, textAlign: 'center' }}>{person.name}</Text>
          {person.tags.length ? (
            <Row style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
              {person.tags.map((tag) => (
                <Chip key={tag} label={isBuiltIn(tag) ? t(`tag.${tag}`) : tag} />
              ))}
            </Row>
          ) : null}
        </View>

        <Row>
          <Stat
            label={t('person.birthday')}
            value={birthday ? countdown(birthday.daysUntil, t) : '—'}
            highlight={birthday?.daysUntil === 0}
          />
          <Stat
            label={t('person.age')}
            value={age !== undefined ? String(age) : '—'}
            hint={age === undefined ? t('upcoming.dateUnknownYear') : undefined}
          />
          <Stat label={t('person.nameday')} value={nameday ? countdown(nameday.daysUntil, t) : '—'} />
        </Row>

        <Card style={{ gap: 6 }}>
          <SectionLabel>{t('person.birthday')}</SectionLabel>
          {birth ? (
            <Body>
              🎂{' '}
              {birth.year !== null
                ? formatLongDate(person.birthDate, dateFnsLocale)
                : `${formatDayMonth({ month: birth.month, day: birth.day }, dateFnsLocale)} · ${t('upcoming.dateUnknownYear')}`}
            </Body>
          ) : null}
          {birthday ? (
            <Body muted>
              {age !== undefined
                ? t('person.turnsOn', { age, date: formatShortDate(birthday.date, dateFnsLocale) })
                : t('person.birthdayOn', { date: formatShortDate(birthday.date, dateFnsLocale) })}
              {birthday.milestone ? ` · ${t('event.milestone')}` : ''}
            </Body>
          ) : null}
          {person.nameDay ? (
            <Body muted>🕯️ {t('person.namedayOn', { date: formatDayMonth(person.nameDay, dateFnsLocale) })}</Body>
          ) : (
            <Body muted>{t('person.noNameday')}</Body>
          )}
          <Body muted>
            {t('person.remindersBirthday')}:{' '}
            {person.reminderOffsets.length ? person.reminderOffsets.map((o) => reminderLabel(o, t)).join(', ') : '—'}
          </Body>
        </Card>

        <Card style={{ gap: space.sm }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <SectionLabel style={{ marginBottom: 0 }}>{t('person.celebration')}</SectionLabel>
            <Pressable onPress={() => router.push({ pathname: '/person/[id]/celebration', params: { id: person.id } })}>
              <Text style={{ color: theme.accent, fontWeight: '700' }}>{celebration ? t('celebration.edit') : t('celebration.plan')}</Text>
            </Pressable>
          </Row>
          {celebration ? (
            <View style={{ gap: 4 }}>
              <Body>
                🎉 {formatShortDate(celebration.date, dateFnsLocale)}
                {celebration.time ? ` · ${celebration.time}` : ''}
                {celebration.place ? ` · ${celebration.place}` : ''}
              </Body>
              {celebration.checklist.length ? (
                <Body muted>
                  {t('celebration.checklistDone', {
                    done: celebration.checklist.filter((i) => i.done).length,
                    total: celebration.checklist.length,
                  })}
                </Body>
              ) : null}
              {celebration.checklist.slice(0, 5).map((i, idx) => (
                <Text
                  key={idx}
                  style={{ fontSize: 14, color: i.done ? theme.muted : theme.text, textDecorationLine: i.done ? 'line-through' : 'none' }}
                >
                  {i.done ? '☑' : '☐'} {i.text}
                </Text>
              ))}
            </View>
          ) : (
            <Body muted>{t('person.celebrationEmpty')}</Body>
          )}
        </Card>

        <Card style={{ gap: space.sm }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <SectionLabel style={{ marginBottom: 0 }}>{t('person.gifts')}</SectionLabel>
            <Pressable onPress={() => router.push({ pathname: '/person/[id]/gift', params: { id: person.id } })}>
              <Text style={{ color: theme.accent, fontWeight: '700' }}>{t('gift.add')}</Text>
            </Pressable>
          </Row>
          {ideas.length === 0 ? <Body muted>{t('person.giftsEmpty')}</Body> : null}
          {ideas.map((g) => (
            <View key={g.id} style={{ borderTopWidth: 1, borderTopColor: theme.line, paddingTop: space.sm, gap: 6 }}>
              <Row style={{ alignItems: 'flex-start' }}>
                {g.imageUri ? (
                  <Image
                    source={{ uri: g.imageUri }}
                    style={{ width: 48, height: 48, borderRadius: radius.sm, backgroundColor: theme.line }}
                  />
                ) : null}
                <View style={{ flex: 1 }}>
                  <Pressable onPress={() => router.push({ pathname: '/person/[id]/gift', params: { id: person.id, ideaId: g.id } })}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>{g.title}</Text>
                  </Pressable>
                  {g.url ? (
                    <Pressable onPress={() => void Linking.openURL(g.url!)}>
                      <Text style={{ fontSize: 12, color: theme.accent }} numberOfLines={1}>
                        {g.url}
                      </Text>
                    </Pressable>
                  ) : null}
                  {g.note ? <Text style={{ fontSize: 13, color: theme.muted }}>{g.note}</Text> : null}
                  {g.participantIds?.length ? (
                    <Text style={{ fontSize: 12, color: theme.muted }}>
                      {t('gift.participants')}: {g.participantIds.map((participantId) => people.find((p) => p.id === participantId)?.name).filter(Boolean).join(', ')}
                    </Text>
                  ) : null}
                  {g.paidParticipantIds?.length ? (
                    <Text style={{ fontSize: 12, color: theme.muted }}>
                      {t('gift.paid')}: {g.paidParticipantIds.map((participantId) => people.find((p) => p.id === participantId)?.name).filter(Boolean).join(', ')}
                    </Text>
                  ) : null}
                  {g.externalContributors?.length ? (
                    <Text style={{ fontSize: 12, color: theme.muted }}>
                      {t(g.participantIds?.length ? 'gift.externalParticipants' : 'gift.participants')}: {g.externalContributors.map((contributor) => `${contributor.name} (${contributor.paid ? t('gift.paidStatus') : t('gift.unpaidStatus')})`).join(', ')}
                    </Text>
                  ) : null}
                </View>
              </Row>
              <Row style={{ flexWrap: 'wrap' }}>
                <Chip
                  label={t('gift.markGiven')}
                  onPress={() => router.push({ pathname: '/person/[id]/record', params: { id: person.id, ideaId: g.id } })}
                />
                <Chip
                  label={t('common.delete')}
                  onPress={() => confirm(t('gift.delete'), t('gift.delete'), () => void deleteGiftIdea(g.id))}
                />
              </Row>
            </View>
          ))}
        </Card>

        <Card style={{ gap: space.sm }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <SectionLabel style={{ marginBottom: 0 }}>{t('person.history')}</SectionLabel>
            <Pressable onPress={() => router.push({ pathname: '/person/[id]/record', params: { id: person.id } })}>
              <Text style={{ color: theme.accent, fontWeight: '700' }}>{t('record.add')}</Text>
            </Pressable>
          </Row>
          {history.length === 0 ? <Body muted>{t('person.historyEmpty')}</Body> : null}
          {history.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => router.push({ pathname: '/person/[id]/record', params: { id: person.id, recordId: r.id } })}
              style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}
            >
              <Text style={{ width: 44, fontSize: 14, fontWeight: '800', color: theme.muted, fontVariant: ['tabular-nums'] }}>
                {r.year}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: theme.text }}>{r.title}</Text>
                <Text style={{ fontSize: 12, color: theme.muted }}>
                  {t(`record.occasion.${r.occasion}`)}
                  {r.note ? ` · ${r.note}` : ''}
                </Text>
              </View>
              {r.amount != null ? (
                <Text style={{ fontSize: 14, color: theme.text, fontVariant: ['tabular-nums'] }}>{money.format(r.amount)}</Text>
              ) : null}
            </Pressable>
          ))}
        </Card>

        {person.notes ? (
          <Card style={{ gap: 6 }}>
            <SectionLabel>{t('person.notes')}</SectionLabel>
            <Body>{person.notes}</Body>
          </Card>
        ) : null}

        <Button
          label={t('person.delete')}
          variant="ghost"
          onPress={() =>
            confirm(
              t('person.delete'),
              t('person.deleteConfirm', { name: person.name }),
              () => void deletePerson(person.id).then(() => router.replace('/')),
            )
          }
          style={{ marginTop: space.md }}
        />
      </ScrollView>
    </Screen>
  );
}

function isBuiltIn(tag: string): tag is 'family' | 'friend' | 'work' | 'neighbour' {
  return tag === 'family' || tag === 'friend' || tag === 'work' || tag === 'neighbour';
}

/** Short countdown for the stat tiles: "Oggi" / "12 giorni". */
function countdown(daysUntil: number, t: ReturnType<typeof useT>): string {
  return daysUntil <= 0 ? t('relative.today') : t('relative.daysShort', { count: daysUntil });
}

function reminderLabel(offset: number, t: ReturnType<typeof useT>): string {
  if (offset === 0) return t('form.reminder.sameDay');
  if (offset === 1) return t('form.reminder.dayBefore');
  if (offset === 7) return t('form.reminder.weekBefore');
  return t('relative.daysShort', { count: offset });
}

function Stat({ label, value, hint, highlight }: { label: string; value: string; hint?: string; highlight?: boolean }) {
  const theme = useTheme();
  return (
    <Card
      style={{
        flex: 1,
        alignItems: 'center',
        padding: space.md,
        gap: 2,
        backgroundColor: highlight ? theme.todaySoft : theme.card,
        borderColor: highlight ? theme.today : theme.line,
      }}
    >
      <Text
        style={{ fontSize: 16, fontWeight: '800', color: highlight ? theme.today : theme.text, fontVariant: ['tabular-nums'] }}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={{ fontSize: 11, color: theme.muted }}>{hint ?? label}</Text>
    </Card>
  );
}

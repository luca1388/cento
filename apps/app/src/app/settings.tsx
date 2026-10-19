import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import { LOCALE_CODES, SUPPORTED_LOCALES, type LanguageSetting } from '@cento/i18n';
import { buildICS, NAMEDAY_COUNTRIES, parseBackup, serializeBackup, todayISO, type Feb29Policy } from '@cento/core';
import { Body, Button, Card, Chip, Field, Row, SectionLabel, Screen, SettingRow, Switch } from '@/components/ui';
import { useData } from '@/storage/DataProvider';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { samplePeople } from '@/utils/sample';
import { space, useTheme } from '@/theme';
import { exportTextFile, pickTextFile } from '@/backup/files';
import { notificationsSupported, scheduledCount } from '@/notifications/scheduler';
import { widgetsSupported, writeWidgetSnapshot } from '@/widgets/snapshotStore';
import { buildDerived } from '@/sync/build';
import { formatShortDate } from '@/utils/format';
import type { ImportMode } from '@/storage/repository';

export default function SettingsScreen() {
  const theme = useTheme();
  const t = useT();
  const { locale, dateFnsLocale } = useLocale();
  const { settings, updateSettings, people, celebrations, giftRecords, repository, refresh, clearAll, importBackup } = useData();
  const [pending, setPending] = useState<number | null>(null);
  const [timeText, setTimeText] = useState(settings.notificationTime);
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [message, setMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (notificationsSupported) void scheduledCount().then(setPending);
    }, []),
  );
  useEffect(() => setTimeText(settings.notificationTime), [settings.notificationTime]);

  const languages: { value: LanguageSetting; label: string }[] = [
    { value: 'system', label: t('settings.language.system') },
    ...LOCALE_CODES.map((code) => ({ value: code, label: SUPPORTED_LOCALES[code].label })),
  ];

  const year = Number(todayISO().slice(0, 4));
  const spent = useMemo(
    () => giftRecords.filter((r) => r.year === year && r.amount != null).reduce((s, r) => s + (r.amount ?? 0), 0),
    [giftRecords, year],
  );
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

  function confirm(title: string, body: string, run: () => void) {
    if (Platform.OS === 'web') {
      if (window.confirm(body)) run();
      return;
    }
    Alert.alert(title, body, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.ok'), style: 'destructive', onPress: run },
    ]);
  }

  async function addSample() {
    for (const p of samplePeople(new Date())) await repository.savePerson(p);
    await refresh();
  }

  function commitTime() {
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(timeText.trim())) void updateSettings({ notificationTime: timeText.trim() });
    else setTimeText(settings.notificationTime);
  }

  async function exportJson() {
    const data = await repository.exportAll();
    await exportTextFile(`cento-backup-${todayISO()}.json`, serializeBackup(data), 'application/json', 'public.json');
    setMessage(t('backup.export.done'));
  }

  async function exportIcs() {
    const ics = buildICS(
      { people, celebrations },
      {
        birthday: (n) => `${t('event.birthday')}: ${n}`,
        nameday: (n) => `${t('event.nameday')}: ${n}`,
        celebration: (n) => t('event.party', { name: n }),
      },
    );
    await exportTextFile(`cento-${todayISO()}.ics`, ics, 'text/calendar', 'public.calendar-event');
    setMessage(t('backup.export.done'));
  }

  async function importJson() {
    const text = await pickTextFile();
    if (text === null) return;
    let data;
    try {
      data = parseBackup(text);
    } catch (e) {
      setMessage(t('backup.import.error', { reason: e instanceof Error ? e.message : 'unknown' }));
      return;
    }
    const run = async () => {
      await importBackup(data, importMode);
      setMessage(t('backup.import.done', { count: data.people.length }));
    };
    if (importMode === 'replace') confirm(t('backup.import.title'), t('backup.import.replaceConfirm'), () => void run());
    else await run();
  }

  async function refreshWidget() {
    if (!dateFnsLocale) return;
    const { snapshot } = buildDerived({
      people,
      celebrations,
      settings,
      locale,
      dateFnsLocale,
      today: todayISO(),
      t: t as (k: string, o?: Record<string, unknown>) => string,
    });
    const ok = await writeWidgetSnapshot(snapshot);
    if (ok) await updateSettings({ widgetUpdatedAt: new Date().toISOString() });
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: 48 }}>
        <Card style={{ gap: space.md, borderColor: theme.accent, borderWidth: 1.5 }}>
          <SectionLabel>{t('settings.privacy.title')}</SectionLabel>
          <Body>{t('settings.privacy.body')}</Body>
          <View style={{ gap: space.sm }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.muted }}>{t('backup.export.title')}</Text>
            <Row>
              <Button
                label={t('backup.export.json')}
                variant="secondary"
                onPress={() => void exportJson()}
                style={{ flex: 1, backgroundColor: theme.card }}
              />
              <Button
                label={t('backup.export.ics')}
                variant="secondary"
                onPress={() => void exportIcs()}
                style={{ flex: 1, backgroundColor: theme.card }}
              />
            </Row>
            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.muted }}>{t('backup.import.title')}</Text>
            <Row style={{ flexWrap: 'wrap' }}>
              <Chip label={t('backup.import.merge')} selected={importMode === 'merge'} onPress={() => setImportMode('merge')} />
              <Chip label={t('backup.import.replace')} selected={importMode === 'replace'} onPress={() => setImportMode('replace')} />
            </Row>
            <Button
              label={t('backup.import.pick')}
              variant="secondary"
              onPress={() => void importJson()}
              style={{ backgroundColor: theme.card }}
            />
            {Platform.OS === 'web' ? <Text style={{ fontSize: 12, color: theme.muted }}>{t('backup.webHint')}</Text> : null}
            {message ? <Text style={{ fontSize: 13, color: theme.text, fontWeight: '600' }}>{message}</Text> : null}
          </View>
          <SettingRow
            title={t('settings.privacy.contacts')}
            onPress={() => router.push('/import-contacts')}
            right={<Text style={{ color: theme.muted }}>›</Text>}
          />
          <SettingRow
            title={t('settings.privacy.policy')}
            onPress={() => router.push('/privacy')}
            right={<Text style={{ color: theme.muted }}>›</Text>}
          />
        </Card>

        <Card style={{ gap: space.sm }}>
          <SectionLabel>{t('settings.language')}</SectionLabel>
          <Row style={{ flexWrap: 'wrap' }}>
            {languages.map((l) => (
              <Chip
                key={l.value}
                label={l.label}
                selected={settings.language === l.value}
                onPress={() => void updateSettings({ language: l.value })}
              />
            ))}
          </Row>
        </Card>

        {
          notificationsSupported && <Card style={{ gap: space.sm }}>
            <SectionLabel>{t('settings.notifications')}</SectionLabel>
            <>
              <SettingRow
                title={t('settings.notifications.enable')}
                right={<Switch value={settings.notificationsEnabled} onChange={(v) => void updateSettings({ notificationsEnabled: v })} />}
              />
              <Field
                label={t('settings.notifications.time')}
                value={timeText}
                onChangeText={setTimeText}
                onBlur={commitTime}
                onSubmitEditing={commitTime}
                maxLength={5}
                placeholder="09:00"
              />
              {pending !== null ? <Body muted>{t('settings.notifications.scheduled', { count: pending })}</Body> : null}
            </>
          </Card>
        }

        <Card style={{ gap: space.sm }}>
          <SectionLabel>{t('settings.namedays')}</SectionLabel>
          <SettingRow
            title={t('settings.namedays.show')}
            right={<Switch value={settings.showNameDays} onChange={(v) => void updateSettings({ showNameDays: v })} />}
          />
          {settings.showNameDays ? (
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 13, color: theme.muted }}>{t('settings.namedays.calendar')}</Text>
              <Row style={{ flexWrap: 'wrap' }}>
                {NAMEDAY_COUNTRIES.map((c) => (
                  <Chip
                    key={c}
                    label={t(`settings.namedays.calendar.${c}`)}
                    selected={settings.nameDayCountry === c}
                    onPress={() => void updateSettings({ nameDayCountry: c })}
                  />
                ))}
              </Row>
            </View>
          ) : null}
        </Card>

        <Card style={{ gap: space.sm }}>
          <SectionLabel>{t('settings.feb29')}</SectionLabel>
          <Row style={{ flexWrap: 'wrap' }}>
            {(['feb28', 'mar1'] as Feb29Policy[]).map((p) => (
              <Chip
                key={p}
                label={t(`settings.feb29.${p}`)}
                selected={settings.feb29Policy === p}
                onPress={() => void updateSettings({ feb29Policy: p })}
              />
            ))}
          </Row>
        </Card>

        {/* <Card style={{ gap: space.sm }}>
          <SectionLabel>{t('settings.widget')}</SectionLabel>
          {widgetsSupported ? (
            <>
              <Body muted>{t('settings.widget.hint')}</Body>
              {settings.widgetUpdatedAt ? (
                <Body muted>
                  {t('settings.widget.updated', { date: formatShortDate(settings.widgetUpdatedAt.slice(0, 10), dateFnsLocale) })}
                </Body>
              ) : null}
              <Button label={t('settings.widget.refresh')} variant="secondary" onPress={() => void refreshWidget()} />
            </>
          ) : (
            <Body muted>{t('settings.widget.web')}</Body>
          )}
        </Card> */}

        <Card style={{ gap: space.sm }}>
          <SectionLabel>{t('settings.spending')}</SectionLabel>
          <Body muted>{t('settings.spending.year', { year, amount: money.format(spent) })}</Body>
        </Card>

        <Card style={{ gap: space.sm }}>
          <SectionLabel>{t('settings.data')}</SectionLabel>
          <Body muted>{t('settings.data.count', { count: people.length })}</Body>
          <Row>
            {__DEV__ ? (
              <Button label={t('settings.data.sample')} variant="secondary" onPress={() => void addSample()} style={{ flex: 1 }} />
            ) : null}
            <Button
              label={t('settings.data.clear')}
              variant="danger"
              onPress={() => confirm(t('settings.data.clear'), t('settings.data.clearConfirm'), () => void clearAll())}
              style={{ flex: 1 }}
            />
          </Row>
        </Card>

        <Card style={{ gap: 4 }}>
          <SectionLabel>{t('settings.about')}</SectionLabel>
          <Body muted>{t('settings.version', { version: Constants.expoConfig?.version ?? '0.1.0' })}</Body>
          <Body muted>{t('app.tagline')}</Body>
        </Card>
      </ScrollView>
    </Screen>
  );
}

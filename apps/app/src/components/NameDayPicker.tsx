import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { namesOn, suggestNameDay, type MonthDay } from '@cento/core';
import { Button, Card, Chip, Field, Row, SectionLabel } from './ui';
import { space, useTheme } from '@/theme';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { formatDayMonth } from '@/utils/format';

interface Props {
  firstName: string;
  value: MonthDay | null;
  onChange: (md: MonthDay | null) => void;
}

/**
 * Name-day field: pre-filled from the saints calendar, with a "change date" link that offers the
 * other candidate dates for the name (or any date by hand).
 */
export function NameDayPicker({ firstName, value, onChange }: Props) {
  const theme = useTheme();
  const t = useT();
  const { dateFnsLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const [manualDay, setManualDay] = useState('');
  const [manualMonth, setManualMonth] = useState('');

  const suggestion = useMemo(() => suggestNameDay(firstName), [firstName]);
  const isSuggested = !!value && !!suggestion && suggestion.candidates.some((c) => c.month === value.month && c.day === value.day);

  const manualValid = useMemo(() => {
    const d = Number(manualDay);
    const m = Number(manualMonth);
    return Number.isInteger(d) && Number.isInteger(m) && m >= 1 && m <= 12 && d >= 1 && d <= 31;
  }, [manualDay, manualMonth]);

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: theme.muted }}>{t('form.nameday')}</Text>
      <Card style={{ padding: space.md, gap: 4 }}>
        {value ? (
          <>
            <Text style={{ fontSize: 16, color: theme.text, fontWeight: '600' }}>
              {formatDayMonth(value, dateFnsLocale)}
              {namesOn(value).length ? (
                <Text style={{ color: theme.muted, fontWeight: '400' }}> · {namesOn(value).slice(0, 4).join(', ')}</Text>
              ) : null}
            </Text>
            {isSuggested ? <Text style={{ fontSize: 12, color: theme.muted }}>{t('form.namedaySuggested')}</Text> : null}
          </>
        ) : (
          <Text style={{ fontSize: 14, color: theme.muted }}>
            {firstName.trim() && !suggestion ? t('form.namedayUnknown') : t('form.namedayNone')}
          </Text>
        )}
        <Row style={{ marginTop: 6 }}>
          <Pressable onPress={() => setOpen(true)}>
            <Text style={{ color: theme.accent, fontWeight: '700' }}>{t('form.namedayChange')}</Text>
          </Pressable>
          {value ? (
            <Pressable onPress={() => onChange(null)} style={{ marginLeft: space.md }}>
              <Text style={{ color: theme.muted, fontWeight: '700' }}>{t('form.namedayNone')}</Text>
            </Pressable>
          ) : null}
        </Row>
      </Card>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
        >
          <ScrollView
            style={{ flex: 1, backgroundColor: theme.bg }}
            contentContainerStyle={{ padding: space.xl, gap: space.lg }}
            keyboardShouldPersistTaps="handled"
          >
          <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text }}>{t('form.namedayPickTitle')}</Text>
          {suggestion ? (
            <View style={{ gap: space.sm }}>
              <SectionLabel>{t('form.namedayCandidates', { name: firstName.trim() })}</SectionLabel>
              <Row style={{ flexWrap: 'wrap' }}>
                {suggestion.candidates.map((c) => (
                  <Chip
                    key={`${c.month}-${c.day}`}
                    label={formatDayMonth(c, dateFnsLocale)}
                    selected={!!value && value.month === c.month && value.day === c.day}
                    onPress={() => {
                      onChange(c);
                      setOpen(false);
                    }}
                  />
                ))}
              </Row>
            </View>
          ) : null}
          <View style={{ gap: space.sm }}>
            <SectionLabel>{t('form.namedayManual')}</SectionLabel>
            <Row>
              <View style={{ flex: 1 }}>
                <Field label={t('form.day')} keyboardType="number-pad" value={manualDay} onChangeText={setManualDay} maxLength={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Field label={t('form.month')} keyboardType="number-pad" value={manualMonth} onChangeText={setManualMonth} maxLength={2} />
              </View>
            </Row>
            <Button
              label={t('common.done')}
              disabled={!manualValid}
              style={{ opacity: manualValid ? 1 : 0.5 }}
              onPress={() => {
                onChange({ month: Number(manualMonth), day: Number(manualDay) });
                setOpen(false);
              }}
            />
          </View>
          <Button label={t('common.cancel')} variant="ghost" onPress={() => setOpen(false)} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

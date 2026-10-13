import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { ChecklistItem } from '@cento/core';
import { radius, space, useTheme } from '@/theme';
import { useT } from '@/i18n/useT';

export function ChecklistEditor({ items, onChange }: { items: ChecklistItem[]; onChange: (items: ChecklistItem[]) => void }) {
  const theme = useTheme();
  const t = useT();
  const [draft, setDraft] = useState('');

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    onChange([...items, { text, done: false }]);
    setDraft('');
  };

  return (
    <View style={{ gap: space.sm }}>
      {items.map((item, i) => (
        <View key={`${i}-${item.text}`} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.done }}
            onPress={() => onChange(items.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))}
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              borderWidth: 2,
              borderColor: item.done ? theme.accent : theme.line,
              backgroundColor: item.done ? theme.accent : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item.done ? <Text style={{ color: theme.onPrimary, fontWeight: '800', fontSize: 14 }}>✓</Text> : null}
          </Pressable>
          <Text
            style={{
              flex: 1,
              fontSize: 15,
              color: item.done ? theme.muted : theme.text,
              textDecorationLine: item.done ? 'line-through' : 'none',
            }}
          >
            {item.text}
          </Text>
          <Pressable hitSlop={8} onPress={() => onChange(items.filter((_, j) => j !== i))} accessibilityLabel={t('common.remove')}>
            <Text style={{ color: theme.muted, fontSize: 18 }}>×</Text>
          </Pressable>
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={add}
          placeholder={t('celebration.checklistPlaceholder')}
          placeholderTextColor={theme.muted}
          style={{
            flex: 1,
            backgroundColor: theme.card,
            color: theme.text,
            borderColor: theme.line,
            borderWidth: 1,
            borderRadius: radius.sm,
            paddingVertical: 8,
            paddingHorizontal: space.md,
            fontSize: 15,
          }}
        />
        <Pressable
          onPress={add}
          style={{ paddingHorizontal: space.md, justifyContent: 'center', backgroundColor: theme.accentSoft, borderRadius: radius.sm }}
        >
          <Text style={{ color: theme.text, fontWeight: '700' }}>{t('common.add')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

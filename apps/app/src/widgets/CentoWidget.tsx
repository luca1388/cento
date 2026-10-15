import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetDay, WidgetSnapshot } from '@cento/core';
import { palette } from '@/theme';

interface Props {
  snapshot: WidgetSnapshot | null;
  width: number;
  height: number;
  today?: string;
}

function dayEntry(snapshot: WidgetSnapshot | null, today: string): WidgetDay | null {
  if (!snapshot) return null;
  return snapshot.days.find((d) => d.date === today) ?? snapshot.days[snapshot.days.length - 1] ?? null;
}

function isoToday(): string {
  const n = new Date();
  const p = (x: number) => (x < 10 ? `0${x}` : String(x));
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
}

/**
 * Android widget, rendered to RemoteViews by react-native-android-widget. Three tiers by size, same as
 * iOS small / medium / large. It knows nothing about birthdays: every string comes from the snapshot.
 */
export function CentoWidget({ snapshot, width, height, today = isoToday() }: Props) {
  'use no memo';

  const day = dayEntry(snapshot, today);
  const items = day?.items ?? [];
  const tier = width < 200 ? 'small' : height < 200 ? 'medium' : 'large';
  const shown = tier === 'small' ? items.slice(0, 1) : tier === 'medium' ? items.slice(0, 4) : items.slice(0, 7);
  const first = shown[0];

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: first?.deepLink ?? 'cento://' }}
      style={{
        width: 'match_parent',
        height: 'match_parent',
        backgroundColor: palette.primary,
        borderRadius: 20,
        padding: 14,
        flexDirection: 'column',
      }}
    >
      <TextWidget text={day?.headline ?? ''} style={{ fontSize: 11, color: '#a9b0c6', fontWeight: '700' }} maxLines={1} />
      {first ? (
        <FlexWidget style={{ flexDirection: 'column', marginTop: 6 }}>
          <TextWidget
            text={first.name}
            style={{ fontSize: tier === 'small' ? 18 : 16, color: palette.onPrimary, fontWeight: '800' }}
            maxLines={1}
          />
          <TextWidget text={first.long} style={{ fontSize: 12, color: '#dfe3ee' }} maxLines={2} />
        </FlexWidget>
      ) : null}
      {shown.slice(1).map((item) => (
        <FlexWidget
          key={item.id}
          clickAction="OPEN_URI"
          clickActionData={{ uri: item.deepLink }}
          style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}
        >
          <FlexWidget style={{ flex: 1 }}>
            <TextWidget text={`${item.name} `} style={{ fontSize: 13, color: palette.onPrimary, fontWeight: '700' }} maxLines={1} />
          </FlexWidget>
          <TextWidget text={item.short.split(' · ')[1] ?? item.short} style={{ fontSize: 12, color: '#dfe3ee' }} maxLines={1} />
        </FlexWidget>
      ))}
    </FlexWidget>
  );
}

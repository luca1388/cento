import React from 'react';
import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';
import type { BirthdayWidgetModel, WidgetDay, WidgetPerson, WidgetSnapshot } from '@cento/core';
import { widgetTheme as colors } from './theme';

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

function ringSvg(daysLeft: number, progress: number, size: number, unit: string, badge: string, badgeColor: string, showBadge: boolean, secondPerson?: WidgetPerson): string {
  const center = size / 2;
  const radius = center - 4;
  const circumference = 2 * Math.PI * radius;
  const dash = Math.round(circumference * progress * 100) / 100;
  const label = daysLeft === 0 ? 'Oggi' : String(daysLeft);
  const unitText = daysLeft === 0 ? '' : unit;
  const badgeRadius = size >= 80 ? 15 : 11;
  const badgeX = center + radius * 0.72;
  const badgeY = center + radius * 0.72;
  const fontSize = daysLeft === 0 ? size >= 80 ? 14 : 12 : size >= 80 ? 34 : 26;
  const badgeFontSize = badge.length > 1 ? 12 : size <= 80 ? 14 : 16;
  const ringUnit = size <= 70 ? '' : unitText;
  const unitX = size <= 80 ? center - 5 : center;
  const unitY = size <= 80 ? center + 14 : center + 21;
  const unitFontSize = size <= 80 ? 9 : 11;
  const centerContent = size <= 70 && secondPerson
    ? `<circle cx="${center - 12}" cy="${center}" r="14" fill="${badgeColor}" stroke="${colors.bg}" stroke-width="2"/><text x="${center - 12}" y="${center + 5}" fill="${colors.onAvatar}" font-size="14" font-family="Roboto, sans-serif" font-weight="700" text-anchor="middle">${badge}</text><circle cx="${center + 12}" cy="${center}" r="14" fill="${secondPerson.avatarColor}" stroke="${colors.bg}" stroke-width="2"/><text x="${center + 12}" y="${center + 5}" fill="${colors.onAvatar}" font-size="14" font-family="Roboto, sans-serif" font-weight="700" text-anchor="middle">${secondPerson.initial}</text>`
    : `<text x="${center}" y="${center + (daysLeft === 0 ? fontSize * 0.35 : ringUnit ? 4 : 10)}" fill="${colors.accent}" font-size="${fontSize}" font-family="Roboto, sans-serif" font-weight="700" text-anchor="middle">${label}</text>${ringUnit ? `<text x="${unitX}" y="${unitY}" fill="${colors.textMuted}" font-size="${unitFontSize}" font-family="Roboto, sans-serif" text-anchor="middle">${ringUnit}</text>` : ''}`;
  const badgeContent = size <= 70 || !showBadge ? '' : `<circle cx="${badgeX}" cy="${badgeY}" r="${badgeRadius}" fill="${badgeColor}" stroke="${colors.bg}" stroke-width="3"/><text x="${badgeX}" y="${badgeY + badgeFontSize * 0.34}" fill="${colors.onAvatar}" font-size="${badgeFontSize}" font-family="Roboto, sans-serif" font-weight="700" text-anchor="middle">${badge}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${colors.ringTrack}" stroke-width="5"/><circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${colors.accent}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${dash} ${circumference}" transform="rotate(-90 ${center} ${center})"/>${centerContent}${badgeContent}</svg>`;
}

function Ring({ model, size, person }: { model: NonNullable<BirthdayWidgetModel['hero']>; size: number; person?: WidgetPerson }) {
  const badge = size <= 70 && model.totalCount > 1 ? model.people[0]?.initial ?? '' : model.totalCount > 1 ? String(model.totalCount) : person?.initial ?? '?';
  const badgeColor = model.totalCount > 1 ? colors.avatarCoral : person?.avatarColor ?? colors.avatarCoral;
  const secondPerson = size <= 70 && model.totalCount > 1 ? model.people[1] : undefined;
  return <SvgWidget svg={ringSvg(model.daysLeft, model.ringProgress, size, model.ringUnit, badge, badgeColor, model.totalCount > 1, secondPerson)} style={{ width: size, height: size }} />;
}

function Avatar({ person, size }: { person: WidgetPerson; size: number }) {
  return (
    <FlexWidget style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: person.avatarColor as `#${string}`, alignItems: 'center', justifyContent: 'center' }}>
      <TextWidget text={person.initial} style={{ fontSize: size > 30 ? 17 : 14, color: colors.onAvatar, fontWeight: '700' }} maxLines={1} />
    </FlexWidget>
  );
}

function UpcomingRow({ item, rowHeight }: { item: NonNullable<BirthdayWidgetModel['upcoming']>[number]; rowHeight: number }) {
  return (
    <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', alignItems: 'center', height: rowHeight }}>
      <Avatar person={item.person} size={28} />
      <FlexWidget style={{ flex: 1, flexDirection: 'column', marginLeft: 9 }}>
        <TextWidget text={item.person.name} style={{ fontSize: 13, color: colors.text, fontWeight: '700' }} maxLines={1} truncate="END" />
        <TextWidget text={item.dateLabel} style={{ fontSize: 11, color: colors.textMuted }} maxLines={1} />
      </FlexWidget>
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 6, width: 30, justifyContent: 'flex-end' }}>
        <TextWidget text={String(item.daysLeft)} style={{ fontSize: 18, color: colors.accent, fontWeight: '700' }} maxLines={1} />
      </FlexWidget>
    </FlexWidget>
  );
}

function EmptyWidget({ model }: { model: BirthdayWidgetModel }) {
  return (
    <FlexWidget style={{ width: 'match_parent', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
      <TextWidget text={model.emptyTitle} style={{ width: 'match_parent', fontSize: 15, color: colors.text, fontWeight: '700', textAlign: 'center' }} maxLines={2} />
      <TextWidget text={model.emptyHint} style={{ width: 'match_parent', fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 5 }} maxLines={2} />
      {model.emptyReadHint ? <TextWidget text={model.emptyReadHint} style={{ width: 'match_parent', fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 3 }} maxLines={1} /> : null}
    </FlexWidget>
  );
}

function CompactWidget({ model, width, height }: { model: BirthdayWidgetModel; width: number; height: number }) {
  const hero = model.hero!;
  const first = hero.people[0];
  const names = hero.totalCount === 1
    ? first!.name
    : hero.totalCount === 2
      ? `${first!.name.split(/\s+/)[0]} e ${hero.people[1]!.name.split(/\s+/)[0]}`
      : `${first!.name.split(/\s+/)[0]}, ${hero.people[1]!.name.split(/\s+/)[0]} +${hero.totalCount - 2}`;
  const detail = hero.totalCount === 1
    ? first?.ageLabel ?? ''
    : hero.countLabel;
  return (
    <FlexWidget style={{ width: 'match_parent', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGap: 8, padding: 4 }}>
      <TextWidget text={hero.totalCount > 1 ? model.sectionNextPlural : model.sectionNext} style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', textAlign: 'center' }} maxLines={1} />
      <Ring model={hero} size={Math.max(72, Math.min(88, Math.min(width, height) - 64))} person={first} />
      <FlexWidget style={{ flexDirection: 'column', alignItems: 'center' }}>
        <TextWidget text={names} style={{ fontSize: 16, color: colors.text, fontWeight: '700', textAlign: 'center' }} maxLines={1} truncate="END" />
        {detail ? <TextWidget text={detail} style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center' }} maxLines={1} truncate="END" /> : null}
        <TextWidget text={hero.dateLabel} style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center' }} maxLines={1} truncate="END" />
      </FlexWidget>
    </FlexWidget>
  );
}

function WideWidget({ model, width, height }: { model: BirthdayWidgetModel; width: number; height: number }) {
  const leftWidth = Math.max(78, Math.round((width - 28) * 0.42));
  const upcoming = model.upcoming.slice(0, 3);
  const rowHeight = Math.max(30, Math.floor((height - 14) / Math.max(upcoming.length, 1)));
  return (
    <FlexWidget style={{ width: 'match_parent', flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 2 }}>
      <FlexWidget style={{ width: leftWidth, height: 'match_parent' }}>
        <CompactWidget model={model} width={leftWidth} height={height} />
      </FlexWidget>
      <FlexWidget style={{ width: 1, height: 'match_parent', marginHorizontal: 6, backgroundColor: colors.ringTrack }} />
      <FlexWidget style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
        {upcoming.map((item, index) => (
          <FlexWidget key={item.person.id} style={{ width: 'match_parent', flexDirection: 'column' }}>
            {index > 0 ? <FlexWidget style={{ height: 1, backgroundColor: colors.ringTrack }} /> : null}
            <UpcomingRow item={item} rowHeight={rowHeight} />
          </FlexWidget>
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}

/**
 * Android widget, rendered to RemoteViews by react-native-android-widget. It knows nothing about
 * birthdays: every string comes from the snapshot.
 */
export function CentoWidget({ snapshot, width, height, today = isoToday() }: Props) {
  'use no memo';

  const day = dayEntry(snapshot, today);
  const model = day?.birthdayWidget;
  const wide = width >= 220;

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: 'cento://' }}
      style={{
        width: 'match_parent',
        height: 'match_parent',
        backgroundColor: colors.bg,
        borderRadius: 28,
        padding: wide ? 6 : 14,
        flexDirection: 'column',
      }}
    >
      {!model || model.state === 'empty' ? <EmptyWidget model={model ?? fallbackEmptyModel} /> : wide ? <WideWidget model={model} width={width} height={height} /> : <CompactWidget model={model} width={width} height={height} />}
    </FlexWidget>
  );
}

const fallbackEmptyModel: BirthdayWidgetModel = {
  state: 'empty',
  upcoming: [],
  monthRemainingCount: 0,
  monthLabel: '',
  monthFooter: '',
  sectionNext: '',
  sectionNextPlural: '',
  emptyTitle: 'No birthdays saved',
  emptyHint: 'Open the app to add one',
  emptyReadHint: 'Tap to open the app',
};

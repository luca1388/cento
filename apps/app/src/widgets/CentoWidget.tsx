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

function ringSvg(daysLeft: number, progress: number, size: number, unit: string, badge: string, badgeColor: string, secondPerson?: WidgetPerson): string {
  const center = size / 2;
  const radius = center - 4;
  const circumference = 2 * Math.PI * radius;
  const dash = Math.round(circumference * progress * 100) / 100;
  const label = daysLeft === 0 ? 'Oggi' : String(daysLeft);
  const unitText = daysLeft === 0 ? '' : unit;
  const badgeRadius = size >= 80 ? 15 : 13;
  const badgeX = center + radius * 0.72;
  const badgeY = center + radius * 0.72;
  const fontSize = daysLeft === 0 ? 12 : size >= 80 ? 34 : 26;
  const badgeFontSize = badge.length > 1 ? 12 : 16;
  const centerContent = size <= 70 && secondPerson
    ? `<circle cx="${center - 12}" cy="${center}" r="14" fill="${badgeColor}" stroke="${colors.bg}" stroke-width="2"/><text x="${center - 12}" y="${center + 5}" fill="${colors.onAvatar}" font-size="14" font-family="Roboto, sans-serif" font-weight="700" text-anchor="middle">${badge}</text><circle cx="${center + 12}" cy="${center}" r="14" fill="${secondPerson.avatarColor}" stroke="${colors.bg}" stroke-width="2"/><text x="${center + 12}" y="${center + 5}" fill="${colors.onAvatar}" font-size="14" font-family="Roboto, sans-serif" font-weight="700" text-anchor="middle">${secondPerson.initial}</text>`
    : `<text x="${center}" y="${center + 10}" fill="${colors.accent}" font-size="${fontSize}" font-family="Roboto, sans-serif" font-weight="700" text-anchor="middle">${label}</text>${unitText ? `<text x="${center}" y="${center + 27}" fill="${colors.textMuted}" font-size="11" font-family="Roboto, sans-serif" text-anchor="middle">${unitText}</text>` : ''}`;
  const badgeContent = size <= 70 ? '' : `<circle cx="${badgeX}" cy="${badgeY}" r="${badgeRadius}" fill="${badgeColor}" stroke="${colors.bg}" stroke-width="3"/><text x="${badgeX}" y="${badgeY + badgeFontSize * 0.34}" fill="${colors.onAvatar}" font-size="${badgeFontSize}" font-family="Roboto, sans-serif" font-weight="700" text-anchor="middle">${badge}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${colors.ringTrack}" stroke-width="5"/><circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${colors.accent}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${dash} ${circumference}" transform="rotate(-90 ${center} ${center})"/>${centerContent}${badgeContent}</svg>`;
}

function Ring({ model, size, person }: { model: NonNullable<BirthdayWidgetModel['hero']>; size: number; person?: WidgetPerson }) {
  const badge = size <= 70 && model.totalCount > 1 ? model.people[0]?.initial ?? '' : model.totalCount > 1 ? String(model.totalCount) : person?.initial ?? '?';
  const badgeColor = model.totalCount > 1 ? colors.avatarCoral : person?.avatarColor ?? colors.avatarCoral;
  const secondPerson = size <= 70 && model.totalCount > 1 ? model.people[1] : undefined;
  return <SvgWidget svg={ringSvg(model.daysLeft, model.ringProgress, size, model.ringUnit, badge, badgeColor, secondPerson)} style={{ width: size, height: size }} />;
}

function Avatar({ person, size }: { person: WidgetPerson; size: number }) {
  return (
    <FlexWidget style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: person.avatarColor as `#${string}`, alignItems: 'center', justifyContent: 'center' }}>
      <TextWidget text={person.initial} style={{ fontSize: size > 30 ? 17 : 14, color: colors.onAvatar, fontWeight: '700' }} maxLines={1} />
    </FlexWidget>
  );
}

function UpcomingRow({ item, large, rowHeight }: { item: NonNullable<BirthdayWidgetModel['upcoming']>[number]; large: boolean; rowHeight?: number }) {
  return (
    <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', alignItems: 'center', height: rowHeight ?? (large ? 58 : 54), paddingVertical: 4 }}>
      <Avatar person={item.person} size={large ? 34 : 28} />
      <FlexWidget style={{ flex: 1, flexDirection: 'column', marginLeft: 9 }}>
        <TextWidget text={item.person.name} style={{ fontSize: large ? 14 : 13, color: colors.text, fontWeight: '700' }} maxLines={1} truncate="END" />
        <TextWidget text={item.dateLabel} style={{ fontSize: 11, color: colors.textMuted }} maxLines={1} />
      </FlexWidget>
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12, width: large ? 112 : 78, justifyContent: 'flex-end' }}>
        <TextWidget text={String(item.daysLeft)} style={{ fontSize: 18, color: colors.accent, fontWeight: '700' }} maxLines={1} />
        <TextWidget text={` ${item.daysUnit}`} style={{ fontSize: 11, color: colors.textMuted }} maxLines={1} />
      </FlexWidget>
    </FlexWidget>
  );
}

function EmptyWidget({ model }: { model: BirthdayWidgetModel }) {
  return (
    <FlexWidget style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
      <TextWidget text={model.emptyTitle} style={{ fontSize: 15, color: colors.text, fontWeight: '700', textAlign: 'center' }} maxLines={2} />
      <TextWidget text={model.emptyHint} style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 5 }} maxLines={2} />
      {model.emptyReadHint ? <TextWidget text={model.emptyReadHint} style={{ fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 3 }} maxLines={1} /> : null}
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
    ? first?.turningAge !== undefined ? `${hero.relativeLabel} · ${first.ageLabel}` : hero.relativeLabel
    : `${hero.relativeLabel} · ${hero.countLabel}`;
  return (
    <FlexWidget style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGap: 8, padding: 4 }}>
      <TextWidget text={hero.totalCount > 1 ? model.sectionNextPlural : model.sectionNext} style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', textAlign: 'center' }} maxLines={1} />
      <Ring model={hero} size={Math.max(72, Math.min(88, Math.min(width, height) - 64))} person={first} />
      <FlexWidget style={{ flexDirection: 'column', alignItems: 'center' }}>
        <TextWidget text={names} style={{ fontSize: 16, color: colors.text, fontWeight: '700', textAlign: 'center' }} maxLines={1} truncate="END" />
        <TextWidget text={detail} style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center' }} maxLines={1} truncate="END" />
      </FlexWidget>
    </FlexWidget>
  );
}

function LargeWidget({ model, height }: { model: BirthdayWidgetModel; height: number }) {
  const hero = model.hero!;
  const first = hero.people[0]!;
  const maxRows = hero.totalCount > 1 ? 3 : 4;
  const footerHeight = height >= 360 ? 20 : 0;
  const cardHeight = hero.totalCount > 1 ? 164 : 126;
  const headerHeight = 34;
  const rowDividerHeight = 1;
  const availableForRows = height - 36 - cardHeight - headerHeight - footerHeight;
  const rowsThatFit = Math.floor((availableForRows + rowDividerHeight) / (58 + rowDividerHeight));
  const rowCount = Math.min(maxRows, model.upcoming.length, rowsThatFit);
  const rowHeight = rowCount > 0
    ? Math.max(58, Math.min(86, Math.floor((availableForRows - (rowCount - 1) * rowDividerHeight) / rowCount)))
    : 58;
  return (
    <FlexWidget style={{ width: 'match_parent', flex: 1, flexDirection: 'column', padding: 2 }}>
      <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 20, padding: 14, height: hero.totalCount > 1 ? 164 : 126 }}>
        <Ring model={hero} size={88} person={first} />
        <FlexWidget style={{ flex: 1, flexDirection: 'column', marginLeft: 12 }}>
          <TextWidget text={hero.totalCount > 1 ? `${hero.relativeLabel.toLocaleUpperCase()} · ${hero.countLabel.toLocaleUpperCase()}` : hero.relativeLabel.toLocaleUpperCase()} style={{ fontSize: 12, color: colors.accent, fontWeight: '700' }} maxLines={1} truncate="END" />
          {hero.totalCount > 1 ? (
            <FlexWidget style={{ flexDirection: 'column', marginTop: 5 }}>
              {hero.people.map((person) => (
                <FlexWidget key={person.id} style={{ flexDirection: 'row', alignItems: 'center', height: 36 }}>
                  <Avatar person={person} size={30} />
                  <FlexWidget style={{ flexDirection: 'column', marginLeft: 8 }}>
                    <TextWidget text={person.name} style={{ fontSize: 15, color: colors.text, fontWeight: '700' }} maxLines={1} truncate="END" />
                    {person.ageLabel ? <TextWidget text={person.ageLabel} style={{ fontSize: 11, color: colors.textMuted }} maxLines={1} /> : null}
                  </FlexWidget>
                </FlexWidget>
              ))}
              {hero.hiddenCount > 0 ? <TextWidget text={hero.othersLabel} style={{ fontSize: 12, color: colors.textMuted, marginTop: 3 }} maxLines={1} /> : null}
            </FlexWidget>
          ) : (
            <FlexWidget style={{ flexDirection: 'column', marginTop: 3 }}>
              <TextWidget text={first.name} style={{ fontSize: 22, color: colors.text, fontWeight: '700' }} maxLines={2} truncate="END" />
              <TextWidget text={`${hero.dateLabel}${first.ageLabel ? ` · ${first.ageLabel}` : ''}`} style={{ fontSize: 12, color: colors.textMuted }} maxLines={1} truncate="END" />
            </FlexWidget>
          )}
        </FlexWidget>
      </FlexWidget>
      <FlexWidget style={{ height: 12 }} />
      {model.upcoming.slice(0, rowCount).map((item, index) => (
        <FlexWidget key={item.person.id} style={{ width: 'match_parent', flexDirection: 'column' }}>
          <UpcomingRow item={item} large rowHeight={rowHeight} />
          {index < Math.min(model.upcoming.length, rowCount) - 1 ? <FlexWidget style={{ height: 1, backgroundColor: colors.ringTrack }} /> : null}
        </FlexWidget>
      ))}
      {footerHeight > 0 ? <TextWidget text={model.monthFooter} style={{ fontSize: 12, color: colors.textMuted, marginTop: 4, height: 16 }} maxLines={1} /> : null}
    </FlexWidget>
  );
}

/**
 * Android widget, rendered to RemoteViews by react-native-android-widget. Three tiers by size, same as
 * iOS small / medium / large. It knows nothing about birthdays: every string comes from the snapshot.
 */
export function CentoWidget({ snapshot, width, height, today = isoToday() }: Props) {
  'use no memo';

  const day = dayEntry(snapshot, today);
  const model = day?.birthdayWidget;
  const heroCardHeight = (model?.hero?.totalCount ?? 1) > 1 ? 164 : 126;
  const showUpcomingList = width >= 300 && height >= 320 && (height - 36 - (height >= 360 ? 20 : 0) - 34 - heroCardHeight) >= 59;
  const compact = !showUpcomingList;

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: 'cento://' }}
      style={{
        width: 'match_parent',
        height: 'match_parent',
        backgroundColor: colors.bg,
        borderRadius: 28,
        padding: compact ? 14 : 16,
        flexDirection: 'column',
      }}
    >
      {!model || model.state === 'empty' ? <EmptyWidget model={model ?? fallbackEmptyModel} /> : showUpcomingList ? <LargeWidget model={model} height={height} /> : <CompactWidget model={model} width={width} height={height} />}
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

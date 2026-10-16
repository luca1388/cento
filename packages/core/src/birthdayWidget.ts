import { buildUpcomingEvents } from './events';
import { parseBirthDate, parseISODate } from './dates';
import type { Feb29Policy, ISODate, Person } from './types';
import type { Translate } from './relative';

const AVATAR_COLORS = ['#F2A68C', '#B9A8FF', '#8EDBC0', '#F5C66D'] as const;

export interface WidgetPerson {
  id: string;
  name: string;
  initial: string;
  avatarColor: string;
  turningAge?: number;
  ageLabel?: string;
}

export interface BirthdayWidgetHero {
  daysLeft: number;
  relativeLabel: string;
  dateLabel: string;
  ringProgress: number;
  totalCount: number;
  countLabel: string;
  othersLabel: string;
  ringUnit: string;
  people: WidgetPerson[];
  hiddenCount: number;
}

export interface BirthdayWidgetUpcoming {
  person: WidgetPerson;
  dateLabel: string;
  daysLeft: number;
  daysUnit: string;
}

export interface BirthdayWidgetModel {
  state: 'empty' | 'ready';
  hero?: BirthdayWidgetHero;
  upcoming: BirthdayWidgetUpcoming[];
  monthRemainingCount: number;
  monthLabel: string;
  monthFooter: string;
  sectionNext: string;
  sectionNextPlural: string;
  emptyTitle: string;
  emptyHint: string;
  emptyReadHint: string;
}

export interface BirthdayWidgetOptions {
  today: ISODate;
  locale: string;
  t: Translate;
  formatDate?: (date: ISODate) => string;
  formatMonth?: (date: ISODate) => string;
  feb29Policy?: Feb29Policy;
}

function avatarColor(id: string): string {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index++) {
    hash = Math.imul(hash ^ id.charCodeAt(index), 16777619);
  }
  return AVATAR_COLORS[(hash >>> 0) % AVATAR_COLORS.length]!;
}

function toWidgetPerson(person: Person, t: Translate, turningAge?: number): WidgetPerson {
  return {
    id: person.id,
    name: person.name.trim(),
    initial: person.name.trim().split(/\s+/)[0]?.[0]?.toLocaleUpperCase() ?? '?',
    avatarColor: avatarColor(person.id),
    ...(turningAge === undefined ? {} : { turningAge }),
    ...(turningAge === undefined ? {} : { ageLabel: t('event.turns', { count: turningAge }) }),
  };
}

export function buildBirthdayWidgetModel(people: Person[], options: BirthdayWidgetOptions): BirthdayWidgetModel {
  const collator = new Intl.Collator(options.locale, { sensitivity: 'base' });
  const events = buildUpcomingEvents(people, {
    today: options.today,
    feb29Policy: options.feb29Policy,
    includeNameDays: false,
  }).filter((event) => event.kind === 'birthday');

  const unique = new Map<string, (typeof events)[number]>();
  for (const event of events) {
    const person = people.find((candidate) => candidate.id === event.personId);
    if (!person) continue;
    const birth = parseBirthDate(person.birthDate);
    if (!birth) continue;
    const key = `${person.name.trim().toLocaleLowerCase(options.locale)}|${birth.month}-${birth.day}`;
    const previous = unique.get(key);
    if (!previous || collator.compare(event.personName, previous.personName) < 0) unique.set(key, event);
  }

  const birthdays = [...unique.values()].sort(
    (a, b) => a.daysUntil - b.daysUntil || collator.compare(a.personName.trim(), b.personName.trim()),
  );

  const todayParts = parseISODate(options.today);
  const monthLabel = (options.formatMonth?.(options.today) ?? String(todayParts.month)).replace(/^./u, (first) => first.toLocaleUpperCase(options.locale));
  const monthRemainingCount = birthdays.filter((event) => {
    const parts = parseISODate(event.date);
    return event.daysUntil >= 0 && parts.year === todayParts.year && parts.month === todayParts.month;
  }).length;
  const shared = {
    monthRemainingCount,
    monthLabel,
    monthFooter: options.t('widget.monthRemaining', { month: monthLabel, count: monthRemainingCount }),
    sectionNext: options.t('widget.headlineNext'),
    sectionNextPlural: options.t('widget.headlineNextPlural'),
    emptyTitle: options.t('widget.emptyTitle'),
    emptyHint: options.t('widget.emptyHint'),
    emptyReadHint: '',
  };
  if (birthdays.length === 0) {
    return { state: 'empty', upcoming: [], ...shared };
  }

  const first = birthdays[0]!;
  const heroEvents = birthdays.filter((event) => event.date === first.date);
  const heroPeople = heroEvents.slice(0, 2).map((event) => {
    const person = people.find((candidate) => candidate.id === event.personId)!;
    return toWidgetPerson(person, options.t, event.age);
  });
  const dateLabel = options.formatDate?.(first.date) ?? first.date;
  const relativeLabel = first.daysUntil === 0
    ? options.t('relative.today')
    : first.daysUntil === 1
      ? options.t('relative.tomorrow')
      : first.daysUntil <= 30
        ? options.t('relative.inDays', { count: first.daysUntil })
        : dateLabel;
  const heroIds = new Set(heroEvents.map((event) => event.id));
  const upcoming = birthdays
    .filter((event) => !heroIds.has(event.id))
    .map((event) => {
      const person = people.find((candidate) => candidate.id === event.personId)!;
      return {
        person: toWidgetPerson(person, options.t, event.age),
        dateLabel: options.formatDate?.(event.date) ?? event.date,
        daysLeft: event.daysUntil,
        daysUnit: options.t('widget.daysUnit', { count: event.daysUntil }),
      };
    });

  return {
    state: 'ready',
    ...shared,
    hero: {
      daysLeft: first.daysUntil,
      relativeLabel,
      dateLabel,
      ringProgress: Math.min(1, Math.max(0, (30 - first.daysUntil) / 30)),
      totalCount: heroEvents.length,
      countLabel: options.t('widget.birthdayCount', { count: heroEvents.length }),
      othersLabel: heroEvents.length > 2 ? options.t('widget.othersBirthday', { count: heroEvents.length - 2 }) : '',
      ringUnit: options.t('widget.daysUnit', { count: first.daysUntil === 1 ? 1 : 2 }),
      people: heroPeople,
      hiddenCount: heroEvents.length - heroPeople.length,
    },
    upcoming,
  };
}
/** Calendar date as `YYYY-MM-DD`. Never a timestamp: a birthday must not shift with time zones. */
export type ISODate = string;

/** A recurring day in the year, without a year (name days). */
export interface MonthDay {
  month: number; // 1..12
  day: number; // 1..31
}

/** Built-in relationship tags are stored as keys and translated at render time. */
export type BuiltInTag = 'family' | 'friend' | 'work' | 'neighbour';

export interface Person {
  id: string;
  name: string;
  /** Used for the name-day suggestion. */
  firstName: string;
  /** `YYYY-MM-DD` or `--MM-DD` when the year is unknown. */
  birthDate: ISODate;
  nameDay: MonthDay | null;
  photoUri?: string | null;
  tags: string[];
  notes?: string;
  /** Days before the birthday a reminder fires (e.g. [7, 1, 0]). */
  reminderOffsets: number[];
  createdAt: string;
  updatedAt: string;
}

export type GiftIdeaSource = 'share' | 'manual';
export type GiftIdeaStatus = 'idea' | 'bought' | 'given';

export interface ExternalGiftContributor {
  id: string;
  name: string;
  paid: boolean;
}

export interface GiftIdea {
  id: string;
  personId: string;
  title: string;
  /** People in the app who are contributing to this gift. */
  participantIds?: string[];
  /** Contributing people who have paid; always a subset of participantIds. */
  paidParticipantIds?: string[];
  /** Contributors by name who are not saved as Cento people. */
  externalContributors?: ExternalGiftContributor[];
  note?: string;
  url?: string | null;
  imageUri?: string | null;
  source: GiftIdeaSource;
  status: GiftIdeaStatus;
  createdAt: string;
}

export type Occasion = 'birthday' | 'nameday' | 'other';

export interface GiftRecord {
  id: string;
  personId: string;
  year: number;
  occasion: Occasion;
  title: string;
  amount?: number | null;
  currency?: string | null;
  note?: string;
  giftIdeaId?: string | null;
}

export interface ChecklistItem {
  text: string;
  done: boolean;
}

export interface Celebration {
  id: string;
  personId: string;
  year: number;
  date: ISODate;
  time?: string | null; // HH:MM
  place?: string | null;
  notes?: string;
  checklist: ChecklistItem[];
  reminderOffsets: number[];
}

export type EventKind = 'birthday' | 'nameday' | 'celebration';

/** Everything that can appear in the upcoming list, normalised. */
export interface UpcomingEvent {
  id: string; // `${kind}:${personId}:${date}`
  personId: string;
  personName: string;
  kind: EventKind;
  /** The next occurrence as a calendar date. */
  date: ISODate;
  daysUntil: number;
  /** Age the person turns on that birthday; undefined when the birth year is unknown or not a birthday. */
  age?: number;
  milestone: boolean;
  /** For a birthday row: the celebration planned for this birthday, if any. */
  celebration?: Pick<Celebration, 'id' | 'date' | 'time' | 'place'>;
}

/** How a Feb 29 birthday is observed on non-leap years. */
export type Feb29Policy = 'feb28' | 'mar1';

export type UpcomingGroup = 'today' | 'week' | 'month' | 'later';

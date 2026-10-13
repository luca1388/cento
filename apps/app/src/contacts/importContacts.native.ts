import * as Contacts from 'expo-contacts';
import { formatBirthDate, isValidMonthDay } from '@cento/core';

export interface ContactCandidate {
  id: string;
  name: string;
  firstName: string;
  /** `YYYY-MM-DD` or `--MM-DD` */
  birthDate: string;
}

export const contactsSupported = true;

/**
 * Reads name and birthday only, once, when the user taps Import. Nothing is kept except what the
 * user ticks, and that becomes an ordinary Person in the local database.
 */
export async function loadContactsWithBirthday(): Promise<{ granted: boolean; contacts: ContactCandidate[] }> {
  const perm = await Contacts.requestPermissionsAsync();
  if (!perm.granted) return { granted: false, contacts: [] };
  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.FirstName, Contacts.Fields.LastName, Contacts.Fields.Name, Contacts.Fields.Birthday],
  });
  const contacts: ContactCandidate[] = [];
  for (const c of data) {
    const b = c.birthday;
    if (!b || typeof b.day !== 'number' || typeof b.month !== 'number') continue;
    const month = b.month + 1; // expo-contacts months are 0-based
    const year = typeof b.year === 'number' && b.year > 1900 ? b.year : null;
    if (!isValidMonthDay(month, b.day, year ?? 2000)) continue;
    const name = (c.name ?? [c.firstName, c.lastName].filter(Boolean).join(' ')).trim();
    if (!name || !c.id) continue;
    contacts.push({
      id: c.id,
      name,
      firstName: c.firstName ?? name.split(/\s+/)[0] ?? name,
      birthDate: formatBirthDate(year, month, b.day),
    });
  }
  return { granted: true, contacts: contacts.sort((a, b) => a.name.localeCompare(b.name)) };
}

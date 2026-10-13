export interface ContactCandidate {
  id: string;
  name: string;
  firstName: string;
  birthDate: string;
}
export const contactsSupported = false;
export async function loadContactsWithBirthday(): Promise<{ granted: boolean; contacts: ContactCandidate[] }> {
  return { granted: false, contacts: [] };
}

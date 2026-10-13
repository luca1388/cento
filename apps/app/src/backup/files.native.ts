import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

/** Writes the content to the cache directory and opens the system share sheet (Files, AirDrop, Drive…). */
export async function exportTextFile(name: string, content: string, mimeType: string, uti: string): Promise<void> {
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.write(content);
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType, UTI: uti, dialogTitle: name });
}

/** Lets the user pick a backup file and returns its text, or null when cancelled. */
export async function pickTextFile(): Promise<string | null> {
  const res = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (res.canceled || !res.assets[0]) return null;
  return new File(res.assets[0].uri).text();
}

/** Copies a shared image into the app's documents so the idea survives the original being deleted. */
export async function keepImage(sourceUri: string, name: string): Promise<string> {
  const dir = new Directory(Paths.document, 'images');
  if (!dir.exists) dir.create();
  const dest = new File(dir, name);
  if (dest.exists) dest.delete();
  await new File(sourceUri).copy(dest);
  return dest.uri;
}

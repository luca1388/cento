import * as DocumentPicker from 'expo-document-picker';

/** Browser download. */
export async function exportTextFile(name: string, content: string, mimeType: string, _uti: string): Promise<void> {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function pickTextFile(): Promise<string | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain'], multiple: false });
  if (res.canceled || !res.assets[0]) return null;
  // The browser picker always hands over a File; no fetch of any kind lives in the backup code.
  return res.assets[0].file ? res.assets[0].file.text() : null;
}

export async function keepImage(sourceUri: string): Promise<string> {
  return sourceUri;
}

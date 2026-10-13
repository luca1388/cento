import { File, Paths } from 'expo-file-system';
import type { WidgetSnapshot } from '@cento/core';
import { APP_GROUP, SNAPSHOT_FILE } from './constants';

export const widgetsSupported = true;

function sharedFile(): File | null {
  const dir = Paths.appleSharedContainers[APP_GROUP];
  return dir ? new File(dir, SNAPSHOT_FILE) : null;
}

/**
 * Writes the pre-rendered snapshot into the App Group container; the WidgetKit extension
 * (targets/widget) reads only this file. Also keeps a copy in the document directory.
 */
export async function writeWidgetSnapshot(snapshot: WidgetSnapshot): Promise<boolean> {
  const json = JSON.stringify(snapshot);
  new File(Paths.document, SNAPSHOT_FILE).write(json);
  const shared = sharedFile();
  if (!shared) return false; // Expo Go or missing entitlement: no widget to feed.
  shared.write(json);
  return true;
}

export async function readWidgetSnapshot(): Promise<WidgetSnapshot | null> {
  const f = new File(Paths.document, SNAPSHOT_FILE);
  if (!f.exists) return null;
  return JSON.parse(await f.text()) as WidgetSnapshot;
}

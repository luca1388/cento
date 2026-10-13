import React from 'react';
import { File, Paths } from 'expo-file-system';
import { requestWidgetUpdate } from 'react-native-android-widget';
import type { WidgetSnapshot } from '@cento/core';
import { CentoWidget } from './CentoWidget';
import { SNAPSHOT_FILE, WIDGET_NAME } from './constants';

export const widgetsSupported = true;

/**
 * Stores the snapshot where the headless widget task can read it, then asks every placed widget to
 * re-render from it. The daily WorkManager refresh goes through the same task handler.
 */
export async function writeWidgetSnapshot(snapshot: WidgetSnapshot): Promise<boolean> {
  new File(Paths.document, SNAPSHOT_FILE).write(JSON.stringify(snapshot));
  try {
    await requestWidgetUpdate({
      widgetName: WIDGET_NAME,
      renderWidget: (info) => <CentoWidget snapshot={snapshot} width={info.width} height={info.height} />,
      widgetNotFound: () => {},
    });
    return true;
  } catch {
    return false; // Expo Go: native widget module not available.
  }
}

export async function readWidgetSnapshot(): Promise<WidgetSnapshot | null> {
  const f = new File(Paths.document, SNAPSHOT_FILE);
  if (!f.exists) return null;
  return JSON.parse(await f.text()) as WidgetSnapshot;
}

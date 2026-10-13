import type { WidgetSnapshot } from '@cento/core';

export const widgetsSupported = false;

export async function writeWidgetSnapshot(_snapshot: WidgetSnapshot): Promise<boolean> {
  return false;
}

export async function readWidgetSnapshot(): Promise<WidgetSnapshot | null> {
  return null;
}

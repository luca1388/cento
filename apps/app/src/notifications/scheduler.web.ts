import type { PlannedNotification } from '@cento/core';

/** The web app has no local notifications in v1 (service-worker notifications would need a push server). */
export const notificationsSupported = false;

export async function ensureNotificationPermission(): Promise<boolean> {
  return false;
}

export async function syncScheduledNotifications(_plan: PlannedNotification[], _channelName: string): Promise<number> {
  return 0;
}

export async function scheduledCount(): Promise<number> {
  return 0;
}

export function addNotificationOpenListener(_cb: (deepLink: string) => void): () => void {
  return () => {};
}

export async function initialNotificationDeepLink(): Promise<string | null> {
  return null;
}

import { Platform } from 'react-native';
import type * as NotificationsModule from 'expo-notifications';
import type { PlannedNotification } from '@cento/core';
import { inExpoGoAndroid } from './support';

export const notificationsSupported = !inExpoGoAndroid;
const CHANNEL_ID = 'cento-reminders';

type Notifications = typeof NotificationsModule;

/** Loaded lazily so Expo Go on Android never evaluates the module. */
let cached: Notifications | null = null;
function load(): Notifications | null {
  if (!notificationsSupported) return null;
  if (!cached) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('expo-notifications') as Notifications;
    cached.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
  return cached;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const N = load();
  if (!N) return false;
  const current = await N.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await N.requestPermissionsAsync();
  return asked.granted;
}

function fireAt(n: PlannedNotification): Date {
  const [y, m, d] = n.fireDate.split('-').map(Number);
  const [hh, mm] = n.fireTime.split(':').map(Number);
  return new Date(y!, m! - 1, d!, hh ?? 9, mm ?? 0, 0, 0);
}

/**
 * Replaces every pending local notification with the given plan (already localized).
 * Only entries in the future are scheduled; returns how many were.
 */
export async function syncScheduledNotifications(plan: PlannedNotification[], channelName: string): Promise<number> {
  const N = load();
  if (!N) return 0;
  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync(CHANNEL_ID, { name: channelName, importance: N.AndroidImportance.DEFAULT });
  }
  await N.cancelAllScheduledNotificationsAsync();
  if (plan.length === 0) return 0;
  const granted = await ensureNotificationPermission();
  if (!granted) return 0;
  const now = Date.now();
  let count = 0;
  for (const n of plan) {
    const date = fireAt(n);
    if (date.getTime() <= now) continue;
    await N.scheduleNotificationAsync({
      identifier: n.id,
      content: { title: n.title, body: n.body, data: { deepLink: n.deepLink }, sound: 'default' },
      trigger: { type: N.SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL_ID },
    });
    count++;
  }
  return count;
}

export async function scheduledCount(): Promise<number> {
  const N = load();
  return N ? (await N.getAllScheduledNotificationsAsync()).length : 0;
}

function deepLinkOf(response: NotificationsModule.NotificationResponse | null): string | null {
  const data = response?.notification.request.content.data as { deepLink?: unknown } | undefined;
  return typeof data?.deepLink === 'string' ? data.deepLink : null;
}

export function addNotificationOpenListener(cb: (deepLink: string) => void): () => void {
  const N = load();
  if (!N) return () => {};
  const sub = N.addNotificationResponseReceivedListener((response) => {
    const link = deepLinkOf(response);
    if (link) cb(link);
  });
  return () => sub.remove();
}

export async function initialNotificationDeepLink(): Promise<string | null> {
  const N = load();
  return N ? deepLinkOf(await N.getLastNotificationResponseAsync()) : null;
}

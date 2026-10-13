import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { getLocales } from 'expo-localization';
import { todayISO } from '@cento/core';
import { createRepository } from '@/storage/createRepository';
import { buildDerived, headlessLocale } from '@/sync/build';
import { writeWidgetSnapshot } from '@/widgets/snapshotStore';
import { syncScheduledNotifications } from '@/notifications/scheduler';

export const DAILY_TASK = 'cento-daily';

/**
 * Runs roughly daily in the background (the OS decides exactly when): regenerates the widget snapshot
 * and the notification batch so the 14-day horizon is never reached. No network, ever.
 */
TaskManager.defineTask(DAILY_TASK, async () => {
  try {
    const repo = createRepository();
    await repo.init();
    const [people, celebrations, settings] = await Promise.all([repo.listPeople(), repo.listCelebrations(), repo.getSettings()]);
    const { locale, dateFnsLocale, t } = await headlessLocale(
      settings,
      getLocales().map((l) => l.languageTag),
    );
    const { snapshot, plan } = buildDerived({ people, celebrations, settings, locale, dateFnsLocale, today: todayISO(), t });
    await writeWidgetSnapshot(snapshot);
    await syncScheduledNotifications(plan, t('notifications.channel'));
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (e) {
    console.warn('daily task failed', e);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerDailyTask(): Promise<void> {
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status !== BackgroundTask.BackgroundTaskStatus.Available) return;
    await BackgroundTask.registerTaskAsync(DAILY_TASK, { minimumInterval: 12 * 60 });
  } catch {
    // Expo Go or restricted: the app regenerates everything on launch anyway.
  }
}

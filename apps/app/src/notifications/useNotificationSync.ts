import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { router } from 'expo-router';
import { todayISO } from '@cento/core';
import { useData } from '@/storage/DataProvider';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { buildDerived } from '@/sync/build';
import { writeWidgetSnapshot } from '@/widgets/snapshotStore';
import { addNotificationOpenListener, initialNotificationDeepLink, syncScheduledNotifications } from './scheduler';

/** `cento://person/p1/record?x=1` → `/person/p1/record?x=1` */
export function deepLinkToPath(link: string): string {
  const m = /^[a-z]+:\/\/(.*)$/i.exec(link);
  return `/${m ? m[1] : link}`.replace(/^\/\//, '/');
}

/**
 * Whenever people, celebrations, settings or the language change, rebuild the localized notification plan
 * and the widget snapshot and hand them to the OS. Both are cheap (only the nearest batch is ever scheduled).
 */
export function useDerivedSync() {
  const { ready, people, celebrations, settings, updateSettings, refresh } = useData();
  const { locale, dateFnsLocale } = useLocale();
  const t = useT();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appState = useRef(AppState.currentState);
  const [foregroundRefresh, setForegroundRefresh] = useState(0);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasBackgrounded = appState.current === 'background' || appState.current === 'inactive';
      appState.current = nextState;
      if (wasBackgrounded && nextState === 'active') {
        void refresh()
          .then(() => setForegroundRefresh((count) => count + 1))
          .catch((error) => console.warn('foreground data refresh', error));
      }
    });
    return () => subscription.remove();
  }, [refresh]);

  useEffect(() => {
    if (!ready || !dateFnsLocale) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const { snapshot, plan } = buildDerived({
        people,
        celebrations,
        settings,
        locale,
        dateFnsLocale,
        today: todayISO(),
        t: t as (k: string, o?: Record<string, unknown>) => string,
      });
      void syncScheduledNotifications(plan, t('notifications.channel')).catch((e) => console.warn('notifications', e));
      void writeWidgetSnapshot(snapshot)
        .then((written) => {
          if (written) void updateSettings({ widgetUpdatedAt: new Date().toISOString() });
        })
        .catch((e) => console.warn('widget', e));
    }, 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // updateSettings is stable; settings.widgetUpdatedAt must not retrigger the sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ready,
    people,
    celebrations,
    settings.language,
    settings.showNameDays,
    settings.feb29Policy,
    settings.notificationTime,
    settings.notificationsEnabled,
    settings.defaultCelebrationOffsets,
    locale,
    dateFnsLocale,
    t,
    foregroundRefresh,
  ]);

  useEffect(() => {
    const open = (link: string) => router.push(deepLinkToPath(link) as never);
    void initialNotificationDeepLink().then((link) => link && open(link));
    return addNotificationOpenListener(open);
  }, []);
}

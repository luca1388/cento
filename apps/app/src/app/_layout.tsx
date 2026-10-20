import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { router, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { DataProvider, useData } from '@/storage/DataProvider';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { useTheme } from '@/theme';
import { useDerivedSync } from '@/notifications/useNotificationSync';

/** The share extension needs a development build; in Expo Go and on web the native module is absent. */
const shareIntentAvailable = Platform.OS !== 'web' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

export default function RootLayout() {
  return (
    <DataProvider>
      <Localized />
    </DataProvider>
  );
}

function Localized() {
  const { ready, settings } = useData();
  const theme = useTheme();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }
  return (
    <LocaleProvider language={settings.language}>
      <ShareIntentProvider options={{ disabled: !shareIntentAvailable, resetOnBackground: true }}>
        <Navigator />
      </ShareIntentProvider>
    </LocaleProvider>
  );
}

function useShareIntentRouting() {
  const { hasShareIntent } = useShareIntentContext();
  const pathname = usePathname();
  useEffect(() => {
    if (hasShareIntent && pathname !== '/share') router.push('/share');
  }, [hasShareIntent, pathname]);
}

function useServiceWorker() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return; // Metro dev server: no offline caching while developing.
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
}

function Navigator() {
  const theme = useTheme();
  const t = useT();
  useDerivedSync();
  useShareIntentRouting();
  useServiceWorker();
  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.bg },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: t('app.name'), headerShown: false }} />
        <Stack.Screen name="person/new" options={{ title: t('form.newTitle'), presentation: 'modal' }} />
        <Stack.Screen name="person/[id]/index" options={{ title: '' }} />
        <Stack.Screen name="person/[id]/edit" options={{ title: t('form.editTitle'), presentation: 'modal' }} />
        <Stack.Screen name="person/[id]/card" options={{ title: t('card.title'), presentation: 'modal' }} />
        <Stack.Screen name="person/[id]/celebration" options={{ title: t('celebration.editTitle'), presentation: 'modal' }} />
        <Stack.Screen name="person/[id]/gift" options={{ title: t('gift.title'), presentation: 'modal' }} />
        <Stack.Screen name="person/[id]/record" options={{ title: t('record.title'), presentation: 'modal' }} />
        <Stack.Screen name="share" options={{ title: t('share.title'), presentation: 'modal' }} />
        <Stack.Screen name="import-contacts" options={{ title: t('contacts.title') }} />
        <Stack.Screen name="privacy" options={{ title: t('privacy.title') }} />
        <Stack.Screen name="settings" options={{ title: t('settings.title') }} />
      </Stack>
    </>
  );
}

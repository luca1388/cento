import { router } from 'expo-router';

/** Back when there is history (modal flows), otherwise home: deep links and widgets open screens directly. */
export function goBack(): void {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// Custom entry: register the headless widget handler and the daily background task, then hand over to Expo Router.
import { registerWidgets } from '@/widgets/register';
import { registerDailyTask } from '@/background/dailyTask';
import 'expo-router/entry';

registerWidgets();
void registerDailyTask();

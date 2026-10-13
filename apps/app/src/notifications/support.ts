import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * Expo Go on Android no longer ships expo-notifications (removed in SDK 53): even importing the module
 * raises an error there. In that one environment we never load it and the app runs without reminders.
 * iOS Expo Go, development builds and store builds are unaffected.
 */
export const inExpoGoAndroid = Platform.OS === 'android' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

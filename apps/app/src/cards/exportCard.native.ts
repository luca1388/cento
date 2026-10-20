import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import { CARD_EXPORT_SIZES, type CardFormat } from './types';

export async function shareCardImage(ref: RefObject<View | null>, format: CardFormat): Promise<void> {
  const { width, height } = CARD_EXPORT_SIZES[format];
  const uri = await captureRef(ref, { format: 'png', result: 'tmpfile', width, height, quality: 1 });
  if (!(await Sharing.isAvailableAsync())) throw new Error('File sharing is unavailable');
  await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: 'Cento' });
}
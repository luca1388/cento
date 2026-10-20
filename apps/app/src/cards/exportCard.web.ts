import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import { CARD_EXPORT_SIZES, type CardFormat } from './types';

export async function shareCardImage(ref: RefObject<View | null>, format: CardFormat): Promise<void> {
  const { width, height } = CARD_EXPORT_SIZES[format];
  const dataUri = await captureRef(ref, { format: 'png', result: 'data-uri', width, height, quality: 1 });
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = `cento-card-${format}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
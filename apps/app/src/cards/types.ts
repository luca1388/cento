import type { ComponentType } from 'react';
import type { FitOptions, GreetingLocale, GreetingTone } from '@cento/core';

export type CardFormat = 'square' | 'story';
export const CARD_SIZES: Record<CardFormat, { width: number; height: number }> = {
  square: { width: 340, height: 340 },
  story: { width: 270, height: 480 },
};
export const CARD_EXPORT_SIZES: Record<CardFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export interface CardRenderProps {
  name: string;
  message: string;
  format: CardFormat;
  locale: GreetingLocale;
  age?: number;
}

export interface CardDesign {
  id: string;
  title: string;
  tones: GreetingTone[];
  needsAge?: boolean;
  swatch: string;
  messageBox: Record<CardFormat, FitOptions>;
  Component: ComponentType<CardRenderProps>;
}
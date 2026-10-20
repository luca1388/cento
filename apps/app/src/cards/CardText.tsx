import React from 'react';
import { Text, View } from 'react-native';
import { fitGreeting, type FitOptions } from '@cento/core';
import { CARD_FONT } from './fonts';

export function CardMessage({ text, options, color, style }: { text: string; options: FitOptions; color: string; style?: object }) {
  const fit = fitGreeting(text, options);
  return (
    <Text style={[{ color, fontFamily: CARD_FONT.dmSans, fontSize: fit.fontSize, lineHeight: fit.fontSize * (options.lineHeightRatio ?? 1.45) }, style]}>
      {text}
    </Text>
  );
}

export function CardName({ name, color, fontSize, fontFamily = CARD_FONT.fraunces }: { name: string; color: string; fontSize: number; fontFamily?: string }) {
  return (
    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} style={{ color, fontFamily, fontSize, lineHeight: fontSize * 1.1 }}>
      {name}
    </Text>
  );
}

export function CardLabel({ text, color, style }: { text: string; color: string; style?: object }) {
  return <Text style={[{ color, fontFamily: CARD_FONT.dmSansBold, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }, style]}>{text}</Text>;
}

export function CardCanvas({ format, color, children }: { format: 'square' | 'story'; color: string; children: React.ReactNode }) {
  return <View style={{ width: format === 'square' ? 340 : 270, height: format === 'square' ? 340 : 480, overflow: 'hidden', backgroundColor: color }}>{children}</View>;
}
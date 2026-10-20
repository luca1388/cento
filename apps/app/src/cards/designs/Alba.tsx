import React from 'react';
import { View } from 'react-native';
import { CARD_LABELS } from '../strings';
import { CardCanvas, CardLabel, CardMessage, CardName } from '../CardText';
import type { CardDesign, CardRenderProps } from '../types';

function Alba({ name, message, format, locale }: CardRenderProps) {
  const story = format === 'story';
  return (
    <CardCanvas format={format} color="#F7C9A9">
      <View style={{ position: 'absolute', left: story ? 28 : 32, right: story ? 28 : 32, top: story ? 80 : 28, gap: 7, zIndex: 2 }}>
        <CardLabel text={CARD_LABELS[locale].manyWishes} color="#8C3B2B" />
        <CardName name={name} color="#4A1F14" fontSize={story ? 60 : 52} />
        <CardMessage text={message} options={{ width: story ? 214 : 276, height: story ? 120 : 66, minFontSize: 11, maxFontSize: 15 }} color="#4A1F14" />
      </View>
      <View style={{ position: 'absolute', width: story ? 110 : 96, height: story ? 110 : 96, borderRadius: 100, right: 34, bottom: story ? 116 : 62, backgroundColor: '#F2994A' }} />
      <View style={{ position: 'absolute', left: -20, right: -20, height: story ? 106 : 78, bottom: 0, backgroundColor: '#B5523B', borderTopLeftRadius: 120, transform: [{ skewY: '-7deg' }] }} />
      <View style={{ position: 'absolute', left: -20, right: -10, height: story ? 76 : 54, bottom: story ? 42 : 30, backgroundColor: '#E07A5F', borderTopLeftRadius: 120, transform: [{ skewY: '4deg' }] }} />
    </CardCanvas>
  );
}

export const alba: CardDesign = { id: 'alba', title: 'Alba', tones: ['warm'], swatch: '#F7C9A9', messageBox: { square: { width: 276, height: 66, minFontSize: 11, maxFontSize: 15 }, story: { width: 214, height: 120, minFontSize: 11, maxFontSize: 15 } }, Component: Alba };
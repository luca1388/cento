import React from 'react';
import { View } from 'react-native';
import { CARD_LABELS } from '../strings';
import { CardCanvas, CardMessage, CardName } from '../CardText';
import { CARD_FONT } from '../fonts';
import type { CardDesign, CardRenderProps } from '../types';

function Tipografica({ name, message, format, locale }: CardRenderProps) {
  const story = format === 'story';
  return (
    <CardCanvas format={format} color="#1F6F54">
      <View style={{ position: 'absolute', top: story ? 78 : 24, left: story ? 28 : 22, right: story ? 28 : 20, gap: 0 }}>
        <CardName name={CARD_LABELS[locale].cheers} color="#E8F77B" fontSize={story ? 70 : 58} fontFamily={CARD_FONT.bricolage} />
        <CardName name={name} color="#FFFFFF" fontSize={52} fontFamily={CARD_FONT.bricolageMedium} />
      </View>
      <View style={{ position: 'absolute', left: story ? 28 : 24, right: story ? 28 : 24, bottom: story ? 105 : 26 }}>
        <CardMessage text={message} options={{ width: story ? 222 : 284, height: story ? 150 : 120, minFontSize: 12, maxFontSize: 16 }} color="#E7F3EC" />
      </View>
    </CardCanvas>
  );
}

export const tipografica: CardDesign = { id: 'tipografica', title: 'Tipografica', tones: ['short'], swatch: '#1F6F54', messageBox: { square: { width: 284, height: 120, minFontSize: 12, maxFontSize: 16 }, story: { width: 222, height: 150, minFontSize: 12, maxFontSize: 16 } }, Component: Tipografica };
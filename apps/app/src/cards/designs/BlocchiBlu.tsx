import React from 'react';
import { View } from 'react-native';
import { CARD_LABELS } from '../strings';
import { CardCanvas, CardLabel, CardMessage, CardName } from '../CardText';
import type { CardDesign, CardRenderProps } from '../types';

function BlocchiBlu({ name, message, format, locale }: CardRenderProps) {
  const story = format === 'story';
  return (
    <CardCanvas format={format} color="#F2F4F7">
      <View style={{ position: 'absolute', top: -68, left: -68, width: story ? 210 : 148, height: story ? 210 : 148, borderRadius: 150, backgroundColor: '#2748B8' }} />
      <View style={{ position: 'absolute', top: 0, left: story ? 105 : 130, width: story ? 64 : 70, height: story ? 120 : 115, backgroundColor: '#AEBBDD' }} />
      <View style={{ position: 'absolute', top: story ? 40 : 35, right: story ? 18 : 16, width: story ? 38 : 46, height: story ? 38 : 46, borderRadius: 30, backgroundColor: '#101B3D' }} />
      <View style={{ position: 'absolute', top: story ? 230 : 170, left: story ? 28 : 32, right: story ? 28 : 32, gap: 7 }}>
        <CardLabel text={CARD_LABELS[locale].birthday} color="#2748B8" />
        <CardName name={name} color="#101B3D" fontSize={story ? 54 : 46} />
        <CardMessage text={message} options={{ width: story ? 214 : 260, height: story ? 150 : 70, minFontSize: 11, maxFontSize: 15, lineHeightRatio: 1.5 }} color="#2A3556" />
      </View>
    </CardCanvas>
  );
}

export const blocchiBlu: CardDesign = { id: 'blocchi-blu', title: 'Blocchi blu', tones: ['formal'], swatch: '#AEBBDD', messageBox: { square: { width: 260, height: 70, minFontSize: 11, maxFontSize: 15, lineHeightRatio: 1.5 }, story: { width: 214, height: 150, minFontSize: 11, maxFontSize: 15, lineHeightRatio: 1.5 } }, Component: BlocchiBlu };
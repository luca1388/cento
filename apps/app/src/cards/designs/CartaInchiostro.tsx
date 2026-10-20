import React from 'react';
import { View } from 'react-native';
import { CARD_LABELS } from '../strings';
import { CardCanvas, CardLabel, CardMessage, CardName } from '../CardText';
import type { CardDesign, CardRenderProps } from '../types';

function CartaInchiostro({ name, message, format, locale }: CardRenderProps) {
  const story = format === 'story';
  return (
    <CardCanvas format={format} color="#F5F2EA">
      <View style={{ position: 'absolute', top: 12, left: 12, right: 12, bottom: 12, borderWidth: 1, borderColor: '#1A1A1A' }} />
      <View style={{ position: 'absolute', top: story ? 48 : 32, right: story ? 28 : 26, width: story ? 60 : 52, height: story ? 60 : 52, borderWidth: 2, borderColor: '#D9482B', borderRadius: 40, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: '58%', height: '58%', borderRadius: 40, backgroundColor: '#D9482B' }} />
      </View>
      <View style={{ position: 'absolute', left: story ? 28 : 32, right: story ? 28 : 32, bottom: story ? 78 : 28, gap: 7 }}>
        <CardLabel text={CARD_LABELS[locale].birthday} color="#D9482B" />
        <CardName name={name} color="#1A1A1A" fontSize={story ? 52 : 46} />
        <CardMessage text={message} options={{ width: story ? 206 : 260, height: story ? 130 : 70, minFontSize: 11, maxFontSize: 15, lineHeightRatio: 1.5 }} color="#3A3A3A" />
      </View>
    </CardCanvas>
  );
}

export const cartaInchiostro: CardDesign = { id: 'carta-inchiostro', title: 'Carta e inchiostro', tones: ['formal'], swatch: '#F5F2EA', messageBox: { square: { width: 260, height: 70, minFontSize: 11, maxFontSize: 15, lineHeightRatio: 1.5 }, story: { width: 206, height: 130, minFontSize: 11, maxFontSize: 15, lineHeightRatio: 1.5 } }, Component: CartaInchiostro };
import React from 'react';
import { View } from 'react-native';
import { CARD_LABELS } from '../strings';
import { CardCanvas, CardLabel, CardMessage, CardName } from '../CardText';
import type { CardDesign, CardRenderProps } from '../types';

function Coriandoli({ name, message, format, locale }: CardRenderProps) {
  const story = format === 'story';
  const bg = '#FFF1D6';
  const colors = ['#E76F51', '#2A9D8F', '#E9B44C'];
  return (
    <CardCanvas format={format} color={bg}>
      {Array.from({ length: story ? 13 : 12 }, (_, i) => (
        <View key={i} style={{ position: 'absolute', left: 20 + ((i * 59) % 285), top: 12 + ((i * 37) % (story ? 230 : 135)), width: i % 3 ? 8 : 14, height: i % 3 ? 8 : 4, borderRadius: i % 3 ? 5 : 0, backgroundColor: colors[i % colors.length], transform: [{ rotate: `${i * 31}deg` }] }} />
      ))}
      <View style={{ position: 'absolute', left: story ? 28 : 32, right: story ? 28 : 32, bottom: story ? 96 : 24, gap: story ? 8 : 6 }}>
        <CardLabel text={CARD_LABELS[locale].birthday} color="#C4492C" style={{ fontSize: story ? 11 : 12 }} />
        <CardName name={name} color="#3B2A20" fontSize={story ? 60 : 56} />
        <CardMessage text={message} options={{ width: story ? 214 : 276, height: story ? 94 : 66, minFontSize: 11, maxFontSize: 15 }} color="#3B2A20" />
      </View>
    </CardCanvas>
  );
}

export const coriandoli: CardDesign = { id: 'coriandoli', title: 'Coriandoli', tones: ['warm'], swatch: '#FFF1D6', messageBox: { square: { width: 276, height: 66, minFontSize: 11, maxFontSize: 15 }, story: { width: 214, height: 94, minFontSize: 11, maxFontSize: 15 } }, Component: Coriandoli };
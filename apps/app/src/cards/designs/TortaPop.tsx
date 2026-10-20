import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CardCanvas, CardLabel, CardMessage, CardName } from '../CardText';
import { CARD_FONT } from '../fonts';
import { CARD_LABELS } from '../strings';
import type { CardDesign, CardRenderProps } from '../types';

function TortaPop({ name, message, format, locale }: CardRenderProps) {
  const story = format === 'story';
  return (
    <CardCanvas format={format} color="#FF6FA5">
      <View style={{ position: 'absolute', top: story ? 80 : 24, left: story ? 28 : 24, right: story ? 28 : 24, gap: 8 }}>
        <CardLabel text={CARD_LABELS[locale].birthday} color="#2B0A1E" style={{ fontSize: story ? 11 : 10, letterSpacing: 1.5 }} />
        <CardName name={`${name}!`} color="#2B0A1E" fontSize={story ? 52 : 48} fontFamily={CARD_FONT.bricolage} />
        <CardMessage text={message} options={{ width: story ? 214 : 276, height: story ? 99 : 66, minFontSize: 11, maxFontSize: 15 }} color="#2B0A1E" />
      </View>
      <View style={{ position: 'absolute', top: story ? 365 : 270, left: story ? 36 : 32, right: story ? 36 : 32, height: story ? 90 : 46, backgroundColor: '#FFF1C1' }} />
      <View style={{ position: 'absolute', top: story ? 319 : 236, left: story ? 65 : 62, right: story ? 65 : 62, height: story ? 46 : 38, backgroundColor: '#FFFFFF' }} />
      <Svg width={story ? 140 : 216} height={18} viewBox={story ? '0 0 140 18' : '0 0 216 18'} style={{ position: 'absolute', top: story ? 312 : 228, left: story ? 65 : 62 }}>
        <Path
          d={story
            ? 'M0 0H140V1C132 1 132 17 122 17S112 1 102 1 92 17 82 17 72 1 62 1 52 17 42 17 32 1 22 1 8 17 0 1Z'
            : 'M0 0H216V1C204 1 204 17 188 17S172 1 156 1 140 17 124 17 108 1 92 1 76 17 60 17 44 1 28 1 12 17 0 1Z'}
          fill="#FFD60A"
        />
      </Svg>
      <View style={{ position: 'absolute', top: story ? 300 : 212, left: '49%', width: 8, height: story ? 19 : 16, backgroundColor: '#2B0A1E' }} />
      <Svg width={20} height={27} viewBox="0 0 20 27" style={{ position: 'absolute', top: story ? 273 : 185, left: '47%' }}>
        <Path d="M10 0C8 4 2 10 2 16a8 8 0 0 0 16 0C18 10 12 4 10 0Z" fill="#FFD60A" />
      </Svg>
      <View style={{ position: 'absolute', top: story ? 462 : 322, left: story ? 18 : 22, right: story ? 18 : 22, height: 6, backgroundColor: '#2B0A1E' }} />
    </CardCanvas>
  );
}

export const tortaPop: CardDesign = { id: 'torta-pop', title: 'Torta pop', tones: ['funny'], swatch: '#FF6FA5', messageBox: { square: { width: 276, height: 66, minFontSize: 11, maxFontSize: 15 }, story: { width: 214, height: 99, minFontSize: 11, maxFontSize: 15 } }, Component: TortaPop };
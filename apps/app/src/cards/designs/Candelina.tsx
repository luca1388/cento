import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CARD_LABELS } from '../strings';
import { CardCanvas, CardMessage, CardName } from '../CardText';
import { CARD_FONT } from '../fonts';
import type { CardDesign, CardRenderProps } from '../types';

function Candelina({ name, message, format, locale, age }: CardRenderProps) {
  const story = format === 'story';
  return (
    <CardCanvas format={format} color="#222222">
      <View style={{ position: 'absolute', top: story ? 70 : 62, alignSelf: 'center', width: 10, height: 38, backgroundColor: '#F6F1E7' }} />
      <Svg width={24} height={34} viewBox="0 0 24 34" style={{ position: 'absolute', top: story ? 35 : 28, alignSelf: 'center' }}>
        <Path d="M12 0C10 5 2 12 2 20a10 10 0 0 0 20 0C22 12 14 5 12 0Z" fill="#FFB627" />
        <Path d="M12 11c-2 4-5 7-5 11a5 5 0 0 0 10 0c0-4-3-7-5-11Z" fill="#FFE29A" />
      </Svg>
      <View style={{ position: 'absolute', top: story ? 112 : 104, left: 18, right: 18, alignItems: 'center', gap: 0 }}>
        <Text style={{ color: '#F6F1E7', fontFamily: CARD_FONT.fraunces, fontSize: story ? 88 : 80, lineHeight: story ? 98 : 90 }}>{age}</Text>
        <Text style={{ color: '#D6D0C4', fontFamily: CARD_FONT.dmSansBold, fontSize: 14, letterSpacing: 3, textTransform: 'uppercase' }}>{CARD_LABELS[locale].years}</Text>
      </View>
      <View style={{ position: 'absolute', left: story ? 28 : 32, right: story ? 28 : 32, top: story ? 215 : 211, alignItems: 'center', gap: 8 }}>
        <CardName name={name} color="#F6F1E7" fontSize={story ? 28 : 26} />
        <View style={{ height: story ? 73 : 79, justifyContent: 'center', alignItems: 'center' }}>
          <CardMessage text={message} options={{ width: story ? 214 : 276, height: story ? 73 : 79, minFontSize: 11, maxFontSize: 15 }} color="#F6F1E7" style={{ textAlign: 'center' }} />
        </View>
      </View>
    </CardCanvas>
  );
}

export const candelina: CardDesign = { id: 'candelina', title: 'Candelina', tones: ['short'], needsAge: true, swatch: '#222222', messageBox: { square: { width: 276, height: 79, minFontSize: 11, maxFontSize: 15 }, story: { width: 214, height: 73, minFontSize: 11, maxFontSize: 15 } }, Component: Candelina };
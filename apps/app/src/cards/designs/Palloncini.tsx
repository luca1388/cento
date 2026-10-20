import React from 'react';
import { View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { CardCanvas, CardLabel, CardMessage, CardName } from '../CardText';
import { CARD_FONT } from '../fonts';
import { CARD_LABELS } from '../strings';
import type { CardDesign, CardRenderProps } from '../types';

function Palloncini({ name, message, format, locale }: CardRenderProps) {
  const story = format === 'story';
  const balloons = story
    ? [
        { color: '#E63946', x: 30, y: 304, width: 72, height: 106 },
        { color: '#FFC93C', x: 99, y: 278, width: 72, height: 106 },
        { color: '#2A9D8F', x: 168, y: 304, width: 72, height: 106 },
      ]
    : [
        { color: '#E63946', x: 24, y: 214, width: 52, height: 78 },
        { color: '#FFC93C', x: 98, y: 190, width: 52, height: 78 },
        { color: '#2A9D8F', x: 172, y: 214, width: 52, height: 78 },
        { color: '#F4A261', x: 246, y: 190, width: 52, height: 78 },
      ];
  const knot = story ? { x: 135, y: 478 } : { x: 170, y: 330 };
  return (
    <CardCanvas format={format} color="#BFE3F2">
      <View style={{ position: 'absolute', top: story ? 70 : 24, left: story ? 28 : 24, right: story ? 28 : 24, gap: 7 }}>
        <CardLabel text={CARD_LABELS[locale].birthday} color="#12304A" style={{ fontSize: story ? 11 : 10, letterSpacing: 1.5 }} />
        <CardName name={`${name}!`} color="#12304A" fontSize={story ? 52 : 48} fontFamily={CARD_FONT.bricolage} />
        <CardMessage text={message} options={{ width: story ? 214 : 276, height: story ? 100 : 80, minFontSize: 11, maxFontSize: 15 }} color="#12304A" />
      </View>
      <Svg width={story ? 270 : 340} height={story ? 480 : 340} style={{ position: 'absolute', left: 0, top: 0 }}>
        {balloons.map((balloon) => {
          const startX = balloon.x + balloon.width / 2;
          const startY = balloon.y + balloon.height - 2;
          const bend = (knot.x - startX) * 0.3;
          return (
            <Path
              key={`string-${balloon.color}`}
              d={`M ${startX} ${startY} C ${startX + bend} ${startY + 16}, ${knot.x - bend} ${knot.y - 24}, ${knot.x} ${knot.y}`}
              fill="none"
              stroke="#12304A"
              strokeWidth={1.5}
            />
          );
        })}
      </Svg>
      <Svg width={story ? 270 : 340} height={story ? 480 : 340} style={{ position: 'absolute', left: 0, top: 0 }}>
        {balloons.map((balloon) => (
          <Ellipse
            key={balloon.color}
            cx={balloon.x + balloon.width / 2}
            cy={balloon.y + balloon.height / 2}
            rx={balloon.width / 2}
            ry={balloon.height / 2}
            fill={balloon.color}
          />
        ))}
      </Svg>
    </CardCanvas>
  );
}

export const palloncini: CardDesign = { id: 'palloncini', title: 'Palloncini', tones: ['funny'], swatch: '#BFE3F2', messageBox: { square: { width: 276, height: 80, minFontSize: 11, maxFontSize: 15 }, story: { width: 214, height: 100, minFontSize: 11, maxFontSize: 15 } }, Component: Palloncini };
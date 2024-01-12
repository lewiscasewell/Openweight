import {
  Easing,
  runTiming,
  useValue,
  BoxShadow,
  rect,
  rrect,
  Group,
  LinearGradient,
  translate,
  Circle,
  Skia,
  vec,
  Path,
  SweepGradient,
  useComputedValue,
  Box,
  Text,
  useFont,
} from '@shopify/react-native-skia';

import React from 'react';
import {colors as themeColors} from '../styles/theme';
import {Dimensions} from 'react-native';
const {width} = Dimensions.get('window');
const STROKE_WIDTH = 15;

const r1 = 120;
const path = Skia.Path.Make();
path.addCircle(12 + r1, 12 + r1, r1);
const c = vec(12 + r1, 12 + r1);
const fromCircle = (cx: number, cy: number, r: number) =>
  rrect(rect(cx - r, cy - r, 2 * r, 2 * r), r, r);

interface ProgressCircleProps {
  maxValue: number;
  difference: number;
  daysLeft: number;
}

const colors = [
  themeColors['picton-blue']['400'],
  themeColors['water-leaf'][200],
];

export const ProgressCircle = ({
  maxValue,
  difference,
  daysLeft,
}: ProgressCircleProps) => {
  const font = useFont(
    require('../../assets/fonts/CabinetGrotesk-Medium.otf'),
    40,
  );
  const font2 = useFont(
    require('../../assets/fonts/CabinetGrotesk-Medium.otf'),
    16,
  );
  const v = useValue(0);

  const progress = useComputedValue(
    () =>
      runTiming(v, maxValue, {
        duration: 1500,
        easing: Easing.inOut(Easing.cubic),
      }),
    [maxValue],
  );

  if (font === null || font2 === null) {
    return null;
  }

  return (
    <Group
      transform={translate({
        x: (width - (r1 * 2 + STROKE_WIDTH * 2)) / 2,
        y: 60,
      })}>
      <Group>
        <LinearGradient
          start={vec(12, 12)}
          end={vec(200, 200)}
          colors={['#101113', '#2B2F33']}
        />
        <Box box={fromCircle(12 + r1, 12 + r1, r1)}>
          <BoxShadow dx={18} dy={18} blur={65} color="#141415" />
          <BoxShadow dx={-10} dy={-10} blur={65} color="#485057" />
        </Box>
      </Group>

      <Text
        x={c.x - font.getTextWidth(`${difference.toFixed(1)}kg`) / 2}
        y={c.y + font.getSize() / 2 - 60}
        font={font}
        text={`${difference.toFixed(1)}kg`}
        color="white"
      />
      <Text
        x={c.x - font2.getTextWidth('from target weight') / 2}
        y={c.y + font2.getSize() / 2 - 25}
        font={font2}
        text="from target weight"
        color="white"
      />
      {daysLeft === 0 || isNaN(daysLeft) ? (
        <>
          <Text
            x={c.x - font2.getTextWidth('Target reached!') / 2}
            y={c.y + font2.getSize() / 2 + 55}
            font={font2}
            text="Target reached!"
            color="white"
          />
        </>
      ) : daysLeft <= 0 || daysLeft === Infinity ? (
        <>
          <Text
            x={c.x - font2.getTextWidth('Adjust your calories') / 2}
            y={c.y + font2.getSize() / 2 + 55}
            font={font2}
            text="Adjust your calories"
            color="pink"
          />
        </>
      ) : (
        <>
          <Text
            x={c.x - font.getTextWidth(`${daysLeft.toFixed(0)} days`) / 2}
            y={c.y + font.getSize() / 2 + 20}
            font={font}
            text={`${daysLeft.toFixed(0)} days`}
            color="white"
          />
          <Text
            x={c.x - font2.getTextWidth('to reach target') / 2}
            y={c.y + font2.getSize() / 2 + 55}
            font={font2}
            text="to reach target"
            color="white"
          />
        </>
      )}

      <Group>
        <SweepGradient c={vec(12 + r1, 12 + r1)} colors={colors} />
        <Path
          path={path}
          style="stroke"
          strokeWidth={STROKE_WIDTH}
          start={0}
          end={progress.current}
          strokeCap="round"
        />
        <Circle cx={12 + 2 * r1} cy={12 + r1} r={15 / 2} color={colors[0]} />
      </Group>
    </Group>
  );
};

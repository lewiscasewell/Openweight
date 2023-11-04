import {Dimensions, StyleSheet} from 'react-native';
import {colors} from '../styles/theme';
import {
  Canvas,
  Easing,
  Group,
  RoundedRect,
  Skia,
  runTiming,
  useComputedValue,
  useValue,
  vec,
} from '@shopify/react-native-skia';
import {processTransform3d, toMatrix3} from 'react-native-redash';
import {atom, useAtom} from 'jotai';

const NUM_OF_CONFETTI = 100;
const CONFETTI_WIDTH = 10;
const CONFETTI_HEIGHT = 30;

const {width, height} = Dimensions.get('window');
const ANIMATION_DURATION = 3500;

type ColorCode = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

interface Offset {
  offsetId: string;
  startingXOffset: number;
  startingYOffset: number;
  colorCode: ColorCode;
}

const confettiAtom = atom<Offset[]>([]);
export const isConfettiAnimatingAtom = atom(false);

export const useConfettiAnimation = () => {
  const [confettiPieces, setConfettiPieces] = useAtom(confettiAtom);
  const [, setIsAnimating] = useAtom(isConfettiAnimatingAtom);
  const startAnimation = () => {
    const pieces: Offset[] = [];
    setIsAnimating(true);

    for (let i = 0; i < NUM_OF_CONFETTI; i++) {
      const startingXOffset = Math.random() * width;
      const startingYOffset = -Math.random() * (height * 3);
      const id = i + Math.random() + '';
      pieces.push({
        offsetId: id,
        startingXOffset,
        startingYOffset,
        colorCode: (Math.floor(Math.random() * 10) * 100) as ColorCode,
      });
    }

    setConfettiPieces(pieces);
    setTimeout(() => {
      setIsAnimating(false);
    }, ANIMATION_DURATION);
  };

  return {confettiPieces, startAnimation};
};

const relativeSin = (yPosition: number, offsetId: number) => {
  const rand = Math.sin((yPosition - 500) * (Math.PI / 540));
  const otherrand = Math.cos((yPosition - 500) * (Math.PI / 540));
  return offsetId % 2 === 0 ? rand : -otherrand;
};

const ConfettiPiece: React.FC<Offset> = ({
  colorCode,
  offsetId,
  startingXOffset,
  startingYOffset,
}) => {
  const seed = Math.random() * 4;
  const yPosition = useValue(startingYOffset);
  const centerY = useValue(0);

  const origin = useComputedValue(() => {
    centerY.current = yPosition.current + CONFETTI_HEIGHT / 2;
    const centerX = startingXOffset + CONFETTI_WIDTH / 2;
    return vec(centerX, centerY.current);
  }, [yPosition]);

  const matrix = useComputedValue(() => {
    const rotateZ =
      relativeSin(yPosition.current, Math.round(Number(offsetId))) * seed * 2.5;
    const rotateY =
      relativeSin(yPosition.current, Math.round(Number(offsetId))) * seed * 1.5;
    const rotateX =
      relativeSin(yPosition.current, Math.round(Number(offsetId))) * seed * 1.5;

    const mat3 = toMatrix3(
      processTransform3d([{rotateZ}, {rotateX}, {rotateY}]),
    );

    return Skia.Matrix(mat3);
  }, [yPosition]);

  runTiming(yPosition, height * 3, {
    duration: ANIMATION_DURATION,
    easing: Easing.in(Easing.quad),
  });

  return (
    <Group matrix={matrix} origin={origin}>
      <RoundedRect
        x={startingXOffset}
        y={yPosition}
        width={CONFETTI_WIDTH}
        height={CONFETTI_HEIGHT}
        r={8}
        color={colors['picton-blue'][colorCode]}
      />
    </Group>
  );
};

const Confetti = () => {
  const {confettiPieces} = useConfettiAnimation();
  return (
    <Canvas style={styles.container} pointerEvents="none">
      {confettiPieces.map(piece => (
        <ConfettiPiece
          key={piece.offsetId}
          colorCode={piece.colorCode}
          offsetId={piece.offsetId}
          startingXOffset={piece.startingXOffset}
          startingYOffset={piece.startingYOffset}
        />
      ))}
    </Canvas>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    position: 'absolute',
  },
});

export default Confetti;

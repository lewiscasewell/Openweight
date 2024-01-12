import Animated, {
  Easing,
  SlideInLeft,
  SlideOutLeft,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Text from './Text';

const AnimatedDigit: React.FC<{num: number; index: number}> = ({
  num,
  index,
}) => {
  const number = useSharedValue(num);

  useAnimatedReaction(
    () => num,
    newNum => {
      number.value = newNum;
    },
  );

  // @ts-ignore
  const stylez = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withDelay(
            index * 30,
            withTiming(-number.value * 60, {
              duration: 300,
              easing: Easing.inOut(Easing.back(2)),
            }),
          ),
        },
      ],
    };
  });
  const width = useSharedValue(0);

  useAnimatedReaction(
    () => index,
    newNum => {
      width.value = withTiming(30, {
        duration: 200,
        easing: Easing.inOut(Easing.back(2)),
      });
    },
  );

  const animatedWidth = useAnimatedStyle(() => {
    return {
      width: width.value,
    };
  });

  return (
    <Animated.View
      style={[
        {
          overflow: 'hidden',
          height: 60,
          // width: 30,
        },
        animatedWidth,
      ]}>
      <Animated.View
        // entering={SlideInLeft.delay(index * 50)}
        // exiting={SlideOutLeft.delay(index * 50)}
        style={[{position: 'absolute', overflow: 'hidden'}, stylez]}>
        {Array.from({length: 10}).map((_, i) => {
          return (
            <Text
              key={i}
              style={{
                height: 60,
                color: 'white',
                fontSize: 50,
                textAlign: 'center',
                fontWeight: '700',
              }}>
              {i}
            </Text>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
};

const AnimatedNumber: React.FC<{text: string}> = ({text}) => {
  return (
    <Animated.View style={{flexDirection: 'row'}}>
      {text?.split('')?.map((n, i) => {
        if (isNaN(parseInt(n)))
          return (
            <Text
              style={{
                color: 'white',
                fontSize: 50,
                fontWeight: '700',
              }}
              key={i}>
              {n}
            </Text>
          );
        return <AnimatedDigit key={i} num={parseInt(n)} index={i} />;
      })}
    </Animated.View>
  );
};

export default AnimatedNumber;

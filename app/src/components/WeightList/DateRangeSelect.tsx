import {Dimensions, StyleSheet, TouchableOpacity, View} from 'react-native';
import {DateRange, dateRangeAtom, dateRanges} from '../../atoms/dateRange.atom';
import Text from '../Text';
import {useAtom} from 'jotai';
import Animated, {
  Easing,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {colors} from '../../styles/theme';
import {hapticFeedback} from '../../utils/hapticFeedback';

const {width: screenWidth} = Dimensions.get('window');
const width = screenWidth * 0.8;

const DateRangeSelect = () => {
  const [dateRange, setDateRange] = useAtom(dateRangeAtom);

  const selectedIndex = dateRanges.indexOf(dateRange);

  const handlePress = (dateRange: DateRange) => {
    hapticFeedback('impactLight');
    setDateRange(dateRange);
  };

  const selectionBackgroundStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring((selectedIndex * width) / dateRanges.length, {
            mass: 1,
            stiffness: 500,
            damping: 30,
          }),
        },
      ],
    };
  }, [selectedIndex]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.selectionBackground, selectionBackgroundStyle]}
      />
      {dateRanges.map(dateRange => {
        return (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.touchable}
            onPress={() => handlePress(dateRange)}
            key={dateRange}>
            <Text>{dateRange}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width,
    borderRadius: 10,
  },
  touchable: {
    width: width / dateRanges.length,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  selectionBackground: {
    position: 'absolute',
    height: '100%',
    width: width / dateRanges.length,
    backgroundColor: colors.black[800],
    borderRadius: 10,
  },
});

export default DateRangeSelect;

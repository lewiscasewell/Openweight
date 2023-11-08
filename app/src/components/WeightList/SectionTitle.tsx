import Animated, {FadeInUp} from 'react-native-reanimated';
import {colors} from '../../styles/theme';
import Text from '../Text';
import {StyleSheet} from 'react-native';

export type SectionTitleProps = {
  title: string;
  weightDifference: number;
};

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  weightDifference,
}) => {
  return (
    <Animated.View
      entering={FadeInUp.duration(300).delay(100)}
      style={styles.container}>
      <Text style={styles.text}>{title}</Text>
      <Text style={styles.text}>
        {weightDifference >= 0 && '+'}
        {isNaN(weightDifference) ? '-' : weightDifference.toFixed(1)}kg
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black[950],
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: colors.grey[300],
  },
});

export default SectionTitle;

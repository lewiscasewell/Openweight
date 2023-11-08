import Animated, {FadeInUp} from 'react-native-reanimated';
import Weight from '../../watermelondb/model/Weight';
import {useNavigation} from '@react-navigation/native';
import {TabStackNavigationProps} from '../../stacks/types';
import dayjs from 'dayjs';
import {TouchableOpacity, View} from 'react-native';
import {MeshGradient} from 'react-native-patterns';
import Text from '../Text';
import {colors} from '../../styles/theme';

type Props = {
  item: Weight;
  weightBefore: number;
};

function generateDifferenceBetweenWeightsString(
  weightBefore: number,
  weightAfter: number,
): {text: string; color: string} {
  const differenceBetweenWeights = weightAfter - weightBefore;
  if (isNaN(differenceBetweenWeights)) {
    return {text: '-', color: colors.grey[300]};
  }
  const diffBetweenWeightsText =
    differenceBetweenWeights > 0
      ? `+${differenceBetweenWeights.toFixed(1)} kg`
      : `${differenceBetweenWeights.toFixed(1)} kg`;
  const color =
    differenceBetweenWeights > 0
      ? colors['picton-blue'][300]
      : colors['water-leaf'][300];
  return {text: diffBetweenWeightsText, color};
}

const Item = ({item, weightBefore}: {item: Weight; weightBefore: number}) => {
  const navigation = useNavigation<TabStackNavigationProps>();
  const diffBetweenWeightsText = generateDifferenceBetweenWeightsString(
    weightBefore,
    item.weight,
  );
  const dayString = dayjs(item.dateAt).format('DD');
  const monthString = dayjs(item.dateAt).format('MMM');
  return (
    <Animated.View entering={FadeInUp.duration(300).delay(100)}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('AddWeight', {
            dateToPass: dayjs(item.dateAt).format('YYYY-MM-DD'),
            id: item.supabaseUserId,
          });
        }}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 10,
        }}>
        <MeshGradient
          uniqueKey={item.id}
          height={60}
          width={60}
          overlayOpacity={0.8}
          blurRadius={0.5}
          style={{borderRadius: 14, padding: 10}}>
          <Text style={{fontSize: 20}}>{dayString}</Text>
          <Text style={{fontSize: 20}}>{monthString}</Text>
        </MeshGradient>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={{fontSize: 20}}>{item.weight}</Text>
          <Text style={{fontSize: 14, color: colors.grey[300]}}>
            {diffBetweenWeightsText.text}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Item;

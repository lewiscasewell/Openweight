import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {Pressable, StyleSheet, TouchableOpacity} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import dayjs from 'dayjs';
import {colors} from '../styles/theme';
import {MaterialIcon} from '../icons/material-icons';
import {sessionAtom} from '../atoms/session.atom';
import {useAtomValue} from 'jotai';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../stacks/types';
import {hapticFeedback} from '../utils/hapticFeedback';

type AddWeightButtonNavigation = NativeStackNavigationProp<AuthStackParamList>;

const AddWeightButton = () => {
  const navigation = useNavigation<AddWeightButtonNavigation>();
  const session = useAtomValue(sessionAtom);

  const scaleValue = useSharedValue(1);

  const handlePressIn = () => {
    hapticFeedback('impactLight');
    scaleValue.value = 0.85;
  };

  const handlePressOut = () => {
    scaleValue.value = 1;
  };

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(scaleValue.value, {
            duration: 100,
            easing: Easing.cubic,
          }),
        },
      ],
    };
  }, []);

  return (
    <Animated.View style={[styles.addButtonContainer, animatedStyles]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          navigation.navigate('AddWeight', {
            dateToPass: dayjs().format('YYYY-MM-DD'),
            id: session!.user.id!,
          });
        }}
        style={styles.addButton}>
        <MaterialIcon name="plus" color={colors.grey['100']} size={40} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  addButtonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 100,
  },
  addButton: {
    backgroundColor: colors['picton-blue'][600],
    height: 60,
    width: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black[950],
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 10,
  },
});

export default AddWeightButton;

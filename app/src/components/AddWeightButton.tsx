import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {StyleSheet, TouchableOpacity} from 'react-native';
import Animated, {FadeInDown, Layout} from 'react-native-reanimated';
import dayjs from 'dayjs';
import {colors} from '../styles/theme';
import {MaterialIcon} from '../icons/material-icons';
import {sessionAtom} from '../atoms/session.atom';
import {useAtomValue} from 'jotai';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../stacks/types';

type AddWeightButtonNavigation = NativeStackNavigationProp<AuthStackParamList>;

const AddWeightButton = () => {
  const navigation = useNavigation<AddWeightButtonNavigation>();
  const session = useAtomValue(sessionAtom);

  return (
    <Animated.View
      entering={FadeInDown}
      layout={Layout.duration(200).delay(200).springify()}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('AddWeight', {
            dateToPass: dayjs().format('YYYY-MM-DD'),
            id: session!.user.id!,
          });
        }}
        style={styles.addButton}>
        <MaterialIcon name="plus" color={colors.grey['100']} size={40} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: colors['picton-blue'][400],
    height: 60,
    width: 60,
    position: 'absolute',
    right: 20,
    bottom: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
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

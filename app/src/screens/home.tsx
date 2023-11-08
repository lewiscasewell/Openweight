import {useAtomValue} from 'jotai';
import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import SafeAreaInsets from 'react-native-static-safe-area-insets';
import {sessionAtom} from '../atoms/session.atom';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../stacks/types';
import {weightCountAtom} from '../atoms/weightCount.atom';
import HomeFlatlist from '../components/WeightList/HomeFlatlist';

type HomeScreenNavigation = NativeStackNavigationProp<AuthStackParamList>;

export const HomeScreen = () => {
  const session = useAtomValue(sessionAtom);
  const count = useAtomValue(weightCountAtom);

  return (
    <View style={styles.container}>
      <View style={styles.top} />
      {session && (
        <HomeFlatlist supabaseUserId={session.user.id} count={count} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  linearGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: SafeAreaInsets.safeAreaInsetsTop,
  },
  top: {
    height: SafeAreaInsets.safeAreaInsetsTop,
  },
});

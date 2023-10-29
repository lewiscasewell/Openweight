import {useAtomValue} from 'jotai';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import SafeAreaInsets from 'react-native-static-safe-area-insets';
import {sessionAtom} from '../atoms/session.atom';

import WeightList from '../components/WeightList';

export const HomeScreen = () => {
  const session = useAtomValue(sessionAtom);

  return (
    <View style={styles.container}>
      <View style={styles.top} />

      {session && <WeightList supabaseId={session.user.id} />}
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

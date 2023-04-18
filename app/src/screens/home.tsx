import {LinearGradient} from '@shopify/react-native-skia';
import {useAtom} from 'jotai';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import SafeAreaInsets from 'react-native-static-safe-area-insets';
import {sessionAtom} from '../atoms/session.atom';

import WeightList from '../components/WeightList';
import {colors} from '../styles/colors';

export const HomeScreen = () => {
  const [session] = useAtom(sessionAtom);

  return (
    <View style={styles.container}>
      {/* <LinearGradient
        // style={styles.linearGradient}
        colors={[colors.primary, colors.transparent]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}

      /> */}
      <View style={styles.top} />

      {session && <WeightList supabaseId={session.user.id} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    // paddingBottom: SafeAreaInsets.safeAreaInsetsBottom,
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

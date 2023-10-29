import {useAtomValue} from 'jotai';
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {sessionAtom} from '../atoms/session.atom';
import ProfileComponent from '../components/ProfileComponent';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';

export const ProfileScreen = () => {
  const session = useAtomValue(sessionAtom);

  return (
    <View style={styles.container}>
      {session && <ProfileComponent id={session.user.id} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StaticSafeAreaInsets.safeAreaInsetsTop,
  },
  buttonContainer: {
    padding: 14,
  },
});

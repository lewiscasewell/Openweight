import {useAtom} from 'jotai';
import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import {sessionAtom} from '../atoms/session.atom';
import ProfileComponent from '../components/ProfileComponent';
import {supabase} from '../supabase';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';

export const ProfileScreen = () => {
  const [session] = useAtom(sessionAtom);

  return (
    <View style={styles.container}>
      <Text>Logged in</Text>

      {session && <ProfileComponent id={session.user.id} />}

      <Button
        title="Logout"
        onPress={() => {
          supabase.auth.signOut();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StaticSafeAreaInsets.safeAreaInsetsTop,
  },
});

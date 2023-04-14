import {useAtom} from 'jotai';
import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import {sessionAtom} from '../atoms/session.atom';
import ProfileCompoonent from '../components/ProfileCompoonent';
import {supabase} from '../supabase';

export const ProfileScreen = () => {
  const [session] = useAtom(sessionAtom);

  return (
    <View>
      <Text>Logged in</Text>

      {session && <ProfileCompoonent id={session.user.id} />}

      <Button
        title="Logout"
        onPress={() => {
          supabase.auth.signOut();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({});

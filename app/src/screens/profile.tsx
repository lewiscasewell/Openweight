import React from 'react';
import {View, Text, Button} from 'react-native';
import ProfileCompoonent from '../components/ProfileCompoonent';
import {supabase} from '../supabase';

export const ProfileScreen = () => {
  const [session, setSession] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    supabase.auth.getSession().then(session => {
      setSession(session.data.session?.user.id);
    });
  }, []);

  console.log(session && session);

  return (
    <View>
      <Text>Logged in</Text>

      {session !== undefined && <ProfileCompoonent id={session} />}

      <Button
        title="Logout"
        onPress={() => {
          supabase.auth.signOut();
        }}
      />
    </View>
  );
};

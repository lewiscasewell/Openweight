import {Q} from '@nozbe/watermelondb';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import React from 'react';
import {Button, Text, View} from 'react-native';
import {PrimaryTextInput} from '../components/TextInput';
import WeightList from '../components/WeightList';
import {supabase} from '../supabase';
import Profile from '../watermelondb/model/Profile';
import Weight from '../watermelondb/model/Weight';

export const HomeScreen = () => {
  const [newWeight, setNewWeight] = React.useState('');

  const database = useDatabase();

  const [session, setSession] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    supabase.auth.getSession().then(session => {
      setSession(session.data.session?.user.id);
    });
  }, []);
  console.log(session);

  async function addWeight() {
    await database.write(async () => {
      const profile = await database

        .get<Profile>('profiles')
        .query(Q.where('supabase_id', session))
        .fetch();

      return await database
        .get<Weight>('weights')
        .create(weight => {
          weight.profile!.set(profile[0]);
          weight.weight = parseFloat(newWeight);
          weight.unit = 'kg';
          weight.date = new Date();
          weight.supabase_id = session!;
        })
        .then(value => {
          console.log('saved', value);
          return value;
        })
        .catch(error => {
          console.log('error', error);
        });
    });
  }

  return (
    <View>
      <Text>Home</Text>

      <PrimaryTextInput
        value={newWeight}
        placeholder="Enter new weight"
        label="Add new weight"
        onChangeText={text => setNewWeight(text)}
      />
      <Button
        title="Add Weight"
        onPress={async () => {
          await addWeight();
        }}
      />

      {session && <WeightList supabaseId={session} />}
    </View>
  );
};

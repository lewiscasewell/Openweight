import React from 'react';
import Profile from '../watermelondb/model/Profile';

import {StyleSheet, Text} from 'react-native';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import {Database, Q} from '@nozbe/watermelondb';
import {useDatabase} from '@nozbe/watermelondb/hooks';

type Props = {
  database: Database;
  id: string;
  profiles: Profile[];
};

const ProfileComponent = ({profiles}: Props) => {
  const database = useDatabase();
  //   const query = Q.sanitizeLikeString('d7e57297-252e-457d-b925-0f009dfe4a1c');
  //   const s = database
  //     .get('profiles')
  //     .query(Q.where('supabase_id', Q.like(`%${query}%`)))
  //     .observe();
  //   s.forEach(value => {
  //     console.log('val', value);
  //   });

  console.log('profile', profiles);

  return (
    <>
      <Text style={styles.text}>{profiles?.[0].name}</Text>

      <Text style={styles.text}>{profiles?.[0].email}</Text>
    </>
  );
};

const withModels = withObservables(['id'], ({database, id}: Props) => {
  const query = Q.sanitizeLikeString(id);

  return {
    profiles: database
      .get<Profile>('profiles')
      .query(Q.where('supabase_id', Q.like(`%${query}%`)))
      .observe(),
  };
});

export default withDatabase(withModels(ProfileComponent));

const styles = StyleSheet.create({
  text: {
    color: 'white',
    fontSize: 20,
  },
});

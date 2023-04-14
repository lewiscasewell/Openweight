import React from 'react';
import Profile from '../watermelondb/model/Profile';

import {
  FlatList,
  Dimensions,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import {Database, Q} from '@nozbe/watermelondb';
import {DateTime, Interval} from 'luxon';

type Props = {
  database: Database;
  id: string;
  profiles: Profile[];
};

type ProfileItemProps = {
  title: string;
  value: string;
};

const {width} = Dimensions.get('screen');

const ProfileItem: React.FC<ProfileItemProps> = ({title, value}) => {
  return (
    <View style={{width: width / 2, padding: 10}}>
      <TouchableOpacity
        style={{
          backgroundColor: '#1d1d1d',
          padding: 10,
          height: width / 2.5,
          borderRadius: 10,
        }}>
        <Text style={{color: 'white', fontSize: 30, flex: 1}}>{title}</Text>
        <Text style={{color: 'white', fontSize: 50}}>{value}</Text>
      </TouchableOpacity>
    </View>
  );
};

const ProfileComponent = ({profiles}: Props) => {
  const currentProfile = profiles?.[0];

  return (
    <View>
      <FlatList
        ListHeaderComponent={() => {
          return (
            <>
              <Text style={styles.text}>Hey, {currentProfile?.name}</Text>

              <Text style={styles.text}>{currentProfile?.email}</Text>
            </>
          );
        }}
        data={[
          {title: 'Gender', value: currentProfile?.gender ?? '-'},
          {
            title: 'Age',
            value: currentProfile?.dob
              ? Interval.fromDateTimes(
                  DateTime.fromJSDate(currentProfile.dob),
                  DateTime.now(),
                ).toFormat('y')
              : '-',
          },
          {
            title: 'Height',
            value:
              currentProfile?.height && currentProfile?.height_unit
                ? `${currentProfile.height} ${currentProfile.height_unit}`
                : '-',
          },
          {
            title: 'Weight',
            value:
              currentProfile?.target_weight &&
              currentProfile?.target_weight_unit
                ? `${currentProfile.target_weight} ${currentProfile.target_weight_unit}}`
                : '-',
          },
          {
            title: 'Activity',
            value: currentProfile?.activity_level ?? '-',
          },
          {
            title: 'Calorie goal',
            value: currentProfile?.calorie_surplus ?? '-',
          },
        ]}
        numColumns={2}
        renderItem={({item}) => (
          <ProfileItem title={item.title} value={item.value} />
        )}
      />
    </View>
  );
};

const withModels = withObservables(['id'], ({database, id}: Props) => {
  return {
    profiles: database
      .get<Profile>('profiles')
      .query(Q.where('supabase_id', id))
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

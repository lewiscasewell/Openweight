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
import {SecondaryButton} from './Button';
import {supabase} from '../supabase';
import {ProfileAttribute, TabStackNavigationProps} from '../../App';
import {useNavigation} from '@react-navigation/native';

type Props = {
  database: Database;
  id: string;
  profiles: Profile[];
};

type ProfileItemProps = {
  title: string;
  value: string;
  attribute: ProfileAttribute;
};

const {width} = Dimensions.get('screen');

const Header: React.FC<{currentProfile: Profile}> = ({currentProfile}) => {
  console.log(currentProfile);
  return (
    <>
      <Text style={styles.text}>Profile</Text>
    </>
  );
};

const ProfileItem: React.FC<ProfileItemProps> = ({title, value, attribute}) => {
  const navigation = useNavigation<TabStackNavigationProps>();
  return (
    <View style={{width: width / 2, padding: 10}}>
      <TouchableOpacity
        style={{
          backgroundColor: '#1d1d1d',
          padding: 10,
          height: width / 2.5,
          borderRadius: 10,
        }}
        onPress={() => {
          navigation.navigate('EditProfile', {profileAttribute: attribute});
        }}>
        <Text
          style={{color: 'white', fontSize: 26, fontWeight: '700', flex: 1}}>
          {title}
        </Text>
        <Text style={{color: 'white', fontSize: 50}}>{value}</Text>
      </TouchableOpacity>
    </View>
  );
};

const ProfileComponent = ({profiles}: Props) => {
  const currentProfile = profiles?.[0];

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.container}
        ListFooterComponent={() => {
          return (
            <View style={styles.buttonContainer}>
              <SecondaryButton
                title="Logout"
                onPress={() => {
                  supabase.auth.signOut();
                }}
              />
            </View>
          );
        }}
        ListHeaderComponent={() => <Header currentProfile={currentProfile} />}
        data={[
          {
            title: 'Gender',
            attribute: 'gender',
            value: currentProfile?.gender ?? '-',
          },
          {
            title: 'Age',
            attribute: 'age',
            value: currentProfile?.dobAt
              ? Interval.fromDateTimes(
                  DateTime.fromJSDate(currentProfile.dobAt),
                  DateTime.now(),
                ).toFormat('y')
              : '-',
          },
          {
            title: 'Height',
            attribute: 'height',
            value:
              currentProfile?.height && currentProfile?.heightUnit
                ? `${currentProfile.height} ${currentProfile.heightUnit}`
                : '-',
          },
          {
            title: 'Weight',
            attribute: 'targetWeight',
            value:
              currentProfile?.targetWeight && currentProfile?.targetWeightUnit
                ? `${currentProfile.targetWeight} ${currentProfile.targetWeightUnit}}`
                : '-',
          },
          {
            title: 'Activity',
            attribute: 'activityLevel',
            value: currentProfile?.activityLevel ?? '-',
          },
          {
            title: 'Calorie goal',
            attribute: 'calorieGoal',
            value: currentProfile?.calorieSurplus ?? '-',
          },
        ]}
        numColumns={2}
        renderItem={({item}) => (
          <ProfileItem
            title={item.title}
            value={String(item.value)}
            attribute={item.attribute}
          />
        )}
      />
    </View>
  );
};

const withModels = withObservables(['profiles'], ({database, id}: Props) => {
  return {
    profiles: database
      .get<Profile>('profiles')
      .query(Q.where('supabase_user_id', id))
      .observeWithColumns(['name']),
  };
});

export default withDatabase(withModels(ProfileComponent));

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    padding: 10,
  },
  buttonContainer: {
    padding: 14,
  },
});

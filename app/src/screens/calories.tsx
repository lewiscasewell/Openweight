import React from 'react';
import {StyleSheet, ScrollView, Text, View} from 'react-native';

import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';

import withObservables from '@nozbe/with-observables';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import {Database, Q} from '@nozbe/watermelondb';
import Profile from '../watermelondb/model/Profile';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {TabStackNavigationProps, TabStackParamList} from '../../App';
import {PrimaryButton} from '../components/Button';
import {colors} from '../styles/theme';

type CaloriesScreenRouteProp = RouteProp<TabStackParamList, 'Calories'>;

type Props = {
  database: Database;
  profiles: Profile[];
  route: CaloriesScreenRouteProp;
};

const CompleteProfile = ({currentProfile}: {currentProfile: Profile}) => {
  const navigation = useNavigation<TabStackNavigationProps>();
  return (
    <View style={completeProfileStyles.container}>
      <Text style={completeProfileStyles.title}>
        Almost there. To work out your daily calorie target you need to complete
        your profile.
      </Text>
      <PrimaryButton
        title="Complete profile"
        onPress={() => {
          navigation.navigate('EditProfile', {id: currentProfile.id});
        }}
      />
    </View>
  );
};

const completeProfileStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 150,
  },
  title: {
    textAlign: 'center',
    padding: 16,
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    color: colors.grey[300],
  },
});

const CaloriesScreen = ({profiles}: Props) => {
  const currentProfile = profiles?.[0];
  console.log(currentProfile);

  const isCompleteProfile = Boolean(
    currentProfile.name &&
      currentProfile?.gender &&
      currentProfile?.height &&
      currentProfile?.heightUnit &&
      currentProfile?.activityLevel &&
      currentProfile?.targetWeight &&
      currentProfile?.targetWeightUnit &&
      currentProfile?.dobAt &&
      currentProfile?.calorieSurplus,
  );

  console.log(isCompleteProfile);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Calories</Text>
      {isCompleteProfile ? (
        <Text>Complete profile</Text>
      ) : (
        <CompleteProfile currentProfile={currentProfile} />
      )}
    </ScrollView>
  );
};

const withModels = withObservables(['profiles'], ({database, route}: Props) => {
  const {id: supabaseUserId} = route.params;

  return {
    profiles: database
      .get<Profile>('profiles')
      .query(Q.where('supabase_user_id', supabaseUserId))
      .observe(),
  };
});

export default withDatabase(withModels(CaloriesScreen));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StaticSafeAreaInsets.safeAreaInsetsTop,
  },
  graph: {
    flex: 1,
    height: 200,
    width: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});

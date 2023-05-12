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
import Animated from 'react-native-reanimated';
import Weight from '../watermelondb/model/Weight';
import {map} from 'rxjs';
import dayjs from 'dayjs';
import {Slider} from '@miblanchard/react-native-slider';

type CaloriesScreenRouteProp = RouteProp<TabStackParamList, 'Calories'>;

type Props = {
  database: Database;
  profiles: Profile[];
  route: CaloriesScreenRouteProp;
  weights: Weight[];
};

const CompleteProfile = ({currentProfile}: {currentProfile: Profile}) => {
  const navigation = useNavigation<TabStackNavigationProps>();
  return (
    <View style={completeProfileStyles.container}>
      <Text style={styles.title}>Calories</Text>
      <Text style={completeProfileStyles.title}>
        To work out your daily calorie target you need to complete your profile.
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

const CaloriesScreen = ({profiles, weights}: Props) => {
  const currentProfile = profiles?.[0];
  const latestWeight = weights?.[0];

  const [calorieTarget, setCalorieTarget] = React.useState<number>(
    currentProfile.calorieSurplus!,
  );

  const isCompleteProfile = Boolean(
    currentProfile.name &&
      currentProfile?.gender &&
      currentProfile?.height &&
      currentProfile?.heightUnit &&
      currentProfile?.activityLevel &&
      currentProfile?.targetWeight &&
      currentProfile?.targetWeightUnit &&
      currentProfile?.dobAt &&
      currentProfile?.calorieSurplus &&
      weights.length > 0,
  );

  const calcCalorieTarget = () => {
    if (!currentProfile || !latestWeight) {
      return;
    }
    const heightInCentimeters = currentProfile.height!;
    const weightInKilograms = latestWeight.weight;
    const age = dayjs(currentProfile?.dobAt).diff(dayjs(), 'year');
    const activityLevelMulipliers = () => {
      if (currentProfile?.activityLevel === 'sedentary') {
        return 1.2;
      }
      if (currentProfile?.activityLevel === 'light') {
        return 1.375;
      }
      if (currentProfile?.activityLevel === 'moderate') {
        return 1.55;
      }
      if (currentProfile?.activityLevel === 'active') {
        return 1.725;
      }
      if (currentProfile?.activityLevel === 'very_active') {
        return 1.9;
      }
      return 1.2;
    };

    if (currentProfile?.gender === 'male') {
      return (
        (88.362 +
          13.397 * weightInKilograms +
          4.799 * heightInCentimeters -
          5.677 * age) *
          activityLevelMulipliers() +
        calorieTarget
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {isCompleteProfile ? (
        <Animated.View style={styles.graph}>
          <Text style={styles.dailyCalorieTargetTitle}>
            Daily calorie target
          </Text>
          <Text style={styles.calorieTargetNumber}>
            {calcCalorieTarget()?.toFixed(0)}
          </Text>
          <Text style={styles.surplusOrDeficitText}>
            {calorieTarget > 0 ? '+' : ''}
            {calorieTarget} calories
          </Text>
          <Slider
            value={calorieTarget}
            onValueChange={value => setCalorieTarget(value[0])}
            minimumValue={-1000}
            maximumValue={1000}
            step={100}
            minimumTrackTintColor={colors.grey[700]}
            maximumTrackTintColor={colors.grey[500]}
            thumbTintColor={colors.primary}
          />
        </Animated.View>
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
    weights: database
      .get<Weight>('weights')
      .query(Q.where('supabase_user_id', supabaseUserId))
      .observe()
      .pipe(
        map(weights =>
          weights.sort((a, b) => b.dateAt.getTime() - a.dateAt.getTime()),
        ),
      ),
  };
});

export default withDatabase(withModels(CaloriesScreen));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StaticSafeAreaInsets.safeAreaInsetsTop,
    paddingHorizontal: 14,
  },
  graph: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 30,
    marginBottom: 50,
    textAlign: 'center',
  },
  dailyCalorieTargetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.grey[500],
    textAlign: 'center',
  },
  calorieTargetNumber: {
    fontSize: 80,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
  },
  surplusOrDeficitText: {
    fontSize: 14,
    color: colors.grey[500],
    textAlign: 'center',
  },
});

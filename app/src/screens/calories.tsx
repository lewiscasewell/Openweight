import React, {useEffect} from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Dimensions,
  TouchableHighlight,
} from 'react-native';
import Text from '../components/Text';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';
import withObservables from '@nozbe/with-observables';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import {Database, Q} from '@nozbe/watermelondb';
import Profile from '../watermelondb/model/Profile';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {PrimaryButton} from '../components/Button';
import {colors} from '../styles/theme';
import Animated, {FadeIn, FadeOut, Layout} from 'react-native-reanimated';
import Weight from '../watermelondb/model/Weight';
import {map} from 'rxjs';
import dayjs from 'dayjs';
import {Slider} from '@miblanchard/react-native-slider';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {MaterialIcon} from '../icons/material-icons';
import {Canvas} from '@shopify/react-native-skia';
import {ProgressCircle} from '../components/ProgressCircle';
import {TabStackNavigationProps, TabStackParamList} from '../stacks/types';
import CollapsableContainer from '../components/CollapsibleContainer';

type CaloriesScreenRouteProp = RouteProp<TabStackParamList, 'Calories'>;

type Props = {
  database: Database;
  profiles: Profile[];
  route: CaloriesScreenRouteProp;
  weights: Weight[];
};

const CompleteProfile = ({
  currentProfile,
  hasWeights,
}: {
  currentProfile: Profile;
  hasWeights: boolean;
}) => {
  const navigation = useNavigation<TabStackNavigationProps>();
  return (
    <View style={completeProfileStyles.container}>
      <Text style={styles.title}>Calories</Text>
      <Text style={completeProfileStyles.title}>
        To calculate your daily calorie target you need to complete your profile
        {hasWeights ? '.' : ' and have at least one weight recorded.'}
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
  const navigation = useNavigation<TabStackNavigationProps>();

  const [calorieTarget, setCalorieTarget] = React.useState<number>(
    currentProfile?.calorieSurplus!,
  );
  const database = useDatabase();
  useEffect(() => {
    setCalorieTarget(currentProfile?.calorieSurplus!);
  }, [currentProfile?.calorieSurplus]);

  const isCompleteProfile = Boolean(
    currentProfile?.name &&
      currentProfile?.gender &&
      currentProfile?.height &&
      currentProfile?.heightUnit &&
      currentProfile?.activityLevel &&
      currentProfile?.targetWeight &&
      currentProfile?.targetWeightUnit &&
      currentProfile?.dobAt &&
      currentProfile?.calorieSurplus !== null,
  );

  const hasWeights = Boolean(weights.length > 0);

  const isBulking = Boolean(
    currentProfile?.targetWeight! > latestWeight?.weight,
  );

  const calcCalorieTarget = () => {
    if (!currentProfile || !latestWeight) {
      return;
    }
    const heightInCentimeters = currentProfile?.height!;
    const weightInKilograms = latestWeight?.weight;
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
    if (currentProfile?.gender === 'female') {
      return (
        (447.593 +
          9.247 * weightInKilograms +
          3.098 * heightInCentimeters -
          4.33 * age) *
          activityLevelMulipliers() +
        calorieTarget
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {isCompleteProfile && hasWeights ? (
        <Animated.View style={styles.graph}>
          <Text style={styles.dailyCalorieTargetTitle}>
            Daily calorie target
          </Text>
          <Text style={styles.calorieTargetNumber}>
            {calcCalorieTarget()?.toFixed(0)}
          </Text>
          <Text style={styles.surplusOrDeficitText}>
            {calorieTarget >= 0 ? '+' : ''}
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
            thumbTintColor={colors['picton-blue'][400]}
          />
          <CollapsableContainer
            duration={100}
            expanded={currentProfile?.calorieSurplus !== calorieTarget}>
            <View style={styles.confirmCalorieTargetContainer}>
              <Animated.View entering={FadeIn} exiting={FadeOut}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={async () => {
                    await database.write(async () => {
                      await currentProfile.update(profile => {
                        profile.calorieSurplus = calorieTarget;
                      });
                    });
                  }}>
                  <MaterialIcon
                    color={colors['water-leaf']['300']}
                    name="check"
                    size={30}
                  />
                </TouchableOpacity>
              </Animated.View>
              <Animated.View entering={FadeIn} exiting={FadeOut}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    setCalorieTarget(currentProfile.calorieSurplus!)
                  }>
                  <MaterialIcon color="pink" name="close" size={30} />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </CollapsableContainer>

          <Animated.View
            layout={Layout.duration(200)}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              paddingVertical: 20,
            }}>
            <TouchableHighlight
              onPress={() => {
                navigation.navigate('AddWeight', {
                  dateToPass: dayjs().format('YYYY-MM-DD'),
                  id: currentProfile.supabaseUserId,
                });
              }}>
              <>
                <Text style={{color: colors.grey['400'], textAlign: 'center'}}>
                  Current
                </Text>
                <Text
                  style={{
                    color: colors.grey['100'],
                    textAlign: 'center',
                    fontSize: 40,
                  }}>
                  {latestWeight?.weight}
                  <Text style={{fontSize: 20}}>
                    {currentProfile.targetWeightUnit === 'kg' ? 'kg' : 'lbs'}
                  </Text>
                </Text>
              </>
            </TouchableHighlight>
            <View
              style={{
                height: 50,
                width: 1,
                backgroundColor: colors.grey['600'],
              }}
            />
            <TouchableHighlight
              onPress={() => {
                navigation.navigate('EditProfile', {id: currentProfile.id});
              }}>
              <>
                <Text style={{color: colors.grey['400'], textAlign: 'center'}}>
                  Target
                </Text>
                <Text
                  style={{
                    color: colors.grey['100'],
                    textAlign: 'center',
                    fontSize: 40,
                  }}>
                  {currentProfile.targetWeight}
                  <Text style={{fontSize: 20}}>
                    {currentProfile.targetWeightUnit === 'kg' ? 'kg' : 'lbs'}
                  </Text>
                </Text>
              </>
            </TouchableHighlight>
          </Animated.View>
          <Animated.View layout={Layout.duration(200)}>
            <Canvas
              style={{
                width: Dimensions.get('screen').width - 28,
                height: Dimensions.get('screen').width,
              }}>
              {
                <ProgressCircle
                  maxValue={
                    isBulking
                      ? latestWeight.weight / currentProfile.targetWeight! -
                        0.000001
                      : currentProfile.targetWeight! / latestWeight?.weight -
                        0.000001
                  }
                  difference={
                    isBulking
                      ? currentProfile.targetWeight! - latestWeight.weight
                      : latestWeight?.weight - currentProfile.targetWeight!
                  }
                  daysLeft={Number(
                    (
                      (Number(
                        currentProfile.targetWeight! - latestWeight?.weight,
                      ) *
                        7700) /
                      calorieTarget
                    ).toFixed(0),
                  )}
                />
              }
            </Canvas>
          </Animated.View>
        </Animated.View>
      ) : (
        <CompleteProfile
          currentProfile={currentProfile}
          hasWeights={hasWeights}
        />
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
      .observeWithColumns([
        'calorie_surplus',
        'dob_at',
        'activity_level',
        'target_weight',
        'target_weight_unit',
        'height',
        'height_unit',
      ]),
    weights: database
      .get<Weight>('weights')
      .query(Q.where('supabase_user_id', supabaseUserId))
      .observeWithColumns(['weight', 'date_at'])
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
    // paddingTop: StaticSafeAreaInsets.safeAreaInsetsTop,
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
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  surplusOrDeficitText: {
    fontSize: 14,
    color: colors.grey[500],
    textAlign: 'center',
  },
  confirmCalorieTargetContainer: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
  },
});

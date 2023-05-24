import {RouteProp, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';
import {colors} from '../styles/theme';
import {AuthStackParamList, ProfileAttribute} from '../../App';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import Profile from '../watermelondb/model/Profile';
import {Database} from '@nozbe/watermelondb';
import Animated, {
  Easing,
  FadeInUp,
  FadeOutUp,
  Layout,
} from 'react-native-reanimated';
import dayjs from 'dayjs';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import {Controller, useForm} from 'react-hook-form';
import {PrimaryTextInput} from '../components/TextInput';
import {TextInput} from 'react-native';
import {Slider} from '@miblanchard/react-native-slider';

type EditProfileScreenRouteProp = RouteProp<AuthStackParamList, 'EditProfile'>;

type Props = {
  database: Database;
  profile: Profile;
  route: EditProfileScreenRouteProp;
};

const EditProfileScreen = ({profile}: {profile: Profile}) => {
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = React.useState<ProfileAttribute | null>(
    null,
  );

  const {handleSubmit, setValue, control} = useForm<{
    gender?: string | undefined;
    dob_at: Date | undefined;
    name: string;
    height: string | undefined;
    activity_level: string | undefined;
    calorie_surplus: number;
    target_weight: string | undefined;
  }>({
    defaultValues: {
      name: profile.name ?? '',
      gender: profile.gender ?? undefined,
      dob_at: profile.dobAt ?? undefined,
      height: profile.height === null ? '' : String(profile.height),
      activity_level: profile.activityLevel ?? undefined,
      calorie_surplus:
        profile.calorieSurplus === null ? 0 : profile.calorieSurplus,
      target_weight:
        profile.targetWeight === null ? '' : String(profile.targetWeight),
    },
  });

  console.log('profile', profile);

  const database = useDatabase();

  const saveProfile = useCallback(
    async (data: {
      gender: string | undefined;
      dob_at: Date | undefined;
      name: string;
      height: string | undefined;
      height_unit: string | undefined;
      activity_level: string | undefined;
      calorie_surplus: number;
      target_weight: string | undefined;
    }) => {
      await database.write(async () => {
        await profile.update(updateProfile => {
          updateProfile.gender = data.gender;
          updateProfile.dobAt = data.dob_at;
          updateProfile.name = data.name;
          updateProfile.height =
            data.height === '' ? undefined : Number(data.height);
          updateProfile.heightUnit = data.height_unit ?? undefined;
          updateProfile.activityLevel = data.activity_level;
          updateProfile.calorieSurplus = data.calorie_surplus;
          updateProfile.targetWeight =
            data.target_weight === '' ? undefined : Number(data.target_weight);
          updateProfile.targetWeightUnit = 'kg';
        });
        navigation.goBack();
      });
    },
    [database, profile, navigation],
  );

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Edit Profile',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            handleSubmit(data => {
              saveProfile({
                gender: data.gender,
                dob_at: data.dob_at,
                name: data.name,
                height: data.height,
                height_unit: 'cm',
                activity_level: data.activity_level,
                calorie_surplus: data.calorie_surplus,
                target_weight: data.target_weight,
              });
            })();
          }}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, saveProfile, handleSubmit]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1}}>
      <Controller
        name="name"
        control={control}
        render={({field: {value}}) => (
          <Animated.View layout={Layout.duration(200)}>
            <PrimaryTextInput
              label="Name"
              value={value}
              onChangeText={text => {
                setValue('name', text);
              }}
              placeholder="Enter your name"
            />
          </Animated.View>
        )}
      />

      <Controller
        name="gender"
        control={control}
        render={({field: {value}}) => {
          return (
            <Animated.View
              layout={Layout.duration(200)}
              style={styles.genderContainer}>
              <Pressable
                onPress={() => {
                  isEditing === 'gender'
                    ? setIsEditing(null)
                    : setIsEditing('gender');
                }}
                style={styles.optionContainer}>
                <View>
                  <Text style={styles.optionText}>Gender</Text>
                  <Text style={styles.optionValue}>
                    {value !== undefined
                      ? value.split('')?.[0]?.toUpperCase() + value?.slice(1)
                      : 'Not provided'}
                  </Text>
                </View>
                <Text style={styles.editButtonText}>
                  {isEditing === 'gender' ? 'Close' : 'Edit'}
                </Text>
              </Pressable>
              {isEditing === 'gender' && (
                <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
                  <TouchableOpacity
                    style={[
                      styles.selectOptionContainer,
                      value === 'male' ? {} : {opacity: 0.5},
                    ]}
                    onPress={() => {
                      setValue('gender', 'male');
                    }}>
                    <Text style={styles.selectOptionText}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.selectOptionContainer,
                      value === 'female' ? {} : {opacity: 0.5},
                    ]}
                    onPress={() => {
                      setValue('gender', 'female');
                    }}>
                    <Text style={styles.selectOptionText}>Female</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </Animated.View>
          );
        }}
      />

      <Controller
        name="dob_at"
        control={control}
        render={({field: {value}}) => (
          <Animated.View
            layout={Layout.easing(Easing.inOut(Easing.ease))}
            style={styles.genderContainer}>
            <Pressable
              onPress={() => {
                isEditing === 'age' ? setIsEditing(null) : setIsEditing('age');
              }}
              style={styles.optionContainer}>
              <View>
                <Text style={styles.optionText}>Age</Text>
                <Text style={styles.optionValue}>
                  {value !== undefined
                    ? -dayjs(value).diff(new Date(), 'year').toFixed(0)
                    : 'Not provided'}
                </Text>
              </View>
              <Text style={styles.editButtonText}>
                {isEditing === 'age' ? 'Close' : 'Edit'}
              </Text>
            </Pressable>
            {isEditing === 'age' && (
              <Animated.View
                entering={FadeInUp}
                exiting={FadeOutUp}
                style={styles.selectAgeContainer}>
                <Text style={styles.ageText}>
                  {-dayjs(value).diff(new Date(), 'year').toFixed(0)}
                </Text>
                <View style={styles.dateOfBirthSelectContainer}>
                  <Text style={styles.dateOfBirthTitleText}>Date of birth</Text>
                  <RNDateTimePicker
                    value={value ?? new Date(2000, 0, 1)}
                    maximumDate={new Date()}
                    themeVariant="dark"
                    mode="date"
                    onChange={(event, date) => {
                      setValue('dob_at', dayjs(date).startOf('day').toDate());
                    }}
                  />
                </View>
              </Animated.View>
            )}
          </Animated.View>
        )}
      />

      <Controller
        name="height"
        control={control}
        render={({field: {value}}) => (
          <Animated.View
            layout={Layout.easing(Easing.inOut(Easing.ease))}
            style={styles.genderContainer}>
            <Pressable
              onPress={() => {
                isEditing === 'height'
                  ? setIsEditing(null)
                  : setIsEditing('height');
              }}
              style={styles.optionContainer}>
              <View>
                <Text style={styles.optionText}>Height</Text>
                <Text style={styles.optionValue}>
                  {value !== '' ? value : 'Not provided'}
                </Text>
              </View>
              <Text style={styles.editButtonText}>
                {isEditing === 'height' ? 'Close' : 'Edit'}
              </Text>
            </Pressable>
            {isEditing === 'height' && (
              <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <TextInput
                    style={[
                      {color: 'white', fontSize: 18, fontWeight: 'bold'},
                      styles.selectOptionContainer,
                      {flex: 1},
                      profile.heightUnit === 'cm' ? {} : {opacity: 0.5},
                    ]}
                    keyboardType="numeric"
                    value={value ?? ''}
                    onChangeText={text => {
                      setValue('height', text);
                    }}
                  />
                  <Text
                    style={{
                      color: colors.white,
                      paddingHorizontal: 10,
                      fontSize: 18,
                      fontWeight: 'bold',
                    }}>
                    CM
                  </Text>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        )}
      />

      <Controller
        name="activity_level"
        control={control}
        render={({field: {value}}) => (
          <Animated.View
            layout={Layout.easing(Easing.inOut(Easing.ease))}
            style={styles.genderContainer}>
            <Pressable
              onPress={() => {
                isEditing === 'activityLevel'
                  ? setIsEditing(null)
                  : setIsEditing('activityLevel');
              }}
              style={styles.optionContainer}>
              <View>
                <Text style={styles.optionText}>Activity Level</Text>
                <Text style={styles.optionValue}>
                  {value !== undefined
                    ? value.split('')?.[0]?.toUpperCase() + value?.slice(1)
                    : 'Not provided'}
                </Text>
              </View>
              <Text style={styles.editButtonText}>
                {isEditing === 'activityLevel' ? 'Close' : 'Edit'}
              </Text>
            </Pressable>
            {isEditing === 'activityLevel' && (
              <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
                <View>
                  <TouchableOpacity
                    style={[
                      styles.selectOptionContainer,
                      value === 'sedentary' ? {} : {opacity: 0.5},
                    ]}
                    onPress={() => {
                      setValue('activity_level', 'sedentary');
                    }}>
                    <Text style={styles.selectOptionText}>Sedentary</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.selectOptionContainer,
                      value === 'light' ? {} : {opacity: 0.5},
                    ]}
                    onPress={() => {
                      setValue('activity_level', 'light');
                    }}>
                    <Text style={styles.selectOptionText}>Light</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.selectOptionContainer,
                      value === 'moderate' ? {} : {opacity: 0.5},
                    ]}
                    onPress={() => {
                      setValue('activity_level', 'moderate');
                    }}>
                    <Text style={styles.selectOptionText}>Moderate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.selectOptionContainer,
                      value === 'active' ? {} : {opacity: 0.5},
                    ]}
                    onPress={() => {
                      setValue('activity_level', 'active');
                    }}>
                    <Text style={styles.selectOptionText}>Active</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.selectOptionContainer,
                      value === 'very_active' ? {} : {opacity: 0.5},
                    ]}
                    onPress={() => {
                      setValue('activity_level', 'very_active');
                    }}>
                    <Text style={styles.selectOptionText}>Very Active</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        )}
      />

      <Controller
        name="calorie_surplus"
        control={control}
        render={({field: {value}}) => (
          <Animated.View
            layout={Layout.easing(Easing.inOut(Easing.ease))}
            style={styles.genderContainer}>
            <Pressable
              onPress={() => {
                isEditing === 'targetCalories'
                  ? setIsEditing(null)
                  : setIsEditing('targetCalories');
              }}
              style={styles.optionContainer}>
              <View>
                <Text style={styles.optionText}>Calorie surplus/defecit</Text>
                <Text style={styles.optionValue}>{value} calories</Text>
              </View>
              <Text style={styles.editButtonText}>
                {isEditing === 'targetCalories' ? 'Close' : 'Edit'}
              </Text>
            </Pressable>
            {isEditing === 'targetCalories' && (
              <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Slider
                    value={value}
                    minimumValue={-1000}
                    maximumValue={1000}
                    step={100}
                    minimumTrackTintColor={colors.primary}
                    thumbTintColor={colors.primary}
                    containerStyle={{flex: 1, height: 40}}
                    onValueChange={value => {
                      setValue('calorie_surplus', value[0]);
                    }}
                  />
                </View>
              </Animated.View>
            )}
          </Animated.View>
        )}
      />

      <Controller
        name="target_weight"
        control={control}
        render={({field: {value}}) => (
          <Animated.View
            layout={Layout.easing(Easing.inOut(Easing.ease))}
            style={styles.genderContainer}>
            <Pressable
              onPress={() => {
                isEditing === 'targetWeight'
                  ? setIsEditing(null)
                  : setIsEditing('targetWeight');
              }}
              style={styles.optionContainer}>
              <View>
                <Text style={styles.optionText}>Target Weight</Text>
                <Text style={styles.optionValue}>
                  {value !== '' ? value + ' kg' : 'Not provided'}
                </Text>
              </View>
              <Text style={styles.editButtonText}>
                {isEditing === 'targetWeight' ? 'Close' : 'Edit'}
              </Text>
            </Pressable>
            {isEditing === 'targetWeight' && (
              <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <TextInput
                    style={[
                      {color: 'white', fontSize: 18, fontWeight: 'bold'},
                      styles.selectOptionContainer,
                      {flex: 1},
                      profile.targetWeightUnit === 'kg' ? {} : {opacity: 0.5},
                    ]}
                    onChangeText={text => {
                      setValue('target_weight', text);
                    }}
                    value={value}
                    keyboardType="numeric"
                    placeholder="Enter your target weight"
                    placeholderTextColor={colors.grey['400']}
                  />
                </View>
              </Animated.View>
            )}
          </Animated.View>
        )}
      />

      <View
        style={{
          height: Dimensions.get('window').height / 3,
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StaticSafeAreaInsets.safeAreaInsetsTop,
    paddingHorizontal: 14,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginBottom: 4,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  optionText: {
    fontSize: 18,
    color: colors.grey['200'],
  },
  optionValue: {
    fontSize: 16,
    color: colors.grey['400'],
  },
  editButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  selectOptionContainer: {
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    backgroundColor: colors.grey['800'],
  },
  selectOptionText: {
    fontSize: 18,
    color: colors.grey['200'],
  },
  genderContainer: {
    paddingVertical: 20,
    borderWidth: 0.5,
    borderBottomColor: colors.grey['500'],
  },
  selectAgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  ageText: {
    fontSize: 40,
    color: colors.grey['200'],
  },
  dateOfBirthSelectContainer: {
    alignItems: 'center',
  },
  dateOfBirthTitleText: {
    marginBottom: 10,
    fontSize: 16,
    color: colors.grey['400'],
  },
});

const withModels = withObservables(['profile'], ({database, route}: Props) => {
  const {id} = route.params;
  return {
    profile: database.get<Profile>('profiles').findAndObserve(id),
  };
});

export default withDatabase(withModels(EditProfileScreen));

import {RouteProp, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import {
  StyleSheet,
  Pressable,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import Text from '../components/Text';
import {ScrollView} from 'react-native-gesture-handler';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';
import {colors} from '../styles/theme';
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
import {AuthStackParamList} from '../stacks/types';
import {Header} from '../components/Header';
import CollapsableContainer from '../components/CollapsibleContainer';

type EditProfileScreenRouteProp = RouteProp<AuthStackParamList, 'EditProfile'>;
export type ProfileAttribute =
  | 'height'
  | 'name'
  | 'gender'
  | 'age'
  | 'activityLevel'
  | 'targetWeight'
  | 'targetCalories';
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

  const defaultValues = {
    name: profile.name ?? '',
    gender: profile.gender ?? undefined,
    dob_at: profile.dobAt ?? undefined,
    height: profile.height === null ? '' : String(profile.height),
    activity_level: profile.activityLevel ?? undefined,
    calorie_surplus:
      profile.calorieSurplus === null ? 0 : profile.calorieSurplus,
    target_weight:
      profile.targetWeight === null ? '' : String(profile.targetWeight),
  };

  const {handleSubmit, setValue, control, formState} = useForm<{
    gender: string | undefined;
    dob_at: Date | undefined;
    name: string;
    height: string | undefined;
    activity_level: string | undefined;
    calorie_surplus: number;
    target_weight: string | undefined;
  }>({
    defaultValues,
  });

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

  return (
    <View style={styles.container}>
      <Header
        title="Edit profile"
        backButtonCallback={() => {
          if (!formState.isDirty) {
            return navigation.goBack();
          }

          Alert.alert(
            'Save changes?',
            'You have unsaved changes. Are you sure you want to discard them and leave this screen?',
            [
              {
                text: 'Save profile',
                onPress: () => {
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
                },
              },
              {
                text: 'Discard',
                style: 'destructive',
                onPress: () => navigation.goBack(),
              },
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {},
              },
            ],
          );
        }}
        nodes={[
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
          </TouchableOpacity>,
        ]}
      />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}>
        <Controller
          name="name"
          control={control}
          render={({field: {value}}) => (
            <Animated.View layout={Layout.duration(200)}>
              <PrimaryTextInput
                label="Name"
                value={value}
                onChangeText={text => {
                  setValue('name', text, {
                    shouldDirty: true,
                  });
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
                <CollapsableContainer
                  expanded={isEditing === 'gender'}
                  duration={100}>
                  <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
                    <TouchableOpacity
                      style={[
                        styles.selectOptionContainer,
                        value === 'male' ? {} : {opacity: 0.5},
                      ]}
                      onPress={() => {
                        setValue('gender', 'male', {shouldDirty: true});
                        setIsEditing(null);
                      }}>
                      <Text style={styles.selectOptionText}>Male</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.selectOptionContainer,
                        value === 'female' ? {} : {opacity: 0.5},
                      ]}
                      onPress={() => {
                        setValue('gender', 'female', {shouldDirty: true});
                        setIsEditing(null);
                      }}>
                      <Text style={styles.selectOptionText}>Female</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </CollapsableContainer>
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
                  isEditing === 'age'
                    ? setIsEditing(null)
                    : setIsEditing('age');
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
              <CollapsableContainer
                expanded={isEditing === 'age'}
                duration={100}>
                <Animated.View
                  entering={FadeInUp}
                  exiting={FadeOutUp}
                  style={styles.selectAgeContainer}>
                  <Text style={styles.ageText}>
                    {-dayjs(value).diff(new Date(), 'year').toFixed(0)}
                  </Text>
                  <View style={styles.dateOfBirthSelectContainer}>
                    <Text style={styles.dateOfBirthTitleText}>
                      Date of birth
                    </Text>
                    <RNDateTimePicker
                      value={value ?? new Date(2000, 0, 1)}
                      maximumDate={new Date()}
                      themeVariant="dark"
                      mode="date"
                      onChange={(event, date) => {
                        setValue(
                          'dob_at',
                          dayjs(date).startOf('day').toDate(),
                          {
                            shouldDirty: true,
                          },
                        );
                      }}
                    />
                  </View>
                </Animated.View>
              </CollapsableContainer>
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
                    {value !== '' ? `${value} cm` : 'Not provided'}
                  </Text>
                </View>
                <Text style={styles.editButtonText}>
                  {isEditing === 'height' ? 'Close' : 'Edit'}
                </Text>
              </Pressable>
              <CollapsableContainer
                expanded={isEditing === 'height'}
                duration={100}>
                <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <TextInput
                      keyboardAppearance="dark"
                      style={[
                        {color: 'white', fontSize: 18, fontWeight: 'bold'},
                        styles.selectOptionContainer,
                        {flex: 1},
                        profile.heightUnit === 'cm' ? {} : {opacity: 0.5},
                      ]}
                      keyboardType="numeric"
                      placeholder="Enter your height"
                      placeholderTextColor={colors.grey['400']}
                      value={value ?? ''}
                      onChangeText={text => {
                        setValue('height', text, {shouldDirty: true});
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
              </CollapsableContainer>
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
              <CollapsableContainer
                expanded={isEditing === 'activityLevel'}
                duration={100}>
                <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
                  <View>
                    <TouchableOpacity
                      style={[
                        styles.selectOptionContainer,
                        value === 'sedentary' ? {} : {opacity: 0.5},
                      ]}
                      onPress={() => {
                        setValue('activity_level', 'sedentary', {
                          shouldDirty: true,
                        });
                        setIsEditing(null);
                      }}>
                      <Text style={styles.selectOptionText}>Sedentary</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.selectOptionContainer,
                        value === 'light' ? {} : {opacity: 0.5},
                      ]}
                      onPress={() => {
                        setValue('activity_level', 'light', {
                          shouldDirty: true,
                        });
                        setIsEditing(null);
                      }}>
                      <Text style={styles.selectOptionText}>Light</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.selectOptionContainer,
                        value === 'moderate' ? {} : {opacity: 0.5},
                      ]}
                      onPress={() => {
                        setValue('activity_level', 'moderate', {
                          shouldDirty: true,
                        });
                        setIsEditing(null);
                      }}>
                      <Text style={styles.selectOptionText}>Moderate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.selectOptionContainer,
                        value === 'active' ? {} : {opacity: 0.5},
                      ]}
                      onPress={() => {
                        setValue('activity_level', 'active', {
                          shouldDirty: true,
                        });
                        setIsEditing(null);
                      }}>
                      <Text style={styles.selectOptionText}>Active</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.selectOptionContainer,
                        value === 'very_active' ? {} : {opacity: 0.5},
                      ]}
                      onPress={() => {
                        setValue('activity_level', 'very_active', {
                          shouldDirty: true,
                        });
                        setIsEditing(null);
                      }}>
                      <Text style={styles.selectOptionText}>Very Active</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </CollapsableContainer>
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
              <CollapsableContainer
                expanded={isEditing === 'targetCalories'}
                duration={100}>
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
                      minimumTrackTintColor={colors['picton-blue']['400']}
                      thumbTintColor={colors['picton-blue']['400']}
                      containerStyle={{flex: 1, height: 40}}
                      onValueChange={value => {
                        setValue('calorie_surplus', value[0], {
                          shouldDirty: true,
                        });
                      }}
                    />
                  </View>
                </Animated.View>
              </CollapsableContainer>
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
              <CollapsableContainer
                expanded={isEditing === 'targetWeight'}
                duration={100}>
                <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <TextInput
                      keyboardAppearance="dark"
                      style={[
                        {color: 'white', fontSize: 18, fontWeight: 'bold'},
                        styles.selectOptionContainer,
                        {flex: 1},
                        profile.targetWeightUnit === 'kg' ? {} : {opacity: 0.5},
                      ]}
                      keyboardType="numeric"
                      placeholder="Enter your target weight"
                      placeholderTextColor={colors.grey['400']}
                      value={value ?? ''}
                      onChangeText={text => {
                        setValue('target_weight', text, {shouldDirty: true});
                      }}
                    />
                    <Text
                      style={{
                        color: colors.white,
                        paddingHorizontal: 10,
                        fontSize: 18,
                        fontWeight: 'bold',
                      }}>
                      KG
                    </Text>
                  </View>
                </Animated.View>
              </CollapsableContainer>
            </Animated.View>
          )}
        />

        <View
          style={{
            height: Dimensions.get('window').height / 2,
          }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, paddingTop: StaticSafeAreaInsets.safeAreaInsetsTop},
  scrollContainer: {
    flex: 1,
    padding: 14,
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
    backgroundColor: colors.black[900],
    fontFamily: 'CabinetGrotesk-Medium',
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

import React, {useCallback} from 'react';
import Profile from '../watermelondb/model/Profile';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import {Database, Q} from '@nozbe/watermelondb';
import {supabase} from '../supabase';
import {TabStackNavigationProps} from '../../App';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../styles/theme';
import {SecondaryButton} from './Button';
import {TouchableHighlight} from 'react-native-gesture-handler';
import Config from 'react-native-config';
import {sessionAtom} from '../atoms/session.atom';
import {useAtom} from 'jotai';
import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
} from 'react-native-health';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import Weight from '../watermelondb/model/Weight';
import dayjs from 'dayjs';

const permissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.Weight],
    write: [AppleHealthKit.Constants.Permissions.Weight],
  },
} as HealthKitPermissions;

type Props = {
  database: Database;
  id: string;
  profiles: Profile[];
};

const baseUrl = Config.REACT_APP_BASE_URL;

const ProfileComponent = ({profiles}: Props) => {
  const currentProfile = profiles?.[0];
  const [session] = useAtom(sessionAtom);
  const navigation = useNavigation<TabStackNavigationProps>();
  const database = useDatabase();

  const syncWithAppleHealth = () => {
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.log('Error initializing Healthkit: ', error);
        return;
      }
      Alert.alert('Would you like to import or export your data?', undefined, [
        {
          text: 'Import from Apple Health',
          onPress: () => {
            AppleHealthKit.getWeightSamples(
              {
                unit: AppleHealthKit.Constants.Units.gram,
                startDate: '1970-01-01T00:00:00.000Z',
              },
              async (err: string, results: HealthValue[]) => {
                if (err) {
                  console.log('Error getting weight: ', err);
                  return;
                }

                if (!session?.user.id) {
                  return;
                }

                results?.forEach(async result => {
                  if (!result.id) {
                    return;
                  }

                  const checkWeight = await database
                    .get<Weight>('weights')
                    .query(Q.where('id', result.id))
                    .fetch();

                  if (checkWeight?.[0]) {
                    await database.write(async () => {
                      await checkWeight[0].update(weight => {
                        weight.weight = parseFloat(
                          (result.value / 1000)?.toFixed(1),
                        );
                        weight.dateAt = dayjs(result.startDate).toDate();
                        weight.unit = 'kg';
                      });
                    });
                  } else {
                    await database.write(async () => {
                      await database
                        .get<Weight>('weights')
                        .create(newWeight => {
                          newWeight._raw.id = result.id as string;
                          if (currentProfile) {
                            // @ts-ignore
                            newWeight.profile.set(currentProfile);
                          }
                          newWeight.weight = parseFloat(
                            (result.value / 1000)?.toFixed(1),
                          );
                          newWeight.dateAt = dayjs(result.startDate).toDate();
                          newWeight.unit = 'kg';
                          newWeight.supabaseUserId = session?.user.id;
                        });
                    });
                  }
                });
              },
            );
          },
        },
        {
          text: 'Export to Apple Health',
          onPress: async () => {
            if (!session?.user.id) {
              return;
            }

            const weightSamples = await database
              .get<Weight>('weights')
              .query(Q.where('supabase_user_id', session?.user.id))
              .fetch();

            if (!weightSamples) {
              return;
            }
            weightSamples.forEach(async weight => {
              AppleHealthKit.saveWeight(
                {
                  value: weight.weight * 1000,
                  unit: AppleHealthKit.Constants.Units.gram,
                  startDate: weight.dateAt.toISOString(),
                  endDate: weight.dateAt.toISOString(),
                },
                (err: string, results: HealthValue) => {
                  if (err) {
                    console.log('Error getting weight: ', err);
                    return;
                  }
                  console.log(results);
                },
              );
            });
          },
        },
        {
          text: 'Cancel',
          onPress: () => {},
        },
      ]);
    });
  };

  const deleteAccount = useCallback(() => {
    Alert.alert('Are you sure?', 'Deleting your account cannot be undone.', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          const response = await fetch(
            `${baseUrl}/api/profiles/${currentProfile.id}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${session?.access_token}`,
              },
            },
          );

          if (response.status === 200) {
            return await supabase.auth.signOut();
          }

          Alert.alert(
            'We were not able to delete your account this time. Please try again later.',
          );
        },
        style: 'destructive',
      },
    ]);
  }, [currentProfile, session?.access_token]);

  if (!currentProfile) {
    return (
      <SecondaryButton
        title="Log out"
        onPress={() => {
          supabase.auth.signOut();
        }}
      />
    );
  }
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.headingContainer}>
          <Text style={styles.profileText}>Profile</Text>
          <Text style={styles.nameText}>{currentProfile.name}</Text>
        </View>
        <View style={styles.optionsContainer}>
          <TouchableHighlight
            style={styles.optionContainer}
            onPress={syncWithAppleHealth}>
            <Text style={styles.optionText}>Sync with Apple Health</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.optionContainer}
            onPress={() => {
              navigation.navigate('EditProfile', {id: currentProfile.id});
            }}>
            <Text style={styles.optionText}>Profile information</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.optionContainer}
            onPress={() => {
              navigation.navigate('UpdateEmailAddress');
            }}>
            <Text style={styles.optionText}>Change email address</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.optionContainer}
            onPress={deleteAccount}>
            <Text style={styles.optionText}>Delete account</Text>
          </TouchableHighlight>
        </View>
        <Pressable
          style={styles.logoutButton}
          onPress={() => {
            supabase.auth.signOut();
          }}>
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </ScrollView>
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
  scrollContainer: {
    flex: 1,
    padding: 14,
  },
  profileText: {
    color: 'white',
    fontSize: 34,
    fontWeight: '500',
  },
  nameText: {
    color: colors.grey['400'],
    fontSize: 18,
    fontWeight: '700',
  },
  h3: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  headingContainer: {
    paddingVertical: 40,
  },
  optionsContainer: {
    paddingVertical: 40,
  },
  optionContainer: {
    paddingVertical: 20,
    borderBottomColor: colors.grey['500'],
    borderBottomWidth: 0.5,
  },
  optionText: {
    color: colors.grey['200'],
    fontSize: 22,
  },
  profileItemContainer: {
    padding: 20,
    borderTopColor: colors.grey['400'],
    borderWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionItemContainer: {
    padding: 20,
    borderColor: colors.grey['500'],
    borderWidth: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.grey['400'],
  },
  buttonContainer: {
    padding: 14,
  },
  buttonText: {
    color: colors.grey['200'],
    fontSize: 18,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 60,
  },
});

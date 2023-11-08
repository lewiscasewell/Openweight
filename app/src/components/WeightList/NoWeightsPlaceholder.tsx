import {Alert, StyleSheet} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import Text from '../Text';
import {TouchableOpacity} from 'react-native';
import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
} from 'react-native-health';
import Weight from '../../watermelondb/model/Weight';
import Profile from '../../watermelondb/model/Profile';
import {Q} from '@nozbe/watermelondb';
import dayjs from 'dayjs';
import {useAtomValue} from 'jotai';
import {sessionAtom} from '../../atoms/session.atom';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import {colors} from '../../styles/theme';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.Weight],
    write: [AppleHealthKit.Constants.Permissions.Weight],
  },
};

const NoWeightsPlaceholder = () => {
  const session = useAtomValue(sessionAtom);
  const database = useDatabase();
  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={styles.noWeightsContainer}>
      <Text style={styles.noWeightsText}>Add your first weight!</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          AppleHealthKit.initHealthKit(permissions, (error: string) => {
            if (error) {
              console.log('Error initializing Healthkit: ', error);
              return;
            }
            Alert.alert(
              'Are you sure you want to import your data from Apple health?',
              undefined,
              [
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
                                weight.dateAt = dayjs(
                                  result.startDate,
                                ).toDate();
                                weight.unit = 'kg';
                              });
                            });
                          } else {
                            const profiles = await database
                              .get<Profile>('profiles')
                              .query(
                                Q.where('supabase_user_id', session?.user.id),
                              )
                              .fetch();

                            const currentProfile = profiles?.[0];
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
                                  newWeight.dateAt = dayjs(
                                    result.startDate,
                                  ).toDate();
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
                  text: 'Cancel',
                  onPress: () => {},
                },
              ],
            );
          });
        }}>
        <Text style={styles.buttonText}>Import from Apple health?</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  noWeightsContainer: {
    paddingVertical: 100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  noWeightsText: {
    color: colors.grey[300],
    fontSize: 20,
  },
  button: {
    backgroundColor: colors['picton-blue'][400],
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});
export default NoWeightsPlaceholder;

import React from 'react';
import {
  Alert,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Text from '../Text';
import {useNavigation} from '@react-navigation/native';
import {useAtomValue} from 'jotai';
import {sessionAtom} from '../../atoms/session.atom';
import {Database, Q} from '@nozbe/watermelondb';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import Weight from '../../watermelondb/model/Weight';
import * as R from 'remeda';
import {map} from 'rxjs';
import {colors} from '../../styles/theme';
import {MaterialIcon} from '../../icons/material-icons';
import dayjs from 'dayjs';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
  Layout,
} from 'react-native-reanimated';
import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
} from 'react-native-health';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import Profile from '../../watermelondb/model/Profile';
import {TabStackNavigationProps} from '../../stacks/types';
import ListHeader from './ListHeader';

type Props = {
  database: Database;
  supabaseId: string;
  weights: Weight[];
};

const permissions: HealthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.Weight],
    write: [AppleHealthKit.Constants.Permissions.Weight],
  },
};

const WeightList = ({weights}: Props) => {
  const session = useAtomValue(sessionAtom);
  const navigation = useNavigation<TabStackNavigationProps>();
  const database = useDatabase();

  const weightsGroupedByMonth = R.pipe(
    weights,
    R.groupBy(weight => {
      const formattedDate = dayjs(weight.dateAt).format('MMM YYYY');

      return formattedDate;
    }),
  );

  const sectionListWeights = Object.keys(weightsGroupedByMonth).map(weight => {
    return {
      title: weight,
      data: weightsGroupedByMonth[weight].map(sectionWeight => {
        return {
          id: sectionWeight.id,
          weight: sectionWeight.weight,
          unit: sectionWeight.unit,
          dateAt: sectionWeight.dateAt,
        };
      }),
    };
  });

  return (
    <View>
      {session && weights.length > 0 ? (
        <SectionList
          sections={sectionListWeights}
          style={styles.weightList}
          ListHeaderComponent={<ListHeader weights={weights} />}
          ListFooterComponent={<View style={styles.footer} />}
          keyExtractor={item => item.id}
          renderItem={({item: weight, index}) => {
            const indexFromAllWeights = weights.findIndex(
              w => w.id === weight.id,
            );
            const weightBefore = weights[indexFromAllWeights + 1]?.weight;

            const diffBetweenWeights = (weight.weight - weightBefore).toFixed(
              1,
            );

            const dayString = dayjs(weight.dateAt).format('DD');
            const monthString = dayjs(weight.dateAt).format('MMM');

            return (
              <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
                <TouchableOpacity
                  style={styles.weightItemContainer}
                  onPress={() => {
                    navigation.navigate('AddWeight', {
                      dateToPass: dayjs(weight.dateAt).format('YYYY-MM-DD'),
                      id: session?.user.id,
                    });
                  }}>
                  <View style={styles.calendarDate}>
                    <Text style={styles.calendarDateDay}>{dayString}</Text>
                    <Text style={styles.calendarDateMonth}>{monthString}</Text>
                  </View>
                  <View
                    style={{justifyContent: 'center', alignItems: 'flex-end'}}>
                    <Text style={styles.weight}>
                      {weight.weight} {weight.unit}
                    </Text>

                    <Text
                      style={{
                        fontWeight: 'bold',
                        color:
                          diffBetweenWeights !== 'NaN'
                            ? Number(diffBetweenWeights) > 0
                              ? colors['water-leaf']['300']
                              : colors['picton-blue']['300']
                            : 'lightgrey',
                      }}>
                      {diffBetweenWeights !== 'NaN' ? diffBetweenWeights : '-'}{' '}
                      {weight.unit}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          }}
          renderSectionHeader={({section}) => {
            const sectionIndex = sectionListWeights.findIndex(
              weight => weight.title === section.title,
            );
            const sectionWeight =
              sectionListWeights[sectionIndex].data[0].weight;
            const sectionWeightBefore =
              sectionListWeights[sectionIndex + 1]?.data[0]?.weight;

            const diffBetweenWeights =
              sectionWeightBefore === undefined
                ? Number(
                    sectionWeight -
                      sectionListWeights[sectionIndex].data[
                        sectionListWeights[sectionIndex].data.length - 1
                      ].weight,
                  ).toFixed(1)
                : (sectionWeight - sectionWeightBefore).toFixed(1);

            return (
              <Animated.View entering={FadeInDown} style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderTitle}>
                  {Number(diffBetweenWeights) > 0 ? (
                    <MaterialIcon
                      name="arrow-up"
                      size={24}
                      color={colors.grey[300]}
                    />
                  ) : (
                    <MaterialIcon
                      name="arrow-down"
                      size={24}
                      color={colors.grey[300]}
                    />
                  )}{' '}
                  {section.title}
                </Text>
                <Text style={styles.sectionHeaderTitle}>
                  {diffBetweenWeights} kg
                </Text>
              </Animated.View>
            );
          }}
        />
      ) : (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          layout={Layout.delay(100)}
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
                                    Q.where(
                                      'supabase_user_id',
                                      session?.user.id,
                                    ),
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
                                      newWeight.supabaseUserId =
                                        session?.user.id;
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
      )}
    </View>
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
  headerContainer: {
    width: '100%',
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    height: '100%',
  },
  weightItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  calendarDate: {
    width: 60,
    height: 60,
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.black[900],
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDateDay: {
    color: colors.white,
    fontSize: 24,
  },
  calendarDateMonth: {
    color: colors.white,
    fontSize: 16,
  },
  sectionHeader: {
    backgroundColor: colors.black[950],
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderTitle: {
    color: colors.grey[300],
    fontWeight: '800',
    fontSize: 20,
  },
  weight: {
    color: colors.white,
    fontSize: 24,
  },
  footer: {
    height: 120,
  },
});

const withModels = withObservables(
  ['weights'],
  ({database, supabaseId}: Props) => {
    const query = Q.sanitizeLikeString(supabaseId);
    // return an object with weights grouped by month in reverse order with no type errors then sort by year in reverse
    return {
      weights: database
        .get<Weight>('weights')
        .query(Q.where('supabase_user_id', Q.like(`%${query}%`)))
        .observeWithColumns(['weight', 'unit', 'supabase_user_id', 'date_at'])
        .pipe(
          map(weights =>
            weights.sort((a, b) => {
              return (
                new Date(b.dateAt).getTime() - new Date(a.dateAt).getTime()
              );
            }),
          ),
        ),
    };
  },
);

export default withDatabase(withModels(WeightList));

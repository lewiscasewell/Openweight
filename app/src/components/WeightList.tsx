import React, {useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useAtom, useAtomValue} from 'jotai';
import {sessionAtom} from '../atoms/session.atom';

import {Database, Q} from '@nozbe/watermelondb';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import Weight from '../watermelondb/model/Weight';

import * as R from 'remeda';
import {map} from 'rxjs';

import {colors} from '../styles/theme';
import {GraphPoint, LineGraph} from 'react-native-graph';
import {MaterialIcon} from '../icons/material-icons';
import dayjs from 'dayjs';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutUp,
  Layout,
} from 'react-native-reanimated';
import {dateRangeAtom, dateRanges} from '../atoms/dateRange.atom';
import {hapticFeedback} from '../utils/hapticFeedback';
import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
} from 'react-native-health';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import Profile from '../watermelondb/model/Profile';
import {TabStackNavigationProps} from '../stacks/types';
const {width} = Dimensions.get('screen');

type Props = {
  database: Database;
  supabaseId: string;
  weights: Weight[];
};

const Header: React.FC<{weights: Weight[]}> = ({weights}) => {
  const [dateRange, setDateRange] = useAtom(dateRangeAtom);
  const [isDragging, setIsDragging] = useState(false);

  // @ts-ignore
  const points: GraphPoint[] = weights
    .filter(weight => {
      const now = new Date();
      const date = new Date(weight.dateAt);
      const diff = now.getTime() - date.getTime();
      const diffDays = diff / (1000 * 3600 * 24);

      switch (dateRange) {
        case 'ALL':
          return true;
        case '1Y':
          return diffDays <= 365;
        case '3M':
          return diffDays <= 90;
        case '1M':
          return diffDays <= 30;
        case '1W':
          return diffDays <= 7;
      }
    })
    // @ts-ignore
    .reduce((acc, weight, index, array) => {
      if (array.length === 1) {
        return [
          {
            date: new Date(0),
            value: 0,
          },
          {
            date: new Date(1),
            value: weight.weight,
          },
        ];
      }

      return [
        {
          date: new Date(index),
          value: weight.weight,
        },
        ...acc,
      ];
    }, []);

  const [currentPoint, setCurrentPoint] = useState<{
    index: number;
    value: number;
  }>({
    value: points[points.length - 1]?.value,
    index: points?.length - 1,
  });

  useEffect(() => {
    setCurrentPoint({
      value: points[points.length - 1]?.value,
      index: 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weights, dateRange]);

  const max = Math.max(...points.map(point => point.value));
  const min = Math.min(...points.map(point => point.value));

  const splitDate = weights?.[currentPoint.index]?.dateAt;

  const displayDate = dayjs(splitDate).format('MMM DD, YYYY');

  const calcPercentageDifference = () => {
    const currentWeight = points[points.length - 1]?.value;
    const firstWeight = points[0]?.value;
    const difference = currentWeight - firstWeight;
    const percentageDifference = ((difference / firstWeight) * 100).toFixed(1);

    return percentageDifference;
  };

  return (
    <Animated.View
      entering={FadeInUp}
      layout={Layout.delay(200)}
      style={styles.headerContainer}>
      <Text style={{color: 'white', fontSize: 16}}>{displayDate}</Text>
      <Text style={{color: 'white', fontSize: 50, fontWeight: '700'}}>
        {currentPoint.value ?? weights?.[0]?.weight}kg
      </Text>
      <Text
        style={{
          fontWeight: '700',
          color:
            Number(
              (points[points.length - 1]?.value - points[0]?.value)?.toFixed(1),
            ) > 0
              ? colors['water-leaf']['300']
              : colors['picton-blue']['300'],
        }}>
        {points.length > 0
          ? (points[points.length - 1]?.value - points[0]?.value)?.toFixed(1)
          : '0'}
        kg ({' '}
        {calcPercentageDifference() === 'NaN'
          ? '0'
          : calcPercentageDifference() === 'Infinity'
          ? '-'
          : calcPercentageDifference()}
        % )
      </Text>

      <>
        {points.length > 0 ? (
          <LineGraph
            onGestureStart={() => {
              if (!isDragging) {
                setIsDragging(true);
              }
            }}
            onGestureEnd={() => {
              if (isDragging) {
                setIsDragging(false);
              }
              if (currentPoint.index !== 0) {
                setCurrentPoint({
                  value: Number(points[points.length - 1].value?.toFixed(1)),
                  index: 0,
                });
              }
            }}
            onPointSelected={point => {
              hapticFeedback('impactLight');
              const index = point.date.getTime();

              if (!isDragging && currentPoint.index !== 0) {
                setCurrentPoint({value: point.value, index});
              }

              if (isDragging) {
                setCurrentPoint({value: point.value, index});
              }
            }}
            TopAxisLabel={() => <Text style={styles.white}>{max} kg</Text>}
            BottomAxisLabel={() => (
              <Text style={[styles.white, styles.moveRight]}>{min} kg</Text>
            )}
            style={styles.graph}
            points={points}
            color={colors['picton-blue']['400']}
            animated={true}
            enablePanGesture={true}
          />
        ) : (
          <View
            style={{
              height: 200,
              paddingVertical: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{color: 'white', fontSize: 16}}>
              No data for selected period
            </Text>
          </View>
        )}

        <View style={styles.dateRangeContainer}>
          {dateRanges.map(range => (
            <Pressable
              key={range}
              onPressIn={() => {
                setDateRange(range);
              }}
              style={[
                styles.dateRangeButton,
                dateRange === range && styles.dateRangeButtonActive,
              ]}>
              <Text
                style={[
                  styles.dateRangeButtonText,
                  dateRange === range && styles.dateRangeButtonTextActive,
                ]}>
                {range}
              </Text>
            </Pressable>
          ))}
        </View>
      </>
    </Animated.View>
  );
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
          ListHeaderComponent={<Header weights={weights} />}
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
              <Animated.View
                entering={FadeInDown.delay(index * 30)}
                exiting={FadeOutUp}>
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
              <Animated.View entering={FadeIn} style={styles.sectionHeader}>
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
  count: {
    paddingVertical: 10,
    color: '#888',
    textAlign: 'center',
  },
  graph: {
    flex: 1,
    height: 200,
    width: '100%',
    marginVertical: 20,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  dateRangeButton: {
    backgroundColor: colors.transparent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  dateRangeButtonText: {
    color: 'darkgrey',
    fontWeight: 'bold',
  },
  dateRangeButtonActive: {
    backgroundColor: '#1d1d1d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  dateRangeButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  calendarDate: {
    width: 60,
    height: 60,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#1d1d1d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDateDay: {
    color: 'white',
    fontWeight: '900',
    fontSize: 24,
  },
  calendarDateMonth: {
    color: 'white',
    fontSize: 16,
  },
  sectionHeader: {
    backgroundColor: 'black',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderTitle: {
    color: 'lightgrey',
    fontWeight: '800',
    fontSize: 20,
  },
  weight: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    height: 120,
  },
  white: {
    color: 'white',
  },
  moveRight: {
    left: width - 80,
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

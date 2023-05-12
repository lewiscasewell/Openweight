import React, {useState} from 'react';
import {
  Dimensions,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useAtom} from 'jotai';
import {sessionAtom} from '../atoms/session.atom';

import {Database, Q} from '@nozbe/watermelondb';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import Weight from '../watermelondb/model/Weight';

import * as R from 'remeda';
import {map} from 'rxjs';

import {colors} from '../styles/theme';
import {GraphPoint, LineGraph} from 'react-native-graph';
import {TabStackNavigationProps} from '../../App';
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

const {width} = Dimensions.get('screen');

type Props = {
  database: Database;
  supabaseId: string;
  weights: Weight[];
};

const dateRanges = ['1Y', '3M', '1M', '2W', '1W'] as const;
type DateRange = (typeof dateRanges)[number];

const Header: React.FC<{weights: Weight[]}> = ({weights}) => {
  const points: GraphPoint[] = weights
    .map((weight, index) => {
      return {
        date: new Date(index),
        value: weight.weight,
      };
    })
    .reverse();

  const [isDragging, setIsDragging] = useState(false);
  const [currentPoint, setCurrentPoint] = useState<{
    index: number;
    value: number;
  }>({
    value: points[points.length - 1]?.value,
    index: points?.length - 1,
  });

  const dateRange = useState<DateRange>('1Y');

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
        {currentPoint.value}kg
      </Text>
      <Text
        style={{
          fontWeight: '700',
          color:
            Number(
              (points[points.length - 1]?.value - points[0]?.value)?.toFixed(1),
            ) > 0
              ? colors.success
              : colors.error,
        }}>
        {(points[points.length - 1]?.value - points[0]?.value)?.toFixed(1)}kg ({' '}
        {calcPercentageDifference()}% )
      </Text>

      {points.length > 1 && (
        <>
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
              const index = point.date.getTime();
              console.log('point', point);

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
            color={colors.primary}
            animated={true}
            enablePanGesture={true}
          />
          <View style={styles.dateRangeContainer}>
            {dateRanges.map(range => (
              <TouchableOpacity
                key={range}
                onPressIn={() => {
                  dateRange[1](range);
                }}
                style={[
                  styles.dateRangeButton,
                  dateRange[0] === range && styles.dateRangeButtonActive,
                ]}>
                <Text
                  style={[
                    styles.dateRangeButtonText,

                    dateRange[0] === range && styles.dateRangeButtonTextActive,
                  ]}>
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </Animated.View>
  );
};

const WeightList = ({weights}: Props) => {
  const [session] = useAtom(sessionAtom);
  const navigation = useNavigation<TabStackNavigationProps>();

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
                entering={FadeInDown.delay(index * 200)}
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
                              ? colors.success
                              : colors.error
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
          <Text style={styles.noWeightsText}>No weights yet.</Text>
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
  },
  noWeightsText: {
    color: colors.grey[300],
    fontSize: 20,
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
    fontWeight: '800',
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
    left: width - 60,
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

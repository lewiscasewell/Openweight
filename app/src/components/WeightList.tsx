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
import {map, pipe} from 'rxjs';
import {DateTime} from 'luxon';

import {colors} from '../styles/theme';
import {GraphPoint, LineGraph} from 'react-native-graph';
import {TabStackNavigationProps} from '../../App';
import {MaterialIcon} from '../icons/material-icons';

const {width} = Dimensions.get('screen');

type Props = {
  database: Database;
  supabaseId: string;
  weights: Weight[];
};

const dateRanges = ['1Y', '3M', '1M', '2W', '1W'] as const;
type DateRange = (typeof dateRanges)[number];

const Header: React.FC<{points: GraphPoint[]; weights: Weight[]}> = ({
  points,
  weights,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentPoint, setCurrentPoint] = useState<{
    index: number;
    value: number;
  }>({
    value: points[points.length - 1].value,
    index: points.length - 1,
  });

  const dateRange = useState<DateRange>('1Y');

  const max = Math.max(...points.map(point => point.value));
  const min = Math.min(...points.map(point => point.value));

  const splitDate = weights?.[currentPoint.index].dateString.split('-');

  const displayDate = DateTime.fromObject({
    year: Number(splitDate[2]),
    month: Number(splitDate[1]),
    day: Number(splitDate[0]),
  }).toFormat('LLL dd, yyyy');

  const calcPercentageDifference = () => {
    const currentWeight = points[points.length - 1].value;
    const firstWeight = points[0].value;
    const difference = currentWeight - firstWeight;
    const percentageDifference = ((difference / firstWeight) * 100).toFixed(1);

    return percentageDifference;
  };

  return (
    <View style={styles.headerContainer}>
      <Text style={{color: 'white', fontSize: 16}}>{displayDate}</Text>
      <Text style={{color: 'white', fontSize: 50, fontWeight: '700'}}>
        {currentPoint.value}kg
      </Text>
      <Text
        style={{
          fontWeight: '700',
          color:
            Number(
              (points[points.length - 1].value - points[0].value)?.toFixed(1),
            ) > 0
              ? colors.success
              : colors.error,
        }}>
        {(points[points.length - 1].value - points[0]?.value)?.toFixed(1)}kg ({' '}
        {calcPercentageDifference()}% )
      </Text>

      {points.length > 1 && (
        <>
          <LineGraph
            onGestureStart={() => {
              setIsDragging(true);
            }}
            onGestureEnd={() => {
              setIsDragging(false);

              setCurrentPoint({
                value: Number(points[points.length - 1].value?.toFixed(1)),
                index: points.length - 1,
              });
            }}
            onPointSelected={point => {
              const index = point.date.getTime();
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
    </View>
  );
};

const WeightList = ({weights}: Props) => {
  const [session] = useAtom(sessionAtom);
  const navigation = useNavigation<TabStackNavigationProps>();

  const WEIGHT_DATA = R.pipe(
    weights,
    R.groupBy(weight => {
      const splitDate = weight.dateString.split('-');
      const date = DateTime.fromObject({
        year: Number(splitDate[2]),
        month: Number(splitDate[1]),
        day: Number(splitDate[0]),
      });

      return date.toFormat('LLL yyyy');
    }),
  );

  const WEIGHT_DATA2 = Object.keys(WEIGHT_DATA).map(weight => {
    return {
      title: weight,
      data: WEIGHT_DATA[weight].map(weight => {
        return {
          weight: weight.weight,
          unit: weight.unit,
          dateString: weight.dateString,
        };
      }),
    };
  });

  const points: GraphPoint[] = weights
    .map((weight, index) => {
      return {
        date: new Date(index),
        value: weight.weight,
      };
    })
    .reverse();

  return (
    <View>
      <SectionList
        sections={WEIGHT_DATA2}
        style={styles.weightList}
        ListHeaderComponent={<Header points={points} weights={weights} />}
        ListFooterComponent={<View style={styles.footer} />}
        keyExtractor={(item, index) => item.dateString + index}
        renderItem={({item: weight, index}) => {
          const weightBefore = weights?.[index + 1]?.weight;
          // find the difference between the weight and trim it to 1 decimal
          const diffBetweenWeights = (weight.weight - weightBefore).toFixed(1);
          // console.log(diffBetweenWeights);
          const splitDate = weight.dateString.split('-');
          // console.log(weight);
          const dayString = splitDate[0];
          const monthString = DateTime.local(
            2020,
            parseInt(splitDate[1], 10),
            1,
          ).toFormat('LLL');
          return (
            <TouchableOpacity
              style={styles.weightItemContainer}
              onPress={() => {
                navigation.navigate('AddWeight', {
                  dateToPass: weight.dateString,
                  id: session?.user.id,
                });
              }}>
              <View style={styles.calendarDate}>
                <Text style={styles.calendarDateDay}>{dayString}</Text>
                <Text style={styles.calendarDateMonth}>{monthString}</Text>
              </View>
              <View style={{justifyContent: 'center', alignItems: 'flex-end'}}>
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
          );
        }}
        renderSectionHeader={({section}) => {
          const sectionIndex = WEIGHT_DATA2.findIndex(
            weight => weight.title === section.title,
          );
          const sectionWeight = WEIGHT_DATA2[sectionIndex].data[0].weight;
          const sectionWeightBefore =
            WEIGHT_DATA2[sectionIndex + 1]?.data[0]?.weight;

          const diffBetweenWeights =
            sectionWeightBefore === undefined
              ? sectionWeight -
                WEIGHT_DATA2[sectionIndex].data[
                  WEIGHT_DATA2[sectionIndex].data.length - 1
                ].weight
              : (sectionWeight - sectionWeightBefore).toFixed(1);

          return (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderTitle}>
                {diffBetweenWeights > 0 ? (
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
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
        .query(Q.where('supabase_id', Q.like(`%${query}%`)))
        .observeWithColumns(['date_string', 'weight', 'unit', 'supabase_id'])
        .pipe(
          map(weights =>
            weights.sort((a, b) => b.dateString.localeCompare(a.dateString)),
          ),
          pipe(
            map(weights =>
              weights.reduce((acc, weight) => {
                const month = weight.dateString.split('-')[1];
                const year = weight.dateString.split('-')[2];
                const monthYear = `${year}-${month}`;
                console.log('year', year);
                // @ts-ignore
                if (acc[monthYear]) {
                  // @ts-ignore
                  acc[monthYear].push(weight);
                } else {
                  // @ts-ignore
                  acc[monthYear] = [weight];
                }
                console.log('acc', acc);
                return acc;
              }, {}),
            ),

            map(weights => {
              const monthYears = Object.keys(weights);
              const sortedMonthYears = monthYears.sort((a, b) =>
                b.localeCompare(a),
              );

              return sortedMonthYears.reduce((acc, month) => {
                // @ts-ignore
                acc.push(...weights[month]);
                return acc;
              }, []);
            }),
          ),
        ),
    };
  },
);

export default withDatabase(withModels(WeightList));

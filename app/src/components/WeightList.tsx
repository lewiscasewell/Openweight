import React from 'react';
import {Database, Q} from '@nozbe/watermelondb';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';

import withObservables from '@nozbe/with-observables';
import {DateTime} from 'luxon';

import {
  FlatList,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as R from 'remeda';

import Weight from '../watermelondb/model/Weight';
import {groupBy, map, mergeAll, of, pipe, toArray} from 'rxjs';
import {colors} from '../styles/colors';
import {useNavigation} from '@react-navigation/native';
import {useAtom} from 'jotai';
import {sessionAtom} from '../atoms/session.atom';

type Props = {
  database: Database;
  supabaseId: string;
  weights: Weight[];
};

const WeightList = ({weights}: Props) => {
  const [session] = useAtom(sessionAtom);
  console.log(
    'weights',
    weights.map(weight => weight.weight),
  );

  const navigation = useNavigation();

  // convert weights in format above
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
  console.log('WEIGHT_DATA', WEIGHT_DATA2);

  return (
    <>
      <SectionList
        sections={WEIGHT_DATA2}
        style={styles.list}
        ListHeaderComponent={() => {
          const lastWeight = weights?.[0];
          return (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 10,
                }}>
                <Text
                  style={{color: 'white', fontSize: 100, fontWeight: '600'}}>
                  {lastWeight.weight}
                </Text>
                <Text style={{color: 'white', fontSize: 50}}>
                  {lastWeight.unit.toUpperCase()}
                </Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={() => {
          return (
            <View
              style={{
                height: 120,
              }}
            />
          );
        }}
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
            parseInt(splitDate[1]),
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
          return (
            <View
              style={{
                backgroundColor: 'black',
                paddingVertical: 10,
              }}>
              <Text style={{color: 'white', fontWeight: '800', fontSize: 20}}>
                {section.title}
              </Text>
            </View>
          );
        }}
      />
      {false && (
        <FlatList
          data={weights}
          renderItem={({item: weight, index}) => {
            const weightBefore = weights?.[index + 1]?.weight;
            // find the difference between the weight and trim it to 1 decimal
            const diffBetweenWeights = (weight.weight - weightBefore).toFixed(
              1,
            );
            // console.log(diffBetweenWeights);
            const splitDate = weight.dateString.split('-');
            // console.log(weight);
            const dayString = splitDate[0];
            const monthString = DateTime.local(
              2020,
              parseInt(splitDate[1]),
              1,
            ).toFormat('LLL');
            return (
              <TouchableOpacity style={styles.weightItemContainer}>
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
                            ? '#ef4444'
                            : '#22c55e'
                          : 'lightgrey',
                    }}>
                    {diffBetweenWeights !== 'NaN' ? diffBetweenWeights : '-'}{' '}
                    {weight.unit}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  list: {
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
  weight: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

const withModels = withObservables(
  ['weights'],
  ({database, supabaseId}: Props) => {
    const query = Q.sanitizeLikeString(supabaseId);
    // return an object with weights grouped by month in reverse order with no type errors
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
                if (acc[month]) {
                  acc[month].push(weight);
                } else {
                  acc[month] = [weight];
                }
                return acc;
              }, {}),
            ),

            map(weights => {
              const months = Object.keys(weights);
              const sortedMonths = months.sort((a, b) => b.localeCompare(a));
              return sortedMonths.reduce((acc, month) => {
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

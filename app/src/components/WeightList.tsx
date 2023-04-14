import React from 'react';
import {Database, Q} from '@nozbe/watermelondb';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';

import withObservables from '@nozbe/with-observables';
import {DateTime} from 'luxon';

import {FlatList, StyleSheet, Text, View} from 'react-native';

import Weight from '../watermelondb/model/Weight';

type Props = {
  database: Database;
  supabaseId: string;
  weights: Weight[];
};

const WeightList = ({weights}: Props) => {
  console.log('weightd', weights);
  // const database = useDatabase();

  return (
    <>
      {weights && (
        <FlatList
          data={weights?.slice().reverse()}
          style={styles.list}
          renderItem={({item: weight}) => {
            const dayString = DateTime.fromJSDate(weight.date).toFormat('dd');
            const monthString = DateTime.fromJSDate(weight.date).toFormat(
              'LLL',
            );
            return (
              <View style={styles.weightItemContainer}>
                <View style={styles.calendarDate}>
                  <Text style={styles.calendarDateDay}>{dayString}</Text>
                  <Text style={styles.calendarDateMonth}>{monthString}</Text>
                </View>
                <Text style={styles.weight}>
                  {weight.weight} {weight.unit}
                </Text>
              </View>
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

    return {
      weights: database
        .get<Weight>('weights')
        .query(Q.where('supabase_id', Q.like(`%${query}%`)))
        .observeWithColumns(['date', 'weight', 'unit', 'supabase_id']),
    };
  },
);

export default withDatabase(withModels(WeightList));

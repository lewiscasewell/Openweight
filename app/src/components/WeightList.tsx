import {Database, Q} from '@nozbe/watermelondb';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import {DateTime} from 'luxon';

import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';

import Weight from '../watermelondb/model/Weight';

type Props = {
  database: Database;
  supabaseId: string;
  weights: Weight[];
};

const WeightList = ({weights}: Props) => {
  //   const navigation = useNavigation();
  console.log('weightd', weights);

  return (
    <>
      {weights && (
        <FlatList
          data={weights?.slice().reverse()}
          style={styles.list}
          renderItem={({item: weight}) => {
            const dateString = DateTime.fromJSDate(weight.date).toFormat(
              'dd LLL yyyy',
            );
            return (
              <View>
                <Text style={{color: 'white'}}>{dateString}</Text>
                <Text style={{color: 'white'}}>
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
  count: {
    paddingVertical: 10,
    color: '#888',
    textAlign: 'center',
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
        .observe(),
    };
  },
);

export default withDatabase(withModels(WeightList));

import {View} from 'react-native';
import withObservables from '@nozbe/with-observables';
import {Database, Q} from '@nozbe/watermelondb';
import Weight from '../../watermelondb/model/Weight';
import React, {useMemo} from 'react';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import {FlashList} from '@shopify/flash-list';
import dayjs from 'dayjs';
import ListHeader from './ListHeader';
import NoWeightsPlaceholder from './NoWeightsPlaceholder';
import Item from './Item';
import SectionTitle from './SectionTitle';
import type {SectionTitleProps} from './SectionTitle';
import {useAtom} from 'jotai';
import {weightCountAtom} from '../../atoms/weightCount.atom';
import {useDebounce} from 'use-debounce';

const MemoListHeader = React.memo(ListHeader);

type InsertMonthResult = Array<Weight | SectionTitleProps>;
function insertMonthStrings(weights: Weight[]) {
  let result: InsertMonthResult = []; // Final result array
  let currentMonthWeights = []; // Temporary array for current month's weights
  let currentMonthYear = ''; // The current month and year

  for (const weight of weights) {
    const weightMonthYear = dayjs(weight.dateAt).format('MMMM YYYY');
    if (currentMonthYear !== weightMonthYear) {
      if (currentMonthWeights.length > 0) {
        // Calculate weight difference: last weight - first weight of the month
        const weightDifference =
          currentMonthWeights[currentMonthWeights.length - 1].weight -
          currentMonthWeights[0].weight;
        // Insert summary object before the current month's weights
        result = [
          {title: currentMonthYear, weightDifference: weightDifference},
          ...currentMonthWeights.reverse(),
          ...result,
        ];
        currentMonthWeights = []; // Reset the current month weights for the new month
      }
      currentMonthYear = weightMonthYear; // Update to the new month and year
    }
    currentMonthWeights.push(weight); // Push current weight record to current month's array
  }

  // After loop ends, handle any remaining weights for the last month
  if (currentMonthWeights.length > 0) {
    const weightDifference =
      currentMonthWeights[currentMonthWeights.length - 1].weight -
      currentMonthWeights[0].weight;
    result = [
      {title: currentMonthYear, weightDifference: weightDifference},
      ...currentMonthWeights.reverse(),
      ...result,
    ];
  }

  // inserting header at the top instead of using ListHeaderComponent, as there is a performance issue with ListHeaderComponent
  return ['header', ...result];
}

type Props = {
  weights: Weight[];
  supabaseUserId: string;
  database: Database;
  count: number;
};

const HomeFlatlist: React.FC<Props> = ({weights, supabaseUserId}) => {
  const [count, setCount] = useAtom(weightCountAtom);
  const [nCount] = useDebounce(count, 1000);
  const weightsWithMonthStrings = useMemo(
    () => insertMonthStrings(weights.reverse()),
    [weights],
  );

  const stickyHeaderIndices = useMemo(
    () =>
      weightsWithMonthStrings
        .map((item, index) => {
          if (item instanceof Object && 'title' in item) {
            return index;
          } else {
            return null;
          }
        })
        .filter(item => item !== null) as number[],
    [weightsWithMonthStrings],
  );
  return (
    <>
      {weights.length > 0 ? (
        <FlashList
          onScroll={e => {
            // console.log(JSON.stringify(e.nativeEvent, null, 2));
            const HEADER_HEIGHT = 714;

            if (
              e.nativeEvent.contentOffset.y >=
              e.nativeEvent.contentSize.height - HEADER_HEIGHT - 260
            ) {
              setCount(nCount + 50);
            }
          }}
          onScrollToTop={() => {
            setCount(50);
          }}
          data={weightsWithMonthStrings}
          stickyHeaderIndices={stickyHeaderIndices}
          contentContainerStyle={{paddingBottom: 100}}
          getItemType={item => {
            // To achieve better performance, specify the type based on the item
            return item instanceof Object && 'title' in item
              ? 'sectionHeader'
              : 'row';
          }}
          estimatedItemSize={70}
          // Flashlist recommends inserting a piece of data into the original data array to represent the sticky header
          // this gives a SectionList feel but with the performance of FlashList
          renderItem={({item}) => {
            const indexFromAllWeights = weights.findIndex(w => {
              if (item instanceof Object && 'id' in item) {
                return w.id === item.id;
              }
            });
            const weightBefore = weights[indexFromAllWeights - 1]?.weight;
            if (typeof item === 'string') {
              return <MemoListHeader supabaseUserId={supabaseUserId} />;
            }

            if (item instanceof Object && 'title' in item) {
              return (
                <SectionTitle
                  title={item.title}
                  weightDifference={item.weightDifference}
                />
              );
            }
            return <Item item={item} weightBefore={weightBefore} />;
          }}
          ItemSeparatorComponent={() => <View style={{height: 10}} />}
        />
      ) : (
        <NoWeightsPlaceholder />
      )}
    </>
  );
};

const withModels = withObservables(
  ['weights', 'count'],
  ({supabaseUserId, database, count}: Props) => {
    return {
      weights: database
        .get<Weight>('weights')
        .query(
          Q.where('supabase_user_id', supabaseUserId),
          Q.sortBy('date_at', Q.desc),
          Q.take(count),
        )
        .observeWithColumns([
          'weight',
          'unit',
          'supabase_user_id',
          'date_at',
          'id',
        ]),
    };
  },
);

export default withDatabase(withModels(HomeFlatlist));

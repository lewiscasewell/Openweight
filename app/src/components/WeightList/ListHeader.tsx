import {useAtomValue} from 'jotai';
import Weight from '../../watermelondb/model/Weight';
import {dateRangeAtom} from '../../atoms/dateRange.atom';
import React, {RefObject, useEffect, useRef, useState} from 'react';
import dayjs from 'dayjs';
import Animated, {FadeInUp, Layout} from 'react-native-reanimated';
import {Button, Dimensions, Pressable, StyleSheet, View} from 'react-native';
import Text from '../Text';
import {colors} from '../../styles/theme';
import {LineGraph, GraphPoint} from 'react-native-graph';
import {hapticFeedback} from '../../utils/hapticFeedback';
import DateRangeSelect from './DateRangeSelect';
import {Database, Q} from '@nozbe/watermelondb';
import {map} from 'rxjs';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import AnimatedNumber from '../AnimatedText';

const GRADIENT_COLORS = [
  `${colors['picton-blue'][950]}5D`,
  `${colors['picton-blue'][950]}4D`,
  `${colors['picton-blue'][950]}00`,
];

type Props = {
  weights: Weight[];
  supabaseUserId: string;
  database: Database;
};

const ListHeader: React.FC<{weights: Weight[]}> = ({weights}) => {
  const dateRange = useAtomValue(dateRangeAtom);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(300);

  const onLayout = (event: any) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

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

  // const max = Math.max(...points.map(point => point.value));
  // const min = Math.min(...points.map(point => point.value));
  const maxPoint = points.reduce(
    (acc, point, index) => {
      if (point.value > acc.value) {
        const x = (index * containerWidth) / points.length;
        return {
          value: point.value,
          index,
          x,
        };
      }
      return acc;
    },
    {
      value: 0,
      index: 0,
      x: 0,
    },
  );
  const minPoint = points.reduce(
    (acc, point, index) => {
      if (point.value < acc.value) {
        const x = (index * containerWidth) / points.length;
        return {
          value: point.value,
          index,
          x,
        };
      }
      return acc;
    },
    {
      value: 1000,
      index: 0,
      x: 0,
    },
  );

  const splitDate = weights?.[currentPoint.index]?.dateAt;

  const displayDate = dayjs(splitDate).format('MMM DD, YYYY');

  const calcPercentageDifference = () => {
    const currentWeight = points[points.length - 1]?.value;
    const firstWeight = points[0]?.value;
    const difference = currentWeight - firstWeight;
    const percentageDifference = ((difference / firstWeight) * 100).toFixed(1);

    return percentageDifference;
  };

  useEffect(() => {
    if (!isDragging) {
      setCurrentPoint({
        value: points[points.length - 1]?.value,
        index: 0,
      });
    }
    if (isDragging && currentPoint.index === 0) {
      setCurrentPoint({
        value: points[points.length - 2]?.value,
        index: 1,
      });
    }
  }, [isDragging]);

  return (
    <Animated.View
      onLayout={onLayout}
      entering={FadeInUp}
      layout={Layout.delay(200)}
      style={styles.headerContainer}>
      <Text style={{color: 'white', fontSize: 16}}>{displayDate}</Text>
      {/* <Text style={{color: 'white', fontSize: 50, fontWeight: '700'}}>
        {currentPoint.value ?? weights?.[0]?.weight}kg
      </Text> */}
      <AnimatedNumber
        text={`${
          currentPoint.value?.toFixed(1) ??
          weights?.[0]?.weight?.toFixed(1) ??
          '0.0'
        }kg`}
      />
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
              hapticFeedback('impactLight');
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
              if (!isDragging && currentPoint.index === 0) {
                return;
              }

              if (currentPoint.value !== point.value) {
                setCurrentPoint({
                  value: point.value,
                  index,
                });
              }
            }}
            TopAxisLabel={() => (
              <Text style={[styles.white, {left: maxPoint.x}]}>
                {maxPoint.value} kg
              </Text>
            )}
            BottomAxisLabel={() => (
              <Text style={[styles.white, {left: minPoint.x}]}>
                {minPoint.value} kg
              </Text>
            )}
            style={styles.graph}
            points={points}
            gradientFillColors={GRADIENT_COLORS}
            verticalPadding={8}
            horizontalPadding={8}
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
        <DateRangeSelect />
      </>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  graph: {
    flex: 1,
    height: 200,
    width: '100%',
    marginVertical: 20,
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
    left: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    backgroundColor: 'red',
  },
});

const withModels = withObservables(
  ['weights'],
  ({database, supabaseUserId}: Props) => {
    return {
      weights: database
        .get<Weight>('weights')
        .query(Q.where('supabase_user_id', supabaseUserId))
        .observeWithColumns([
          'weight',
          'unit',
          'supabase_user_id',
          'date_at',
          'id',
        ])
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

export default withDatabase(withModels(ListHeader));

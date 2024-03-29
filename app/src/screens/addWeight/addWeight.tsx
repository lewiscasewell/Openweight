import {Database, Q} from '@nozbe/watermelondb';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useAtom} from 'jotai';
import React, {useCallback, useState} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import Text from '../../components/Text';
import {SafeAreaView} from 'react-native-safe-area-context';
import {sessionAtom} from '../../atoms/session.atom';
import Weight from '../../watermelondb/model/Weight';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import withObservables from '@nozbe/with-observables';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import {colors} from '../../styles/theme';
import {AuthStackParamList, TabStackNavigationProps} from '../../stacks/types';
import {MaterialIcon} from '../../icons/material-icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {map} from 'rxjs';
import {hapticFeedback} from '../../utils/hapticFeedback';
import {addWeight, deleteWeight} from './util';
import {useConfettiAnimation} from '../../components/Confetti';
import {MeshGradient} from 'react-native-patterns';

dayjs.extend(utc);

type AddWeightScreenRouteProp = RouteProp<AuthStackParamList, 'AddWeight'>;

type Props = {
  database: Database;
  route: AddWeightScreenRouteProp;
  weights: Weight[];
  id?: string;
};

const {width, height} = Dimensions.get('screen');

const AddWeightScreen = ({weights}: Props) => {
  const route = useRoute<AddWeightScreenRouteProp>();

  const latestWeight = weights[0]?.weight;
  const [session] = useAtom(sessionAtom);
  const database = useDatabase();
  const navigation = useNavigation<TabStackNavigationProps>();
  const {startAnimation} = useConfettiAnimation();
  const currentWeight = weights.find(
    weight =>
      dayjs(weight.dateAt).format('YYYY-MM-DD') === route.params.dateToPass,
  );

  const [weightInputInterval, setWeightInputInterval] = useState(
    setInterval(() => {}, 100),
  );

  const [weightInput, setWeightInput] = React.useState(
    currentWeight?.weight?.toString() ?? '',
  );
  const [date, setDate] = React.useState(
    dayjs(route.params.dateToPass).startOf('day').toDate(),
  );

  const incrementWeight = useCallback(() => {
    hapticFeedback('impactLight');

    if (!weightInput) {
      if (latestWeight) {
        setWeightInput(latestWeight.toString());
      } else {
        setWeightInput('70.0');
      }
    }

    if (parseFloat(weightInput!) >= 1000) {
      return;
    }

    setWeightInput(currentWeightInput =>
      (parseFloat(currentWeightInput!) + 0.1).toFixed(1),
    );
  }, [weightInput, latestWeight]);

  const decrementWeight = useCallback(() => {
    hapticFeedback('impactLight');

    if (!weightInput) {
      if (latestWeight) {
        setWeightInput(latestWeight.toString());
      } else {
        setWeightInput('70.0');
      }
    }
    if (parseFloat(weightInput!) <= 0) {
      return;
    }

    setWeightInput(currentWeightInput =>
      (parseFloat(currentWeightInput!) - 0.1).toFixed(1),
    );
  }, [weightInput, latestWeight]);

  return (
    <>
      <MeshGradient
        style={{position: 'absolute'}}
        height={height}
        width={width}
        blurRadius={0.5}
        overlayOpacity={0.95}
        uniqueKey={currentWeight?.id ?? 'no-id'}
      />
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.container}
          keyboardVerticalOffset={80}>
          <View style={styles.contentContainer}>
            <View style={styles.weightInputContainer}>
              <TouchableOpacity
                onPressIn={() => {
                  decrementWeight();
                }}
                onLongPress={() => {
                  const interval = setInterval(() => {
                    decrementWeight();
                  }, 100);

                  setWeightInputInterval(interval);

                  return () => clearInterval(interval);
                }}
                onPressOut={() => {
                  clearInterval(weightInputInterval);
                }}
                activeOpacity={0.7}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: colors.black[900],
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <MaterialIcon name="minus" color="white" size={30} />
              </TouchableOpacity>
              <TextInput
                keyboardAppearance="dark"
                style={[styles.weightInput]}
                keyboardType="numeric"
                placeholder={latestWeight?.toString() ?? '70.0'}
                maxLength={5}
                value={weightInput}
                onChangeText={text => {
                  setWeightInput(text);
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  incrementWeight();
                }}
                onLongPress={() => {
                  const interval = setInterval(() => {
                    incrementWeight();
                  }, 100);

                  setWeightInputInterval(interval);

                  return () => clearInterval(interval);
                }}
                onPressOut={() => {
                  clearInterval(weightInputInterval);
                }}
                activeOpacity={0.7}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: colors.black[900],
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <MaterialIcon name="plus" color="white" size={30} />
              </TouchableOpacity>
            </View>
            {date && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    deleteWeight({database, weights, date, navigation});
                  }}
                  style={{
                    backgroundColor: colors.black[800],
                    paddingVertical: 7,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                  }}>
                  <Text style={{color: 'white', fontSize: 18}}>Delete</Text>
                </TouchableOpacity>

                <RNDateTimePicker
                  themeVariant="dark"
                  accentColor={colors['picton-blue'][500]}
                  value={date}
                  maximumDate={new Date()}
                  onChange={value => {
                    hapticFeedback('impactLight');
                    const newDate = dayjs(value.nativeEvent.timestamp!)
                      .startOf('day')
                      .toDate();

                    setDate(newDate);

                    const getWeight = weights.find(
                      weight =>
                        dayjs(weight.dateAt).format('YYYY-MM-DD') ===
                        dayjs(newDate).format('YYYY-MM-DD'),
                    );

                    if (
                      dayjs(date).format('YYYY-MM-DD') !==
                      dayjs(newDate).format('YYYY-MM-DD')
                    ) {
                      setWeightInput(getWeight?.weight?.toString() ?? '');
                    }
                  }}
                />
              </View>
            )}
          </View>

          <View>
            <TouchableOpacity
              style={styles.touchable}
              activeOpacity={0.7}
              onPress={() => {
                addWeight({
                  database,
                  weights,
                  session,
                  date,
                  weightInput:
                    weightInput === ''
                      ? latestWeight?.toString() ?? '70'
                      : weightInput,
                  navigation,
                  startAnimation,
                });
              }}>
              <Text style={styles.touchableText}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  contentContainer: {
    flex: 1,
  },
  weightInputContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  weightInput: {
    height: 200,
    width: 220,
    fontSize: 90,
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'CabinetGrotesk-Medium',
  },
  saveButton: {
    backgroundColor: '#1d1d1d',
    padding: 18,
    borderRadius: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  touchable: {
    backgroundColor: colors['picton-blue'][600],
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    fontFamily: 'CabinetGrotesk-Medium',
  },
  touchableText: {
    color: colors.white,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

const withModels = withObservables(['route'], ({database, route}: Props) => {
  const {id} = route.params;

  return {
    weights: database
      .get<Weight>('weights')
      .query(Q.where('supabase_user_id', id), Q.sortBy('date_at', Q.desc))
      .observeWithColumns(['weight', 'unit', 'supabase_user_id', 'date_at']),
  };
});

export default withDatabase(withModels(AddWeightScreen));

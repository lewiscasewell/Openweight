import {Database, Q} from '@nozbe/watermelondb';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useAtom} from 'jotai';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {sessionAtom} from '../atoms/session.atom';
import Profile from '../watermelondb/model/Profile';
import Weight from '../watermelondb/model/Weight';
import RNDateTimePicker from '@react-native-community/datetimepicker';

import withObservables from '@nozbe/with-observables';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import {colors} from '../styles/theme';
import {AuthStackParamList, TabStackNavigationProps} from '../../App';
import {MaterialIcon} from '../icons/material-icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

type Props = {
  database: Database;
  route: any;
  weights: Weight[];
};

type AddWeightScreenRouteProp = RouteProp<AuthStackParamList, 'AddWeight'>;

const AddWeightScreen = ({weights}: Props) => {
  const route = useRoute<AddWeightScreenRouteProp>();

  const [weightInput, setWeightInput] = React.useState(
    weights
      .find(
        weight =>
          dayjs(weight.dateAt).format('YYYY-MM-DD') === route.params.dateToPass,
      )
      ?.weight.toString() ??
      weights[0]?.weight.toString() ??
      '',
  );

  const [session] = useAtom(sessionAtom);
  const database = useDatabase();
  const navigation = useNavigation<TabStackNavigationProps>();

  const [date, setDate] = React.useState(
    dayjs(route.params.dateToPass).startOf('day').utc(true).toDate(),
  );

  async function addWeight() {
    await database.write(async () => {
      const profile = await database
        .get<Profile>('profiles')
        .query(Q.where('supabase_user_id', session?.user.id!))
        .fetch();

      const weightOnDate = weights.find(
        weight =>
          dayjs(weight.dateAt).format('YYYY-MM-DD') ===
          dayjs(date).format('YYYY-MM-DD'),
      );

      if (weightOnDate !== undefined && weightInput) {
        await weightOnDate
          .update(weightRecord => {
            weightRecord.weight = parseFloat(weightInput);
          })
          .then(() => {
            console.log('updated');
          });

        navigation.goBack();

        return;
      }
      if (weightInput) {
        await database.get<Weight>('weights').create(weight => {
          // @ts-ignore
          weight.profile.set(profile[0]);
          weight.weight = parseFloat(weightInput);
          weight.unit = 'kg';
          weight.dateAt = date;
          weight.supabaseUserId = session?.user.id!;
        });
      }

      navigation.goBack();
    });
  }

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.container}
        keyboardVerticalOffset={80}>
        <View style={styles.contentContainer}>
          <View style={styles.weightInputContainer}>
            <TouchableOpacity
              onPressIn={() => {
                setWeightInput(currentWeightInput =>
                  (parseFloat(currentWeightInput!) - 0.1).toFixed(1),
                );
              }}
              activeOpacity={0.7}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.grey[900],
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <MaterialIcon name="minus" color="white" size={30} />
            </TouchableOpacity>
            <TextInput
              style={styles.weightInput}
              keyboardType="numeric"
              placeholder="70.0"
              maxLength={5}
              value={weightInput}
              onChangeText={text => {
                setWeightInput(text);
              }}
            />
            <TouchableOpacity
              onPressIn={() => {
                setWeightInput(currentWeightInput =>
                  (parseFloat(currentWeightInput!) + 0.1).toFixed(1),
                );
              }}
              activeOpacity={0.7}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.grey[900],
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
                style={{
                  backgroundColor: '#1d1d1d',
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                }}>
                <Text style={{color: 'white', fontSize: 18}}>Delete</Text>
              </TouchableOpacity>

              <RNDateTimePicker
                themeVariant="dark"
                value={date}
                maximumDate={new Date()}
                onChange={value => {
                  const newDate = dayjs(value.nativeEvent.timestamp!)
                    .utc(true)
                    .startOf('day')
                    .toDate();

                  setDate(newDate);

                  // const getWeight = weights.find(
                  //   weight => weight.dateString === newDateString,
                  // );

                  // if (getWeight) {
                  //   setWeightInput(getWeight.weight.toString());
                  // }
                }}
              />
            </View>
          )}
        </View>

        <View>
          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.7}
            onPress={() => {
              addWeight();
            }}>
            <Text style={styles.saveButtonText}>SAVE</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  title: {
    color: 'white',
  },
  contentContainer: {
    flex: 1,
  },
  weightInputContainer: {
    backgroundColor: 'black',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  weightInput: {
    height: 200,
    width: 250,
    fontSize: 100,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
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
});

const withModels = withObservables(['route'], ({database, route}: Props) => {
  const {id} = route.params;

  const weights = database
    .get<Weight>('weights')
    .query(Q.where('supabase_user_id', id))
    .observeWithColumns(['weight', 'date_at']);

  return {
    weights: weights,
  };
});

export default withDatabase(withModels(AddWeightScreen));

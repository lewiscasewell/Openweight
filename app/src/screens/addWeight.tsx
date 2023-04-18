import {Database, Q} from '@nozbe/watermelondb';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useAtom} from 'jotai';
import {DateTime} from 'luxon';
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

type Props = {
  database: Database;
  route: any;
  weights: Weight[];
};

const AddWeightScreen = ({weights}: Props) => {
  const route = useRoute();
  const [weightInput, setWeightInput] = React.useState(
    weights
      .find(weight => weight.dateString === route.params.dateToPass)
      ?.weight.toString(),
  );

  const [session] = useAtom(sessionAtom);
  const database = useDatabase();
  const navigation = useNavigation();
  const [dateString, setDateString] = React.useState(route.params.dateToPass);

  const [date, setDate] = React.useState(
    DateTime.fromFormat(dateString, 'dd-MM-yyyy').toJSDate(),
  );

  async function addWeight() {
    await database.write(async () => {
      const profile = await database
        .get<Profile>('profiles')
        .query(Q.where('supabase_id', session?.user.id!))
        .fetch();

      const weightOnDate = await database
        .get<Weight>('weights')
        .query(
          Q.where('supabase_id', session?.user.id!),
          Q.where('date_string', dateString),
        )
        .fetch();

      if (weightOnDate.length > 0 && weightInput) {
        console.log('weight on date', weightOnDate[0]);
        await weightOnDate[0]
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
          weight.date = date;
          weight.supabaseId = session?.user.id!;
          weight.dateString = dateString;
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
          </View>
          {date && (
            <View style={{alignItems: 'center'}}>
              <RNDateTimePicker
                themeVariant="dark"
                value={date instanceof Date ? date : new Date()}
                maximumDate={new Date()}
                onChange={value => {
                  const newDateString = DateTime.fromMillis(
                    value.nativeEvent.timestamp!,
                  ).toFormat('dd-MM-yyyy');

                  setDate(new Date(value.nativeEvent.timestamp!));
                  setDateString(newDateString);

                  const getWeight = weights.find(
                    weight => weight.dateString === newDateString,
                  );

                  if (getWeight) {
                    setWeightInput(getWeight.weight.toString());
                  }
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightInput: {
    backgroundColor: 'black',
    height: 200,
    width: 300,
    fontSize: 110,
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
  const {dateToPass, id} = route.params;

  console.log('date to pass', dateToPass);

  const weights = database
    .get<Weight>('weights')
    .query(Q.where('supabase_id', id))
    .observeWithColumns(['weight', 'date_string']);

  return {
    weights: weights,
  };
});

export default withDatabase(withModels(AddWeightScreen));

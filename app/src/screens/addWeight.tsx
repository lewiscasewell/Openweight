import {Database, Q} from '@nozbe/watermelondb';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import {Route, useNavigation} from '@react-navigation/native';
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
  Button,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {sessionAtom} from '../atoms/session.atom';
import Profile from '../watermelondb/model/Profile';
import Weight from '../watermelondb/model/Weight';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import {dateAtom} from '../atoms/date.atom';
import withObservables from '@nozbe/with-observables';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import {find} from 'rxjs';

type Props = {
  database: Database;
  route: any;
  weights: Weight[];
};

const AddWeightScreen = ({weights}: Props) => {
  const [weightInput, setWeightInput] = React.useState(
    weights
      .find(
        weight => weight.dateString === DateTime.now().toFormat('dd-MM-yyyy'),
      )
      ?.weight.toString(),
  );
  console.log('weightInput', weightInput);
  const [session] = useAtom(sessionAtom);
  const [date, setDate] = React.useState(new Date());
  const [dateString, setDateString] = React.useState(
    DateTime.now().toFormat('dd-MM-yyyy'),
  );
  const database = useDatabase();
  const navigation = useNavigation();
  const today = DateTime.now().toFormat('dd-MM-yyyy');
  const [dateAtomic, setDateAtomic] = useAtom(dateAtom);
  console.log('dateAtomic', dateAtomic);

  async function getWeightOnDate() {
    const weightOnDate = await database
      .get<Weight>('weights')
      .query(
        Q.where('supabase_id', session?.user.id!),
        Q.where('date', Q.gte(new Date().setHours(0, 0, 0, 0))),
      )
      .fetch();

    return weightOnDate;
  }

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
          Q.where('date_string', dateAtomic.dateString),
        )
        .fetch();

      console.log(weightOnDate[0]);

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
          weight.date = dateAtomic.date;
          weight.supabaseId = session?.user.id!;
          weight.dateString = dateAtomic.dateString;
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
              onChangeText={text => {
                setWeightInput(text);
              }}
            />
          </View>
          <View style={{alignItems: 'center'}}>
            <RNDateTimePicker
              themeVariant="dark"
              value={
                dateAtomic.date instanceof Date ? dateAtomic.date : new Date()
              }
              maximumDate={new Date()}
              onChange={value => {
                setDateAtomic({
                  date: new Date(value.nativeEvent.timestamp!),
                  dateString: DateTime.fromMillis(
                    value.nativeEvent.timestamp!,
                  ).toFormat('dd-MM-yyyy'),
                });

                console.log(date);
                console.log('type', value.type);
              }}
            />
          </View>
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

  console.log(dateToPass);

  const weights = database
    .get<Weight>('weights')
    .query(Q.where('supabase_id', id), Q.where('date_string', dateToPass))
    .observeWithColumns(['weight', 'date_string']);

  return {
    weights: weights,
    // comments: post$.pipe(switchMap(post => post.comments.observe())),
  };
});

export default withDatabase(withModels(AddWeightScreen));

import {Q} from '@nozbe/watermelondb';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import {useNavigation} from '@react-navigation/native';
import {useAtom} from 'jotai';
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

export const AddWeightScreen = () => {
  const [weightInput, setWeightInput] = React.useState('');
  const [session] = useAtom(sessionAtom);
  const database = useDatabase();
  const navigation = useNavigation();

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
          Q.where('date', Q.gte(new Date().setHours(0, 0, 0, 0))),
        )
        .fetch();

      if (weightOnDate.length > 0) {
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

      await database.get<Weight>('weights').create(weight => {
        // @ts-ignore
        weight.profile.set(profile[0]);
        weight.weight = parseFloat(weightInput);
        weight.unit = 'kg';
        weight.date = new Date();
        weight.supabase_id = session?.user.id!;
      });

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
          <Button
            title="Click"
            onPress={async () => {
              const weightOnDate = await getWeightOnDate();
              console.log('weightOnDate', weightOnDate);
            }}
          />
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

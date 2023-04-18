import {useDatabase} from '@nozbe/watermelondb/hooks';
import React from 'react';
import {Alert, KeyboardAvoidingView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SecondaryButton} from '../../components/Button';
import {PrimaryTextInput} from '../../components/TextInput';
import {supabase} from '../../supabase';
import Profile from '../../watermelondb/model/Profile';

export const RegisterScreen = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const database = useDatabase();

  async function signInWithEmail() {
    const {error} = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    }
  }
  async function signUpWithEmail() {
    const {error: supabaseError, data} = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    console.log({supabaseError, data});

    if (data.user && data.user?.id) {
      await database.write(async () => {
        await database
          .get<Profile>('profiles')
          .create(profile => {
            profile.email = email;
            profile.name = name;
            profile.supabaseId = data.user!.id;
            profile.defaultUnit = 'kg';
            // });
          })
          .then(value => {
            console.log('saved', value);
          })
          .catch(error => {
            console.log('error', error);
          });
      });
    }

    if (data.user?.email) {
      signInWithEmail();
    }

    if (supabaseError) {
      Alert.alert(supabaseError.message);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={100}
        style={styles.flex}>
        <View style={[styles.flex, styles.paddingTen]}>
          <PrimaryTextInput
            onChangeText={text => setName(text)}
            value={name}
            placeholder="Name"
            autoCompleteType="name"
            label="Name"
          />

          <PrimaryTextInput
            onChangeText={text => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            label="Email"
          />
          <PrimaryTextInput
            onChangeText={text => setPassword(text)}
            value={password}
            placeholder="Password"
            label="Password"
            secureTextEntry={true}
          />
        </View>
        <View style={styles.paddingTen}>
          <SecondaryButton
            title="Register"
            onPress={() => {
              signUpWithEmail();
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  paddingTen: {
    padding: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

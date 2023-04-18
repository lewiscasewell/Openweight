import React, {useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';

import {PrimaryButton, SecondaryButton} from '../../components/Button';
import {PrimaryTextInput} from '../../components/TextInput';

import {supabase} from '../../supabase';

import {useNavigation} from '@react-navigation/native';
import {NoAuthStackNavigationProps} from '../../../App';
export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [, setLoading] = useState(false);
  const navigation = useNavigation<NoAuthStackNavigationProps>();

  async function signInWithEmail() {
    setLoading(true);
    console.log({email, password});
    const {error} = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    }

    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <PrimaryTextInput
          onChangeText={text => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          keyboardType="email-address"
          textContentType="emailAddress"
          label="Email"
        />
      </View>

      <View style={styles.verticallySpaced}>
        <PrimaryTextInput
          onChangeText={text => setPassword(text)}
          value={password}
          label="Password"
          secureTextEntry={true}
          placeholder="Password"
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <PrimaryButton title="Login" onPress={() => signInWithEmail()} />
      </View>
      <View style={styles.verticallySpaced}>
        <SecondaryButton
          title="Register"
          // disabled={loading}
          onPress={() => {
            navigation.navigate('Register');
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});

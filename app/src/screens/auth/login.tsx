import React, {useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {PrimaryButton, SecondaryButton} from '../../components/Button';
import {PrimaryTextInput} from '../../components/TextInput';
import {supabase} from '../../supabase';
import Profile from '../../watermelondb/model/Profile';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import Config from 'react-native-config';
import {useAtom} from 'jotai';
import {appLoadingAtom} from '../../atoms/appLoading.atom';

const baseUrl = Config.REACT_APP_BASE_URL;

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [hasSentEmail, setHasSentEmail] = useState(false);
  const [, setIsAppLoading] = useAtom(appLoadingAtom);
  const database = useDatabase();

  async function signInWithMagicLink() {
    const {error} = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: 'https://opencoach.app',
      },
    });

    if (error) {
      Alert.alert(error.message);
    } else {
      setHasSentEmail(true);
    }
  }

  async function signInWithToken() {
    const {data, error} = await supabase.auth.verifyOtp({
      token,
      email,
      type: 'magiclink',
    });

    if (error) {
      Alert.alert(error.message);
    }

    if (data.session?.access_token) {
      const response = await fetch(`${baseUrl}/api/profiles`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${data.session?.access_token}`,
        },
      });

      if (response.status === 404) {
        Alert.alert('Not Authorized');
        return;
      }
      if (!response.ok) {
        Alert.alert('Something went wrong');
        return;
      }

      const profile = await response.json();

      console.log('profile', profile);

      if (!profile) {
        Alert.alert('Something went wrong');
        return;
      }

      if (profile) {
        setIsAppLoading({isAppLoading: true});
        // delete all profiles from the database
        await database.write(async () => {
          await database.get('profiles').query().destroyAllPermanently();
        });
        // TODO: eventually do the same for weights

        await database.write(async () => {
          await database.get('weights').query().destroyAllPermanently();
        });

        await database
          .write(async () => {
            await database
              .get<Profile>('profiles')
              .create(newProfile => {
                newProfile._raw._status = 'synced';
                newProfile._raw._changed = '';
                newProfile._raw.id = profile.id;
                newProfile.name = profile.name;
                newProfile.supabaseUserId = data.user!.id;
                newProfile.createdAt = profile.created_at;
                newProfile.updatedAt = profile.updated_at;
                newProfile.gender = profile.gender;
                newProfile.height = profile.height;
                newProfile.heightUnit = profile.height_unit;
                newProfile.activityLevel = profile.activity_level;
                newProfile.targetWeight = profile.target_weight;
                newProfile.targetWeightUnit = profile.target_weight_unit;
                newProfile.dobAt = profile.dob_at;
              })
              .then(result => {
                console.log('create', result);
              });
          })
          .then(() => {
            setIsAppLoading({isAppLoading: false});
          });

        setIsAppLoading({isAppLoading: false});
      }
    }
  }

  return (
    <View style={styles.container}>
      {hasSentEmail ? (
        <>
          <View style={styles.verticallySpaced}>
            <PrimaryTextInput
              onChangeText={text => setToken(text)}
              value={token}
              label="Your 6 digit code"
              placeholder="123456"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.verticallySpaced}>
            <SecondaryButton
              title="Login"
              // disabled={loading}
              onPress={() => {
                signInWithToken();
              }}
            />
          </View>
        </>
      ) : (
        <>
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

          <View style={[styles.verticallySpaced, styles.mt20]}>
            <PrimaryButton
              title="Login with email"
              onPress={() => signInWithMagicLink()}
            />
          </View>
        </>
      )}
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

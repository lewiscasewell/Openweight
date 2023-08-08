import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {PrimaryButton, SecondaryButton} from '../components/Button';
import {PrimaryTextInput} from '../components/TextInput';
import {supabase} from '../supabase';
import Profile from '../watermelondb/model/Profile';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import Config from 'react-native-config';
import {useAtom} from 'jotai';
import {appLoadingAtom} from '../atoms/appLoading.atom';
import Weight from '../watermelondb/model/Weight';
import {sync} from '../watermelondb/sync';
import Animated, {FadeInDown, FadeOutUp, Layout} from 'react-native-reanimated';

const baseUrl = Config.REACT_APP_BASE_URL;

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [hasSentEmail, setHasSentEmail] = useState(false);
  const [, setIsAppLoading] = useAtom(appLoadingAtom);
  const [loginLoading, setLoginLoading] = useState(false);
  const database = useDatabase();

  useEffect(() => {
    setIsAppLoading({isAppLoading: false});
  }, [setIsAppLoading]);

  async function signInWithMagicLink() {
    setLoginLoading(true);
    const {error} = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: {
          app: 'weight-tracker',
        },
      },
    });

    if (error) {
      Alert.alert(error.message);
      setLoginLoading(false);
    } else {
      setHasSentEmail(true);
      setLoginLoading(false);
    }
  }

  async function signInWithToken() {
    setIsAppLoading({isAppLoading: true});
    const {data, error} = await supabase.auth.verifyOtp({
      token,
      email,
      type: 'email',
    });

    if (error) {
      Alert.alert(error.message);
      setIsAppLoading({isAppLoading: false});
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
        setIsAppLoading({isAppLoading: false});
        return supabase.auth.signOut();
      }
      if (!response.ok) {
        Alert.alert('Something went wrong');
        setIsAppLoading({isAppLoading: false});
        return supabase.auth.signOut();
      }

      const {profile} = await response.json();

      const Profiles = database.get<Profile>('profiles');
      const Weights = database.get<Weight>('weights');

      if (!profile) {
        Alert.alert('Something went wrong');
        setIsAppLoading({isAppLoading: false});
        return supabase.auth.signOut();
      }

      if (profile) {
        // delete all profiles from the database
        await database.write(async () => {
          await Profiles.query()
            .destroyAllPermanently()
            .then(() => console.log('destroyed all profile'));
        });
        // TODO: eventually do the same for weights
        await database.write(async () => {
          await Weights.query()
            .destroyAllPermanently()
            .then(() => console.log('destroyed all weights'));
        });

        try {
          await database.write(async () => {
            await Profiles.create(newProfile => {
              newProfile._raw._status = 'synced';
              newProfile._raw._changed = '';
              newProfile._raw.id = profile.id;
              newProfile.name = profile.name;
              newProfile.supabaseUserId = profile.supabase_user_id;
              newProfile.createdAt = profile.created_at;
              newProfile.updatedAt = profile.updated_at;
              newProfile.gender = profile.gender;
              newProfile.height = profile.height;
              newProfile.heightUnit = profile.height_unit;
              newProfile.activityLevel = profile.activity_level;
              newProfile.targetWeight = profile.target_weight;
              newProfile.targetWeightUnit = profile.target_weight_unit;
              newProfile.dobAt = profile.dob_at;
            });
          });
        } catch (e) {
          console.log('error creating profile', e);
          setIsAppLoading({isAppLoading: false});
        }
        sync()
          .then(() => {
            setIsAppLoading({isAppLoading: false});
          })
          .catch(e => {
            setIsAppLoading({isAppLoading: false});
            console.log('error syncing', e);
          });
      }
    }
  }

  return (
    <View style={styles.container}>
      {hasSentEmail ? (
        <>
          <Animated.View
            style={styles.verticallySpaced}
            entering={FadeInDown}
            layout={Layout.springify().duration(200)}>
            <PrimaryTextInput
              onChangeText={text => setToken(text)}
              value={token}
              label="Please enter your 6 digit code sent to your email"
              placeholder="123456"
              keyboardType="numeric"
              maxLength={6}
            />
          </Animated.View>
          <Animated.View
            style={styles.verticallySpaced}
            entering={FadeInDown.delay(200)}
            exiting={FadeOutUp.delay(200)}
            layout={Layout.springify().duration(200).delay(200)}>
            <SecondaryButton
              title="Login"
              onPress={() => {
                if (token.length === 6) {
                  signInWithToken();
                }
              }}
            />
          </Animated.View>
          <Animated.View
            style={styles.verticallySpaced}
            entering={FadeInDown.delay(400)}
            exiting={FadeOutUp.delay(400)}
            layout={Layout.springify().duration(200).delay(400)}>
            <PrimaryButton
              title="Re-enter email"
              onPress={() => {
                setHasSentEmail(false);
              }}
            />
          </Animated.View>
        </>
      ) : (
        <>
          <Animated.View
            style={[styles.verticallySpaced, styles.mt20]}
            entering={FadeInDown}
            layout={Layout.springify().duration(200)}>
            <PrimaryTextInput
              onChangeText={text => setEmail(text)}
              value={email}
              placeholder="email@address.com"
              keyboardType="email-address"
              textContentType="emailAddress"
              label="Email"
            />
          </Animated.View>
          <Animated.View
            style={[styles.verticallySpaced, styles.mt20]}
            entering={FadeInDown.delay(200)}
            exiting={FadeOutUp.delay(200)}
            layout={Layout.springify().duration(200).delay(200)}>
            <PrimaryButton
              title="Login with email"
              loading={loginLoading}
              onPress={() => signInWithMagicLink()}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 120,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
    gap: 10,
  },
  mt20: {
    marginTop: 20,
  },
});

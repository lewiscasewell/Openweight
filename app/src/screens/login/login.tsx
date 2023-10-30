import React, {useEffect, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {supabase} from '../../supabase';
import Profile from '../../watermelondb/model/Profile';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import Config from 'react-native-config';
import {useAtom, useAtomValue} from 'jotai';
import {appStateAtom} from '../../atoms/appLoading.atom';
import Weight from '../../watermelondb/model/Weight';
import {sync} from '../../watermelondb/sync';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {colors} from '../../styles/theme';
import {loginFlowAtom} from '../../atoms/login-flow-state.atom';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';
import {Dimensions} from 'react-native';
import EmailScreen from './EmailScreen';
import VerifyOTP from './VerifyOtp';

const {width} = Dimensions.get('window');
const baseUrl = Config.REACT_APP_BASE_URL;

const LandingScreen = () => {
  const [, setLoginFlowState] = useAtom(loginFlowAtom);

  const handleContinueWithEmail = () => {
    setLoginFlowState(prev => ({...prev, status: 'email-entry'}));
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Animated.Text
          entering={FadeInUp.duration(300).delay(100).springify()}
          style={styles.logo}>
          Openweight.
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.duration(300).delay(200).springify()}
          style={styles.slogan}>
          Track your weight, by Opencoach.
        </Animated.Text>
      </View>
      <View style={styles.touchablesContainer}>
        <Animated.View entering={FadeInUp.duration(300).delay(300).springify()}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.touchable}
            onPress={handleContinueWithEmail}>
            <Text style={styles.touchableText}>Continue with email</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [hasSentEmail, setHasSentEmail] = useState(false);
  const [, setIsAppLoading] = useAtom(appStateAtom);
  const [loginLoading, setLoginLoading] = useState(false);
  const database = useDatabase();
  const loginFlowState = useAtomValue(loginFlowAtom);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* {hasSentEmail ? (
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
              title="Send code"
              loading={loginLoading}
              onPress={() => signInWithMagicLink()}
            />
          </Animated.View>
        </>
      )} */}
      {loginFlowState.status === 'landing' && <LandingScreen />}
      {loginFlowState.status === 'email-entry' && <EmailScreen />}
      {loginFlowState.status === 'otp-verification' && <VerifyOTP />}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: StaticSafeAreaInsets.safeAreaInsetsTop,
    marginBottom: StaticSafeAreaInsets.safeAreaInsetsBottom,
  },
  logo: {
    fontSize: 40,
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoContainer: {
    flex: 1,
    paddingTop: 120,
  },
  slogan: {
    fontSize: 20,
    color: colors.grey[400],
    textAlign: 'center',
  },
  touchablesContainer: {
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width,
  },
  touchable: {
    backgroundColor: colors['picton-blue'][600],
    padding: 14,
    borderRadius: 12,
  },
  touchableText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

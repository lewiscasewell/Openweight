import React from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Header} from '../../components/Header';
import {
  initialLoginFlowState,
  loginFlowAtom,
} from '../../atoms/login-flow-state.atom';
import {useAtom} from 'jotai';
import {colors} from '../../styles/theme';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {ActivityIndicator} from 'react-native';
import {supabase} from '../../supabase';
import {useDatabase} from '@nozbe/watermelondb/hooks';
import Config from 'react-native-config';
import Profile from '../../watermelondb/model/Profile';
import {sync} from '../../watermelondb/sync';
import Animated, {FadeInUp} from 'react-native-reanimated';

const {width} = Dimensions.get('window');
const baseUrl = Config.REACT_APP_BASE_URL;
const VerifyOTP: React.FC = () => {
  const [loginFlowState, setLoginFlowState] = useAtom(loginFlowAtom);
  const [otp, setOtp] = React.useState<string>('');
  const inputRef = React.useRef<TextInput>(null);
  const database = useDatabase();

  const {credential, credentialType} = loginFlowState;

  const backButtonCallback = () => {
    setLoginFlowState(prev => ({
      ...prev,
      status: 'email-entry',
      isLoading: false,
    }));
  };

  const saveProfileData = async ({access_token}: {access_token: string}) => {
    setLoginFlowState(prev => ({...prev, isFetchingProfileData: true}));
    const response = await fetch(`${baseUrl}/api/profiles`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    console.log('response', response);

    if (response.status === 404) {
      Alert.alert('Not Authorized');
      setLoginFlowState(prev => ({...prev, isFetchingProfileData: false}));
      return supabase.auth.signOut();
    }
    if (!response.ok) {
      Alert.alert('Something went wrong');
      setLoginFlowState(prev => ({...prev, isFetchingProfileData: false}));
      return supabase.auth.signOut();
    }

    const {profile} = await response.json();

    console.log('profile', profile);

    const Profiles = database.get<Profile>('profiles');

    if (!profile) {
      Alert.alert('Something went wrong');
      setLoginFlowState(prev => ({...prev, isFetchingProfileData: false}));
      return supabase.auth.signOut();
    }

    try {
      await database.write(async () => {
        await Profiles.query().destroyAllPermanently();
      });
    } catch (error) {
      Alert.alert('Something went wrong');
      setLoginFlowState(prev => ({...prev, isFetchingProfileData: false}));
      return supabase.auth.signOut();
    }

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
    } catch (error) {
      Alert.alert('Something went wrong');
      setLoginFlowState(prev => ({...prev, isFetchingProfileData: false}));
      return supabase.auth.signOut();
    }

    sync()
      .then(() => {
        setLoginFlowState(initialLoginFlowState);
      })
      .catch(e => {
        console.log(e);
        Alert.alert('Something went wrong');
        setLoginFlowState(initialLoginFlowState);
        return supabase.auth.signOut();
      });
  };

  const verifyOtp = async (latestOtp: string) => {
    if (!credential) {
      Alert.alert('Something went wrong');
      return;
    }
    setLoginFlowState(prev => ({...prev, isLoading: true}));
    if (credential === '+44123' || credential.toLowerCase() === 'w@w.com') {
      const {data, error} = await supabase.auth.verifyOtp({
        email: 'lewiscasewell@hotmail.co.uk',
        token: latestOtp,
        type: 'email',
      });

      if (error) {
        Alert.alert('Incorrect code, please try again');
        console.log(error);
        setLoginFlowState(prev => ({
          ...prev,
          isLoading: false,
        }));
        setOtp('');
        return;
      }

      if (data.session?.access_token) {
        try {
          await saveProfileData({access_token: data.session?.access_token});
          setLoginFlowState(prev => ({
            ...prev,
            isLoading: false,
          }));
        } catch (e) {
          console.log(e);
          Alert.alert(
            'Something fetching your profile data',
            'Please try again, or contact support',
          );
          setLoginFlowState(prev => ({
            ...prev,
            isLoading: false,
            status: 'email-entry',
          }));
          setOtp('');
          await supabase.auth.signOut();
        }
      }
    } else if (credentialType === 'email') {
      const {data, error} = await supabase.auth.verifyOtp({
        email: credential,
        token: latestOtp,
        type: 'email',
      });
      if (error) {
        console.log(error);
        Alert.alert('Incorrect code, please try again');
        setLoginFlowState(prev => ({
          ...prev,
          isLoading: false,
        }));
        setOtp('');
        return;
      }

      if (data.session?.access_token) {
        try {
          await saveProfileData({access_token: data.session?.access_token});
          setLoginFlowState(prev => ({
            ...prev,
            isLoading: false,
          }));
        } catch (e) {
          console.log(e);
          await supabase.auth.signOut();
          Alert.alert(
            'Something fetching your profile data',
            'Please try again, or contact support',
          );
          setLoginFlowState(prev => ({
            ...prev,
            isLoading: false,
            status: 'email-entry',
          }));
          setOtp('');
        }
      }

      if (loginFlowState.isLoading) {
        setLoginFlowState(prev => ({
          ...prev,
          isLoading: false,
          status: 'email-entry',
        }));
      }
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.duration(300).delay(100).springify()}>
        <Header
          title={`Login with ${loginFlowState.credentialType}`}
          backButtonCallback={backButtonCallback}
        />
      </Animated.View>
      <Animated.View entering={FadeInUp.duration(300).delay(200).springify()}>
        <Text style={styles.subtitle}>
          Please enter the 6 digit code that was sent to your{' '}
          {loginFlowState.credentialType}. If you did not receive a code, please
          try again.
        </Text>
      </Animated.View>
      <TextInput
        ref={inputRef}
        style={{
          width: 0,
          height: 0,
          color: colors.white,
        }}
        keyboardAppearance="dark"
        keyboardType="number-pad"
        placeholderTextColor={colors.grey[500]}
        autoFocus={true}
        maxLength={6}
        value={otp}
        onChangeText={text => {
          setOtp(text);
          if (text.length === 6) {
            verifyOtp(text);
          }
        }}
      />
      <Animated.View
        entering={FadeInUp.duration(300).delay(300).springify()}
        style={styles.inputContainer}>
        {Array.from({length: 6}).map((_, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={1}
            onPress={() => {
              inputRef.current?.focus();
            }}>
            <TextInput
              style={[
                styles.input,
                index < otp.length && {
                  borderColor: colors['picton-blue'][600],
                  borderWidth: 2,
                },
                index === otp.length && {
                  borderColor: colors['picton-blue'][400],
                  backgroundColor: colors['picton-blue'][950],
                  borderWidth: 2,
                },
              ]}
              value={otp?.slice(index, index + 1)}
              keyboardType="number-pad"
              maxLength={1}
              placeholder="0"
              placeholderTextColor={colors.grey[500]}
              editable={false}
            />
          </TouchableOpacity>
        ))}
      </Animated.View>
      <Animated.View
        entering={FadeInUp.duration(300).delay(400).springify()}
        style={{
          bottom: 0,
          position: 'absolute',
          width,
          padding: 10,
        }}>
        <TouchableOpacity
          style={[
            styles.touchable,
            otp.length < 6 && styles.disabledTouachable,
          ]}
          onPress={() => verifyOtp(otp)}
          disabled={loginFlowState.isLoading || otp.length < 6}
          activeOpacity={0.8}>
          {loginFlowState.isLoading ? (
            <ActivityIndicator />
          ) : (
            <Text
              style={[
                styles.touchableText,
                otp.length < 6 && styles.disabledTouachableText,
              ]}>
              Send code
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    padding: 10,
  },
  subtitle: {
    color: colors.grey[400],
    fontSize: 16,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 40,
    justifyContent: 'center',
  },
  input: {
    padding: 10,
    width: 44,
    textAlign: 'center',
    backgroundColor: colors.black[900],
    borderRadius: 10,
    fontSize: 30,
    color: colors.white,
  },
  disabledTouachable: {
    backgroundColor: colors.grey[900],
  },
  disabledTouachableText: {
    color: colors.grey[700],
  },
  touchable: {
    backgroundColor: colors.black[900],
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  touchableText: {
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default VerifyOTP;

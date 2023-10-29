import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {colors} from '../../styles/theme';
// import {Header} from '../../../components/Header';

import {useAtom} from 'jotai';
import {supabase} from '../../supabase';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {loginFlowAtom} from '../../atoms/login-flow-state.atom';
import {Header} from '../../components/Header';

const {width} = Dimensions.get('window');

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type EmailInput = z.infer<typeof emailSchema>;

const EmailScreen = () => {
  const [loginFlowState, setLoginFlowState] = useAtom(loginFlowAtom);

  const form = useForm({
    defaultValues: {email: ''},
    resolver: zodResolver(emailSchema),
  });

  const signInMobile = async (emailData: EmailInput) => {
    setLoginFlowState(prev => ({
      ...prev,
      isLoading: true,
      credential: emailData.email,
      credentialType: 'email',
    }));
    if (emailData.email?.toLowerCase() === 'w@w.com') {
      const {data, error} = await supabase.auth.signInWithOtp({
        email: 'lewiscasewell@hotmail.co.uk',
        options: {
          shouldCreateUser: true,
        },
      });

      console.log(data, error);

      if (error) {
        Alert.alert('Sorry', 'We were not able to log you in');
        console.log(error);
        setLoginFlowState(prev => ({...prev, isLoading: false}));
        return;
      }
      setLoginFlowState(prev => ({
        ...prev,
        isLoading: false,
        status: 'otp-verification',
      }));
    } else {
      const {data, error} = await supabase.auth.signInWithOtp({
        email: emailData.email,
        options: {
          shouldCreateUser: true,
        },
      });

      console.log(data, error);

      if (error) {
        Alert.alert('Sorry', 'We were not able to log you in');
        console.log(error);
        setLoginFlowState(prev => ({...prev, isLoading: false}));
        return;
      }
      setLoginFlowState(prev => ({
        ...prev,
        isLoading: false,
        status: 'otp-verification',
      }));
    }
  };

  const backButtonCallback = () => {
    setLoginFlowState(prev => ({...prev, status: 'landing', isLoading: false}));
  };

  const onSendCode = () => {
    form.handleSubmit(signInMobile, error =>
      console.log(error.email?.message),
    )();
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.duration(300).delay(100).springify()}>
        <Header
          title="Login with email"
          backButtonCallback={backButtonCallback}
        />
      </Animated.View>
      <Animated.View entering={FadeInUp.duration(300).delay(200).springify()}>
        <Text style={styles.subtitle}>
          Please enter your email address to receive your 6 digit one time
          passcode.
        </Text>
      </Animated.View>
      <Animated.View
        entering={FadeInUp.duration(300).delay(300).springify()}
        style={styles.mobileInputContainer}>
        <TextInput
          style={styles.emailTextInput}
          keyboardType="email-address"
          placeholder={'your@email.com'}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardAppearance="dark"
          placeholderTextColor={colors.grey[400]}
          onChangeText={text => {
            form.setValue('email', text, {
              shouldDirty: true,
            });
          }}
        />
      </Animated.View>
      <View style={{paddingTop: 4}}>
        {form.formState.errors.email && (
          <Text style={{color: colors.error}}>
            {form.formState.errors.email.message}
          </Text>
        )}
      </View>
      <Animated.View
        entering={FadeInUp.duration(300).delay(400).springify()}
        style={{
          bottom: 0,
          position: 'absolute',
          width,
          padding: 10,
        }}>
        <TouchableOpacity
          style={styles.touchable}
          disabled={loginFlowState.isLoading}
          onPress={() => onSendCode()}
          activeOpacity={0.8}>
          {loginFlowState.isLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.touchableText}>Send code</Text>
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
  title: {
    color: colors.white,
    fontSize: 30,
  },
  subtitle: {
    color: colors.grey[400],
    fontSize: 16,
    marginTop: 8,
  },
  mobileInputContainer: {
    flexDirection: 'row',
    marginTop: 40,
  },
  countryCodeContainer: {
    backgroundColor: colors.black[900],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 12,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  countryCodeText: {
    fontSize: 22,
    color: colors.white,
  },
  emailTextInput: {
    backgroundColor: colors.black[900],
    fontSize: 22,
    color: colors.white,
    padding: 12,
    borderRadius: 14,
    flex: 1,
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

export default EmailScreen;
